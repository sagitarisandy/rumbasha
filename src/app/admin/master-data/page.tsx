import { and, asc, count, eq, ilike, sql, type SQL } from "drizzle-orm";
import { deleteEntity, saveMaster } from "@/app/actions/admin";
import { CreateButton, EditRow, type FieldDef } from "@/components/admin/form-dialog";
import { AdminHeader } from "@/components/admin/shell";
import { Pager, PER_PAGE, StatusDot, Table, Td, Th, TypePill, pageOf, urlWith } from "@/components/admin/table";
import { Toolbar } from "@/components/admin/toolbar";
import { UnderlineTabs } from "@/components/ui/tabs";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { masterData, materials, users } from "@/lib/db/schema";

const KINDS = [
  ["mapel", "Mapel"],
  ["bidang", "Bidang materi"],
  ["kelas", "Kelas"],
  ["sekolah", "Sekolah"],
  ["cabang", "Cabang"],
] as const;
const LABEL = Object.fromEntries(KINDS) as Record<string, string>;

const FIELDS: FieldDef[] = [
  { name: "kind", label: "Tipe", type: "select", options: KINDS.map(([v, l]) => ({ value: v, label: l })) },
  { name: "name", label: "Nama", required: true },
  { name: "parent", label: "Induk", hint: "Mapel untuk bidang, kota untuk sekolah (opsional)" },
  { name: "jenjang", label: "Jenjang", type: "select", options: [{ value: "", label: "—" }, { value: "SD", label: "SD" }, { value: "SMP", label: "SMP" }] },
  { name: "active", label: "Aktif", type: "switch" },
];

export default async function MasterDataPage({ searchParams }: { searchParams: Promise<{ tipe?: string; q?: string; status?: string; hal?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const page = pageOf(sp.hal);
  const db = await getDb();
  const where: SQL[] = [];
  if (sp.tipe) where.push(eq(masterData.kind, sp.tipe));
  if (sp.q) where.push(ilike(masterData.name, `%${sp.q}%`));
  if (sp.status) where.push(eq(masterData.active, sp.status === "aktif"));
  const [[{ n }], rows, kindCounts, schoolCounts, pdfCounts, bidangPerMapel] = await Promise.all([
    db.select({ n: count() }).from(masterData).where(and(...where)),
    db.select().from(masterData).where(and(...where)).orderBy(asc(masterData.kind), asc(masterData.id)).limit(PER_PAGE).offset((page - 1) * PER_PAGE),
    db.select({ kind: masterData.kind, n: count() }).from(masterData).groupBy(masterData.kind),
    db.select({ school: users.school, n: count() }).from(users).where(eq(users.role, "siswa")).groupBy(users.school),
    db.select({ key: sql<string>`${materials.subject} || '/' || ${materials.bidang}`, n: count() }).from(materials).groupBy(materials.subject, materials.bidang),
    db.select({ parent: masterData.parent, n: count() }).from(masterData).where(eq(masterData.kind, "bidang")).groupBy(masterData.parent),
  ]);
  const isi = (m: (typeof rows)[number]) => {
    if (m.kind === "sekolah") return `${schoolCounts.find((s) => s.school === m.name)?.n ?? 0} siswa`;
    if (m.kind === "bidang") return `${pdfCounts.find((b) => b.key === `${m.parent}/${m.name}`)?.n ?? 0} PDF`;
    if (m.kind === "mapel") return `${bidangPerMapel.find((b) => b.parent === m.name)?.n ?? 0} bidang`;
    return "—";
  };
  const total = kindCounts.reduce((s, k) => s + k.n, 0);

  return (
    <>
      <AdminHeader sub="Data acuan untuk filter materi, soal, dan profil siswa." actions={<CreateButton label="Tambah data" title="Tambah master data" fields={FIELDS} action={saveMaster.bind(null, null)} />} />
      <UnderlineTabs
        className="mb-4"
        value={sp.tipe ?? "semua"}
        items={[{ value: "semua", label: "Semua", count: total, href: urlWith("/admin/master-data", { q: sp.q }, {}) }, ...KINDS.map(([v, l]) => ({ value: v, label: l, count: kindCounts.find((k) => k.kind === v)?.n ?? 0, href: urlWith("/admin/master-data", { q: sp.q }, { tipe: v }) }))]}
      />
      <Toolbar placeholder="Cari nama data…" filters={[{ key: "status", label: "Status", options: [{ value: "aktif", label: "Aktif" }, { value: "nonaktif", label: "Nonaktif" }] }]} />
      <Table>
        <thead>
          <tr>
            <Th>Nama</Th>
            <Th>Tipe</Th>
            <Th>Induk</Th>
            <Th>Isi</Th>
            <Th>Status</Th>
            <Th className="text-right">Aksi</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id} className="hover:bg-sidebar">
              <Td className="font-semibold">{m.name}</Td>
              <Td>
                <TypePill>{LABEL[m.kind] ?? m.kind}</TypePill>
              </Td>
              <Td className="text-ink-2">{m.parent ?? m.jenjang ?? "—"}</Td>
              <Td className="text-ink-2">{isi(m)}</Td>
              <Td>{m.active ? <StatusDot tone="green">Aktif</StatusDot> : <StatusDot tone="grey">Nonaktif</StatusDot>}</Td>
              <Td>
                <EditRow what={`“${m.name}”`} title="Edit master data" fields={FIELDS} values={m} action={saveMaster.bind(null, m.id)} onDelete={deleteEntity.bind(null, "master", m.id)} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pager total={n} page={page} perPage={PER_PAGE} href={(p) => urlWith("/admin/master-data", sp, { hal: p })} />
    </>
  );
}
