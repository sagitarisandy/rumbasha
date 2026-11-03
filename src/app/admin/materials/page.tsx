import { and, asc, count, desc, eq, ilike, type SQL } from "drizzle-orm";
import { FileText, Plus } from "lucide-react";
import { deleteEntity } from "@/app/actions/admin";
import { AdminHeader } from "@/components/admin/shell";
import { Pager, PER_PAGE, StatusDot, Table, Td, Th, pageOf, urlWith } from "@/components/admin/table";
import { RowActions, Toolbar } from "@/components/admin/toolbar";
import { LinkButton } from "@/components/ui/button";
import { MAPEL, mapelStyle } from "@/lib/catalog";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { materials } from "@/lib/db/schema";
import { shortDate } from "@/lib/format";

type Search = { q?: string; jenjang?: string; mapel?: string; status?: string; hal?: string };

export default async function AdminMateriPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireStaff();
  const sp = await searchParams;
  const page = pageOf(sp.hal);
  const db = await getDb();
  const where: SQL[] = [];
  if (sp.q) where.push(ilike(materials.title, `%${sp.q}%`));
  if (sp.jenjang === "SD" || sp.jenjang === "SMP") where.push(eq(materials.jenjang, sp.jenjang));
  if (sp.mapel) where.push(eq(materials.subject, sp.mapel));
  if (sp.status === "publish" || sp.status === "draft") where.push(eq(materials.status, sp.status));
  const [{ n }] = await db.select({ n: count() }).from(materials).where(and(...where));
  const rows = await db.select().from(materials).where(and(...where)).orderBy(desc(materials.updatedAt), asc(materials.id)).limit(PER_PAGE).offset((page - 1) * PER_PAGE);

  return (
    <>
      <AdminHeader
        sub="PDF yang tampil di menu Modul siswa."
        actions={
          <LinkButton href="/admin/materials/new">
            <Plus /> Tambah materi
          </LinkButton>
        }
      />
      <Toolbar
        placeholder="Cari judul PDF…"
        filters={[
          { key: "jenjang", label: "Jenjang", options: [{ value: "SD", label: "SD" }, { value: "SMP", label: "SMP" }] },
          { key: "mapel", label: "Mapel", options: MAPEL.map((m) => ({ value: m, label: m })) },
          { key: "status", label: "Status", options: [{ value: "publish", label: "Publish" }, { value: "draft", label: "Draft" }] },
        ]}
      />
      <Table>
        <thead>
          <tr>
            <Th>Judul PDF</Th>
            <Th>Jenjang</Th>
            <Th>Mapel</Th>
            <Th>Bidang › Bab</Th>
            <Th>Halaman</Th>
            <Th>Diubah</Th>
            <Th>Status</Th>
            <Th className="text-right">Aksi</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id} className="hover:bg-sidebar">
              <Td>
                <span className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg" style={{ background: mapelStyle(m.subject).tint, color: mapelStyle(m.subject).color }}>
                    <FileText className="size-4" />
                  </span>
                  <span className="max-w-[220px] truncate font-semibold">{m.title}</span>
                </span>
              </Td>
              <Td className="text-xs font-semibold">
                {m.jenjang} {m.grade}
              </Td>
              <Td>{m.subject}</Td>
              <Td className="text-ink-2">
                {m.bidang} › {m.bab}
              </Td>
              <Td className="text-ink-2">{m.pages} hlm</Td>
              <Td className="text-ink-2">{shortDate(m.updatedAt)}</Td>
              <Td>{m.status === "publish" ? <StatusDot tone="green">Publish</StatusDot> : <StatusDot tone="grey">Draft</StatusDot>}</Td>
              <Td>
                <RowActions what={`materi “${m.title}”`} editHref={`/admin/materials/${m.id}`} onDelete={deleteEntity.bind(null, "materi", m.id)} />
              </Td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <Td colSpan={8} className="py-10 text-center text-subtle">
                Tidak ada materi untuk filter ini.
              </Td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pager total={n} page={page} perPage={PER_PAGE} href={(p) => urlWith("/admin/materials", sp, { hal: p })} />
    </>
  );
}
