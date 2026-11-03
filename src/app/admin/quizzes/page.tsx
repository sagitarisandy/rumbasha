import { and, count, desc, eq, ilike, inArray, isNull, notLike, or, type SQL } from "drizzle-orm";
import { Plus } from "lucide-react";
import { deleteEntity } from "@/app/actions/admin";
import { AdminHeader } from "@/components/admin/shell";
import { Pager, PER_PAGE, StatusDot, Table, Td, Th, TypePill, pageOf, urlWith } from "@/components/admin/table";
import { RowActions, Toolbar } from "@/components/admin/toolbar";
import { LinkButton } from "@/components/ui/button";
import { Segmented } from "@/components/ui/tabs";
import { MAPEL } from "@/lib/catalog";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { quizzes } from "@/lib/db/schema";
import { KIND_LABEL } from "@/lib/queries/hasil";
import { AccessCodeCell } from "./code-dialog";

type Search = { q?: string; tipe?: string; jenjang?: string; mapel?: string; status?: string; hal?: string };
type Kind = "daily" | "ujikom" | "tryout" | "rumath";

function statusOf(q: { status: string; startsAt: Date | null; endsAt: Date | null; kind: string }, now: Date) {
  if (q.status === "draft") return ["grey", "Draft"] as const;
  if (q.kind === "daily" || q.kind === "rumath" || !q.startsAt) return ["green", "Publish"] as const;
  if (q.endsAt && q.endsAt < now) return ["grey", "Selesai"] as const;
  if (q.startsAt <= now) return ["blue", "Berjalan"] as const;
  return ["orange", "Terjadwal"] as const;
}

export default async function AdminQuizPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireStaff();
  const sp = await searchParams;
  const page = pageOf(sp.hal);
  const db = await getDb();
  // Personal Daily Quiz / RUMATH sets generated for a siswa are not managed here.
  const base = and(or(isNull(quizzes.createdBy), notLike(quizzes.createdBy, "auto:%")), inArray(quizzes.kind, ["daily", "ujikom", "tryout", "rumath"]))!;
  const where: SQL[] = [base];
  const tab = (["daily", "ujikom", "tryout", "rumath"] as const).includes(sp.tipe as Kind) ? (sp.tipe as Kind) : null;
  if (tab) where.push(eq(quizzes.kind, tab));
  if (sp.q) where.push(ilike(quizzes.title, `%${sp.q}%`));
  if (sp.jenjang === "SD" || sp.jenjang === "SMP") where.push(eq(quizzes.jenjang, sp.jenjang));
  if (sp.mapel) where.push(eq(quizzes.subject, sp.mapel));
  if (sp.status === "draft" || sp.status === "aktif" || sp.status === "selesai") where.push(eq(quizzes.status, sp.status));
  const [[{ n }], rows] = await Promise.all([
    db.select({ n: count() }).from(quizzes).where(and(...where)),
    db.select().from(quizzes).where(and(...where)).orderBy(desc(quizzes.id)).limit(PER_PAGE).offset((page - 1) * PER_PAGE),
  ]);
  const now = new Date();
  const tabHref = (v?: string) => urlWith("/admin/quizzes", { q: sp.q }, { tipe: v });

  return (
    <>
      <AdminHeader
        sub="Rakit paket soal dan atur jadwal. Uji Kom dan Tryout butuh kode akses."
        actions={
          <LinkButton href="/admin/quizzes/new">
            <Plus /> Buat quiz
          </LinkButton>
        }
      />
      <Segmented
        className="mb-4 max-w-[600px]"
        value={tab ?? "semua"}
        items={[
          { value: "semua", label: "Semua", href: tabHref() },
          { value: "daily", label: "Daily Quiz", href: tabHref("daily") },
          { value: "ujikom", label: "Uji Kom", href: tabHref("ujikom") },
          { value: "tryout", label: "Tryout", href: tabHref("tryout") },
          { value: "rumath", label: "RUMATH", href: tabHref("rumath") },
        ]}
      />
      <Toolbar
        placeholder="Cari nama quiz…"
        filters={[
          { key: "jenjang", label: "Jenjang", options: [{ value: "SD", label: "SD" }, { value: "SMP", label: "SMP" }] },
          { key: "mapel", label: "Mapel", options: ["Semua", ...MAPEL].map((m) => ({ value: m, label: m === "Semua" ? "Semua mapel" : m })) },
          { key: "status", label: "Status", options: [{ value: "aktif", label: "Aktif" }, { value: "draft", label: "Draft" }, { value: "selesai", label: "Selesai" }] },
        ]}
      />
      <Table>
        <thead>
          <tr>
            <Th>Nama quiz</Th>
            <Th>Tipe</Th>
            <Th>Mapel</Th>
            <Th>Jenjang</Th>
            <Th>Isi</Th>
            <Th>Kode akses</Th>
            <Th>Status</Th>
            <Th className="text-right">Aksi</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((q) => {
            const [tone, label] = statusOf(q, now);
            return (
              <tr key={q.id} className="hover:bg-sidebar">
                <Td className="max-w-[240px] font-semibold">{q.title}</Td>
                <Td>
                  <TypePill>{KIND_LABEL[q.kind]}</TypePill>
                </Td>
                <Td className="text-ink-2">{q.subject === "Semua" ? "Semua mapel" : q.subject}</Td>
                <Td className="text-ink-2">{q.jenjang}</Td>
                <Td className="whitespace-nowrap text-ink-2">
                  {q.questionIds.length} soal · {q.durationMin} mnt
                </Td>
                <Td>{q.kind === "ujikom" || q.kind === "tryout" ? <AccessCodeCell quizId={q.id} code={q.accessCode} title={q.title} /> : <span className="text-ink-2">Otomatis</span>}</Td>
                <Td>
                  <StatusDot tone={tone}>{label}</StatusDot>
                </Td>
                <Td>
                  <RowActions what={`quiz “${q.title}”`} editHref={`/admin/quizzes/${q.id}`} onDelete={deleteEntity.bind(null, "quiz", q.id)} />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Pager total={n} page={page} perPage={PER_PAGE} href={(p) => urlWith("/admin/quizzes", sp, { hal: p })} />
    </>
  );
}
