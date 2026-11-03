import { CircleCheck, Coins, Star, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";
import type { CurrentUser } from "@/lib/dal";
import { num, wibMonthStart, wibParts } from "@/lib/format";
import { monthStats, myRank } from "@/lib/queries/siswa";
import { HelpCard, StatTile } from "./shell";

function thisMonth() {
  const { y, m } = wibParts(new Date());
  return { start: wibMonthStart(y, m), end: new Date(Date.now() + 60_000) };
}

/** "Statistik kamu" right panel shared by Peringkat, Profil and Paket & Coin. */
export async function MyStatsAside({ user }: { user: CurrentUser }) {
  const { start, end } = thisMonth();
  const [rank, month] = await Promise.all([myRank("daily", user.id, user.jenjang), monthStats(user.id, start, end)]);
  return (
    <>
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-[17px] font-semibold text-ink">Statistik kamu</h2>
          <Link href="/siswa/profil/riwayat" className="text-[13px] font-semibold text-primary">
            Detail
          </Link>
        </div>
        <div className="grid gap-3">
          <StatTile
            tone="orange"
            icon={<Trophy />}
            value={rank.rank ? `#${rank.rank}` : "–"}
            label="Peringkat Daily Quiz"
            right={user.rankDelta > 0 && <span className="flex items-center gap-1 rounded-xl bg-white/70 px-2 py-0.5 text-xs font-semibold text-success-ink"><TrendingUp className="size-3" /> naik {user.rankDelta}</span>}
          />
          <StatTile icon={<Star />} value={num(user.points)} label="Total poin" />
          <StatTile tone="green" icon={<CircleCheck />} value={month.length} label="Quiz selesai bulan ini" />
          <StatTile
            tone="yellow"
            icon={<Coins />}
            value={num(user.coin)}
            label="Coin"
            right={
              <Link href="/siswa/paket?tab=coin" className="rounded-2xl bg-white px-3 py-1.5 text-[13px] font-semibold text-ink shadow-tab">
                Isi
              </Link>
            }
          />
        </div>
      </section>
      <HelpCard />
    </>
  );
}
