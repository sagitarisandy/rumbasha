import { and, count, desc, eq, ilike, isNull, ne, or, type SQL } from "drizzle-orm";
import { Plus } from "lucide-react";
import { deleteEntity } from "@/app/actions/admin";
import { AdminHeader } from "@/components/admin/shell";
import { Pager, PER_PAGE, StatusDot, Table, Td, Th, TypePill, pageOf, urlWith } from "@/components/admin/table";
import { RowActions, Toolbar } from "@/components/admin/toolbar";
import { MathText } from "@/components/app/math-text";
import { LinkButton } from "@/components/ui/button";
import { Segmented } from "@/components/ui/tabs";
import { MAPEL } from "@/lib/catalog";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { questions, quizzes } from "@/lib/db/schema";
import { ImportSoalButton } from "./import-dialog";

type Search = { q?: string; tipe?: string; mapel?: string; jenjang?: string; level?: string; hal?: string };
const KIND = { daily: "Daily Quiz", ujikom: "Uji Kom", tryout: "Tryout", rumath: "RUMATH", trial: "Trial" } as const;

export default async function BankSoalPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireStaff();
  const sp = await searchParams;
  const page = pageOf(sp.hal);
  const db = await getDb();
  // Auto-generated RUMATH drills are not part of the curated bank.
  const base = or(isNull(questions.tag), ne(questions.tag, "RUMATH-auto"))!;
  const where: SQL[] = [base];
  if (sp.tipe === "pg" || sp.tipe === "isian") where.push(eq(questions.type, sp.tipe));
  if (sp.q) where.push(ilike(questions.prompt, `%${sp.q}%`));
  if (sp.mapel) where.push(eq(questions.subject, sp.mapel));
  if (sp.jenjang === "SD" || sp.jenjang === "SMP") where.push(eq(questions.jenjang, sp.jenjang));
  if (sp.level === "Mudah" || sp.level === "Sedang" || sp.level === "Sulit") where.push(eq(questions.level, sp.level));
  const [[{ n }], [{ all }], [{ pg }], rows, qz] = await Promise.all([
    db.select({ n: count() }).from(questions).where(and(...where)),
    db.select({ all: count() }).from(questions).where(base),
    db.select({ pg: count() }).from(questions).where(and(base, eq(questions.type, "pg"))),
    db.select().from(questions).where(and(...where)).orderBy(desc(questions.id)).limit(PER_PAGE).offset((page - 1) * PER_PAGE),
    db.select({ kind: quizzes.kind, ids: quizzes.questionIds }).from(quizzes),
  ]);
  const usedIn = new Map<number, Set<string>>();
  for (const q of qz) for (const id of q.ids) (usedIn.get(id) ?? usedIn.set(id, new Set()).get(id)!).add(KIND[q.kind]);
  const tab = sp.tipe === "pg" || sp.tipe === "isian" ? sp.tipe : "semua";

  return (
    <>
      <AdminHeader
        sub="Soal untuk Daily Quiz, Uji Kom, Tryout, dan RUMATH."
        actions={
          <>
            <ImportSoalButton />
            <LinkButton href="/admin/bank-soal/tambah">
              <Plus /> Tambah soal
            </LinkButton>
          </>
        }
      />
      <Segmented
        className="mb-4 max-w-[560px]"
        value={tab}
        items={[
          { value: "semua", label: `Semua ${all}`, href: urlWith("/admin/bank-soal", sp, { tipe: undefined, hal: undefined }) },
          { value: "pg", label: `Pilihan ganda ${pg}`, href: urlWith("/admin/bank-soal", sp, { tipe: "pg", hal: undefined }) },
          { value: "isian", label: `Isian ${all - pg}`, href: urlWith("/admin/bank-soal", sp, { tipe: "isian", hal: undefined }) },
        ]}
      />
      <Toolbar
        placeholder="Cari teks soal…"
        filters={[
          { key: "mapel", label: "Mapel", options: MAPEL.map((m) => ({ value: m, label: m })) },
          { key: "jenjang", label: "Jenjang", options: [{ value: "SD", label: "SD" }, { value: "SMP", label: "SMP" }] },
          { key: "level", label: "Level", options: ["Mudah", "Sedang", "Sulit"].map((l) => ({ value: l, label: l })) },
        ]}
      />
      <Table>
        <thead>
          <tr>
            <Th>Kode</Th>
            <Th>Pertanyaan</Th>
            <Th>Tipe</Th>
            <Th>Mapel · Bab</Th>
            <Th>Level</Th>
            <Th>Dipakai di</Th>
            <Th className="text-right">Aksi</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((q) => (
            <tr key={q.id} className="hover:bg-sidebar">
              <Td className="whitespace-nowrap text-ink-2">Q-{1000 + q.id}</Td>
              <Td className="max-w-[340px]">
                <span className="line-clamp-2">
                  <MathText text={q.prompt} />
                </span>
              </Td>
              <Td>
                <TypePill>{q.type === "pg" ? "Pilihan ganda" : "Isian"}</TypePill>
              </Td>
              <Td className="text-ink-2">
                {q.subject} · {q.bab}
              </Td>
              <Td>
                <StatusDot tone={q.level === "Mudah" ? "green" : q.level === "Sedang" ? "orange" : "red"}>{q.level}</StatusDot>
              </Td>
              <Td className="text-ink-2">{[...(usedIn.get(q.id) ?? [])].join(", ") || "—"}</Td>
              <Td>
                <RowActions what={`soal Q-${1000 + q.id}`} editHref={`/admin/bank-soal/${q.id}`} onDelete={deleteEntity.bind(null, "soal", q.id)} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pager total={n} page={page} perPage={PER_PAGE} href={(p) => urlWith("/admin/bank-soal", sp, { hal: p })} />
    </>
  );
}
