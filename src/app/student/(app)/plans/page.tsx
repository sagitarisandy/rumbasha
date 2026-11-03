import { and, asc, eq, or } from "drizzle-orm";
import { MyStatsAside } from "@/components/siswa/my-stats";
import { MobileBar, SiswaPage } from "@/components/siswa/shell";
import { Card } from "@/components/ui/misc";
import { requireSiswa } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { packages } from "@/lib/db/schema";
import { daysLeft, longDate, num } from "@/lib/format";
import { getPackage } from "@/lib/queries/siswa";
import { PaketClient } from "./paket-client";

export default async function PaketPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireSiswa();
  const sp = await searchParams;
  const db = await getDb();
  const [current, list] = await Promise.all([
    getPackage(user.packageId),
    db.select().from(packages).where(and(eq(packages.active, true), or(eq(packages.kind, "coin"), eq(packages.jenjang, user.jenjang ?? "SMP")))).orderBy(asc(packages.price)),
  ]);
  const subs = list.filter((p) => p.kind === "langganan");
  const packs = list.filter((p) => p.kind === "coin");

  return (
    <SiswaPage header={<MobileBar title="Paket & Coin" />} aside={<MyStatsAside user={user} />}>
      <h1 className="mb-4 hidden text-[26px] font-semibold tracking-[-0.02em] text-ink lg:block">Paket & Coin</h1>
      <Card className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-xs text-subtle">Paket aktif</p>
          <p className="text-[17px] font-semibold text-ink">
            {current ? `${current.name} · Kelas ${user.grade}` : "Belum ada paket"}
          </p>
          {user.packageUntil && (
            <p className="text-xs text-subtle">
              Sampai {longDate(user.packageUntil)} · {daysLeft(user.packageUntil)} hari lagi
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-subtle">Coin</p>
          <p className="text-[22px] font-semibold text-ink">{num(user.coin)}</p>
        </div>
      </Card>
      <PaketClient
        tab={sp.tab === "coin" ? "coin" : "paket"}
        packages={subs.map((p) => ({ id: p.id, name: p.name, tagline: p.tagline, price: p.price, priceOriginal: p.priceOriginal, features: p.features, highlight: p.highlight }))}
        coinPacks={packs.map((p) => ({ id: p.id, coin: p.coin, price: p.price, note: p.tagline ?? "" }))}
      />
    </SiswaPage>
  );
}
