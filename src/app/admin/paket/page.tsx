import { asc, count, eq } from "drizzle-orm";
import { deleteEntity, savePaket } from "@/app/actions/admin";
import { CreateButton, EditRow, type FieldDef } from "@/components/admin/form-dialog";
import { AdminHeader } from "@/components/admin/shell";
import { StatusDot, Table, Td, Th, TypePill } from "@/components/admin/table";
import { Segmented } from "@/components/ui/tabs";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { packages, users } from "@/lib/db/schema";
import { num, rupiah } from "@/lib/format";

const FIELDS: FieldDef[] = [
  { name: "kind", label: "Jenis", type: "select", options: [{ value: "langganan", label: "Langganan" }, { value: "coin", label: "Coin" }] },
  { name: "name", label: "Nama paket", required: true },
  { name: "jenjang", label: "Jenjang", type: "select", options: [{ value: "SMP", label: "SMP" }, { value: "SD", label: "SD" }] },
  { name: "price", label: "Harga (Rp, per bulan untuk langganan)", type: "number", required: true },
  { name: "priceOriginal", label: "Harga coret (opsional)", type: "number" },
  { name: "coin", label: "Coin (bonus bulanan / isi paket coin)", type: "number" },
  { name: "durationDays", label: "Durasi (hari)", type: "number", hint: "Langganan saja" },
  { name: "tagline", label: "Keterangan singkat", placeholder: "Persiapan TKA dan seleksi SMA" },
  { name: "features", label: "Isi paket (satu per baris)", type: "textarea" },
  { name: "highlight", label: "Tandai “Paling banyak dipilih”", type: "switch" },
  { name: "active", label: "Aktif", type: "switch" },
];

export default async function AdminPaketPage({ searchParams }: { searchParams: Promise<{ jenis?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const jenis = sp.jenis === "langganan" || sp.jenis === "coin" ? sp.jenis : null;
  const db = await getDb();
  const [rows, usage] = await Promise.all([
    db.select().from(packages).where(jenis ? eq(packages.kind, jenis) : undefined).orderBy(asc(packages.kind), asc(packages.price)),
    db.select({ id: users.packageId, n: count() }).from(users).where(eq(users.role, "siswa")).groupBy(users.packageId),
  ]);

  return (
    <>
      <AdminHeader sub="Paket langganan dan paket coin di halaman Paket & Coin siswa." actions={<CreateButton label="Tambah paket" title="Tambah paket" fields={FIELDS} action={savePaket.bind(null, null)} values={{ kind: "langganan", jenjang: "SMP", durationDays: 30, active: true, highlight: false }} />} />
      <Segmented
        className="mb-4 max-w-[420px]"
        value={jenis ?? "semua"}
        items={[
          { value: "semua", label: "Semua", href: "/admin/paket" },
          { value: "langganan", label: "Langganan", href: "/admin/paket?jenis=langganan" },
          { value: "coin", label: "Coin", href: "/admin/paket?jenis=coin" },
        ]}
      />
      <Table>
        <thead>
          <tr>
            <Th>Nama paket</Th>
            <Th>Jenis</Th>
            <Th>Harga</Th>
            <Th>Isi</Th>
            <Th>Pengguna</Th>
            <Th>Status</Th>
            <Th className="text-right">Aksi</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="hover:bg-sidebar">
              <Td className="font-semibold">
                {p.name} {p.highlight && <span className="ml-1 rounded-lg bg-accent-soft px-1.5 py-0.5 text-[11px] text-accent-ink">Unggulan</span>}
              </Td>
              <Td>
                <TypePill>{p.kind === "coin" ? "Coin" : "Langganan"}</TypePill>
              </Td>
              <Td className="whitespace-nowrap">
                {rupiah(p.price)}
                {p.kind === "langganan" && " / bln"}
              </Td>
              <Td className="max-w-[260px] truncate text-ink-2">{p.kind === "coin" ? `${num(p.coin)} coin` : p.features.slice(0, 2).join(", ")}</Td>
              <Td>{p.kind === "coin" ? "—" : num(usage.find((u) => u.id === p.id)?.n ?? 0)}</Td>
              <Td>{p.active ? <StatusDot tone="green">Aktif</StatusDot> : <StatusDot tone="grey">Nonaktif</StatusDot>}</Td>
              <Td>
                <EditRow what={`paket ${p.name}`} title={`Edit ${p.name}`} fields={FIELDS} values={p} action={savePaket.bind(null, p.id)} onDelete={deleteEntity.bind(null, "paket", p.id)} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
