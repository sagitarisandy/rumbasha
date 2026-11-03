import { and, asc, count, desc, eq, ilike, type SQL } from "drizzle-orm";
import { Play, Plus } from "lucide-react";
import { deleteEntity } from "@/app/actions/admin";
import { AdminHeader } from "@/components/admin/shell";
import { Pager, PER_PAGE, StatusDot, Table, Td, Th, TypePill, pageOf, urlWith } from "@/components/admin/table";
import { RowActions, Toolbar } from "@/components/admin/toolbar";
import { MathText } from "@/components/app/math-text";
import { LinkButton } from "@/components/ui/button";
import { Segmented } from "@/components/ui/tabs";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { questions, videos } from "@/lib/db/schema";
import { duration, num } from "@/lib/format";
import { RUMATH_JENIS } from "@/lib/rumath";

type Search = { tab?: string; q?: string; jenis?: string; jenjang?: string; hal?: string };

export default async function AdminRumathPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireStaff();
  const sp = await searchParams;
  const page = pageOf(sp.hal);
  const tab = sp.tab === "soal" ? "soal" : "video";
  const db = await getDb();
  const vWhere: SQL[] = [];
  if (sp.q) vWhere.push(ilike(videos.title, `%${sp.q}%`));
  if (sp.jenis) vWhere.push(eq(videos.bidang, sp.jenis));
  if (sp.jenjang === "SD" || sp.jenjang === "SMP") vWhere.push(eq(videos.jenjang, sp.jenjang));
  const qWhere: SQL[] = [eq(questions.type, "isian"), eq(questions.tag, "RUMATH")];
  if (sp.q) qWhere.push(ilike(questions.prompt, `%${sp.q}%`));
  if (sp.jenis) qWhere.push(eq(questions.bab, sp.jenis));
  const [[{ nv }], [{ nq }], vids, soal] = await Promise.all([
    db.select({ nv: count() }).from(videos).where(and(...vWhere)),
    db.select({ nq: count() }).from(questions).where(and(...qWhere)),
    tab === "video" ? db.select().from(videos).where(and(...vWhere)).orderBy(asc(videos.bidang), asc(videos.position)).limit(PER_PAGE).offset((page - 1) * PER_PAGE) : [],
    tab === "soal" ? db.select().from(questions).where(and(...qWhere)).orderBy(desc(questions.id)).limit(PER_PAGE).offset((page - 1) * PER_PAGE) : [],
  ]);

  return (
    <>
      <AdminHeader
        sub="Video materi dan soal isian hitung cepat."
        actions={
          <>
            <LinkButton href="/admin/questions/new?tipe=isian" variant="ghost">
              <Plus /> Tambah soal
            </LinkButton>
            <LinkButton href="/admin/rumath/video/new">
              <Plus /> Tambah video
            </LinkButton>
          </>
        }
      />
      <Segmented
        className="mb-4 max-w-[420px]"
        value={tab}
        items={[
          { value: "video", label: `Video materi ${nv}`, href: urlWith("/admin/rumath", { q: sp.q, jenis: sp.jenis }, {}) },
          { value: "soal", label: `Soal isian ${nq}`, href: urlWith("/admin/rumath", { q: sp.q, jenis: sp.jenis }, { tab: "soal" }) },
        ]}
      />
      <Toolbar
        placeholder={tab === "video" ? "Cari judul…" : "Cari soal…"}
        filters={[
          { key: "jenis", label: "Jenis", options: RUMATH_JENIS.map((j) => ({ value: j.name, label: j.name })) },
          { key: "jenjang", label: "Jenjang", options: [{ value: "SD", label: "SD" }, { value: "SMP", label: "SMP" }] },
        ]}
      />
      {tab === "video" ? (
        <Table>
          <thead>
            <tr>
              <Th>Judul</Th>
              <Th>Jenis</Th>
              <Th>Jenjang</Th>
              <Th>Urutan</Th>
              <Th>Durasi</Th>
              <Th>Ditonton</Th>
              <Th>Status</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {vids.map((v) => (
              <tr key={v.id} className="hover:bg-sidebar">
                <Td>
                  <span className="flex items-center gap-3">
                    <span className="grid h-6 w-8 place-items-center rounded-md bg-ink text-white">
                      <Play className="size-3 fill-current" />
                    </span>
                    <span className="font-semibold">{v.title}</span>
                  </span>
                </Td>
                <Td>
                  <TypePill>{v.bidang}</TypePill>
                </Td>
                <Td className="text-xs font-semibold">{v.jenjang}</Td>
                <Td className="text-ink-2">Video {v.position}</Td>
                <Td className="text-ink-2">{duration(v.durationSec)}</Td>
                <Td className="text-ink-2">{num(v.views)}×</Td>
                <Td>{v.status === "publish" ? <StatusDot tone="green">Publish</StatusDot> : <StatusDot tone="grey">Draft</StatusDot>}</Td>
                <Td>
                  <RowActions what={`video “${v.title}”`} editHref={`/admin/rumath/video/${v.id}`} onDelete={deleteEntity.bind(null, "video", v.id)} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Kode</Th>
              <Th>Soal</Th>
              <Th>Jenis</Th>
              <Th>Kunci</Th>
              <Th>Level</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {soal.map((q) => (
              <tr key={q.id} className="hover:bg-sidebar">
                <Td className="text-ink-2">R-{1000 + q.id}</Td>
                <Td>
                  <MathText text={q.prompt} />
                </Td>
                <Td>
                  <TypePill>{q.bab}</TypePill>
                </Td>
                <Td className="font-semibold">{q.answer}</Td>
                <Td>
                  <StatusDot tone={q.level === "Mudah" ? "green" : q.level === "Sedang" ? "orange" : "red"}>{q.level}</StatusDot>
                </Td>
                <Td>
                  <RowActions what={`soal R-${1000 + q.id}`} editHref={`/admin/questions/${q.id}`} onDelete={deleteEntity.bind(null, "soal", q.id)} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Pager total={tab === "video" ? nv : nq} page={page} perPage={PER_PAGE} href={(p) => urlWith("/admin/rumath", sp, { hal: p })} />
    </>
  );
}
