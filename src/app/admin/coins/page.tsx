import { and, asc, count, eq, gt, ilike, isNull, lt, or, type SQL } from "drizzle-orm";
import { Download } from "lucide-react";
import { AdminHeader } from "@/components/admin/shell";
import { Pager, pageOf, urlWith } from "@/components/admin/table";
import { Toolbar } from "@/components/admin/toolbar";
import { buttonClass } from "@/components/ui/button";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { packages, users } from "@/lib/db/schema";
import { longDate } from "@/lib/format";
import { CoinTable } from "./coin-table";

type Search = { q?: string; paket?: string; kelas?: string; berakhir?: string; hal?: string };
const PER = 12;

/** "≤ 30 hari lagi" or "sudah lewat", relative to now. */
function expiryFilter(kind: string): SQL {
  const now = new Date();
  if (kind === "30") return and(gt(users.packageUntil, now), lt(users.packageUntil, new Date(now.getTime() + 30 * 86_400_000)))!;
  return or(isNull(users.packageUntil), lt(users.packageUntil, now))!;
}

export default async function CoinAksesPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireStaff();
  const sp = await searchParams;
  const page = pageOf(sp.hal);
  const db = await getDb();
  const where: SQL[] = [eq(users.role, "siswa")];
  if (sp.q) where.push(ilike(users.name, `%${sp.q}%`));
  if (sp.paket === "none") where.push(isNull(users.packageId));
  else if (sp.paket) where.push(eq(users.packageId, Number(sp.paket)));
  if (sp.kelas) where.push(eq(users.grade, Number(sp.kelas)));
  if (sp.berakhir) where.push(expiryFilter(sp.berakhir));
  const [pkgs, [{ n }], rows] = await Promise.all([
    db.select().from(packages).where(eq(packages.kind, "langganan")).orderBy(asc(packages.price)),
    db.select({ n: count() }).from(users).where(and(...where)),
    db.select({ id: users.id, name: users.name, grade: users.grade, avatar: users.avatar, coin: users.coin, packageId: users.packageId, until: users.packageUntil }).from(users).where(and(...where)).orderBy(asc(users.name)).limit(PER).offset((page - 1) * PER),
  ]);
  const access = (pkgId: number | null) => {
    const p = pkgs.find((x) => x.id === pkgId);
    if (!p) return "—";
    return p.features.some((f) => f.toLowerCase().includes("rumath")) ? "Semua + RUMATH" : p.name.includes("SD") ? "Modul, Daily" : "Modul, Daily, Uji Kom";
  };

  return (
    <>
      <AdminHeader
        sub="Ubah coin dan akses siswa, satu per satu atau sekaligus."
        actions={
          <a href="/api/admin/export?jenis=coin" className={buttonClass({ variant: "ghost" })}>
            <Download /> Export
          </a>
        }
      />
      <Toolbar
        placeholder="Cari siswa…"
        filters={[
          { key: "paket", label: "Paket", options: [...pkgs.map((p) => ({ value: String(p.id), label: p.name })), { value: "none", label: "Tanpa paket" }] },
          { key: "kelas", label: "Kelas", options: Array.from({ length: 9 }, (_, i) => ({ value: String(i + 1), label: `Kelas ${i + 1}` })) },
          { key: "berakhir", label: "Berakhir", options: [{ value: "30", label: "≤ 30 hari lagi" }, { value: "lewat", label: "Sudah lewat" }] },
        ]}
      />
      <CoinTable
        packages={pkgs.map((p) => ({ id: p.id, name: p.name }))}
        rows={rows.map((r) => ({ ...r, paket: pkgs.find((p) => p.id === r.packageId)?.name ?? "—", akses: access(r.packageId), untilLabel: r.until ? longDate(r.until) : "—", untilIso: r.until ? r.until.toISOString().slice(0, 10) : "" }))}
        total={n}
      />
      <Pager total={n} page={page} perPage={PER} href={(p) => urlWith("/admin/coins", sp, { hal: p })} />
    </>
  );
}
