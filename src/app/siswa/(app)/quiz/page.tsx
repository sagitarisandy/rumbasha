import { and, asc, eq } from "drizzle-orm";
import { Coins, LineChart, Star, TrendingUp, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/app/visuals";
import { HistoryRow, historySub } from "@/components/siswa/history-row";
import { HelpCard, MobileBar, SiswaPage, StatTile } from "@/components/siswa/shell";
import { Card, Progress } from "@/components/ui/misc";
import { DAILY_COIN_COST, DAILY_FREE_PER_DAY } from "@/lib/catalog";
import { requireSiswa } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { materials } from "@/lib/db/schema";
import { firstName, num } from "@/lib/format";
import { pointsFor } from "@/lib/queries/hasil";
import { dailyUsedToday, myRank, quizHistory, quizStats, totalSiswa } from "@/lib/queries/siswa";
import { DailyForm } from "./daily-form";

export default async function DailyQuizPage({ searchParams }: { searchParams: Promise<{ mapel?: string; bidang?: string; bab?: string; level?: string }> }) {
  const user = await requireSiswa();
  const sp = await searchParams;
  const db = await getDb();
  const [quota, history, stats, rank, siswaCount, pdfs] = await Promise.all([
    dailyUsedToday(user.id),
    quizHistory(user.id, ["daily"], 5),
    quizStats(user.id, ["daily"]),
    myRank("daily", user.id, user.jenjang),
    totalSiswa(),
    db.select({ bab: materials.bab, title: materials.title }).from(materials).where(and(eq(materials.status, "publish"), eq(materials.jenjang, "SMP"))).orderBy(asc(materials.id)),
  ]);
  const subBab: Record<string, string[]> = {};
  for (const p of pdfs) (subBab[p.bab] ??= []).push(p.title);

  return (
    <SiswaPage
      header={
        <MobileBar
          title="Daily Quiz"
          right={
            <Link href="/siswa/paket?tab=coin" className="flex items-center gap-1 pr-2 text-[13px] font-semibold text-ink">
              <Coins className="size-4 text-warning" /> {num(user.coin)} coin
            </Link>
          }
        />
      }
      aside={
        <>
          <section>
            <div className="mb-3 flex items-end justify-between">
              <h2 className="text-[17px] font-semibold text-ink">Statistik kamu</h2>
              <Link href="/siswa/profil/riwayat" className="text-[13px] font-semibold text-primary">
                Detail
              </Link>
            </div>
            <div className="grid gap-3">
              <StatTile icon={<LineChart />} value={stats.avg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} label={`Rata-rata nilai · ${stats.n} quiz`} />
              <StatTile tone="orange" icon={<Star />} value={num(user.points)} label="Poin Daily Quiz" />
              <StatTile
                tone="green"
                icon={<Trophy />}
                value={rank.rank ? `#${rank.rank}` : "–"}
                label={`Peringkat dari ${num(siswaCount)} siswa`}
                right={user.rankDelta > 0 && <span className="flex items-center gap-1 rounded-xl bg-white/70 px-2 py-0.5 text-xs font-semibold text-success-ink"><TrendingUp className="size-3" /> naik {user.rankDelta}</span>}
              />
            </div>
          </section>
          <HelpCard />
        </>
      }
    >
      <div className="hidden lg:block">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">Daily Quiz</h1>
        <p className="mt-1 text-sm text-subtle">Pilih materi dan level. Soalnya dibuat otomatis.</p>
      </div>

      <div className="mt-5 flex items-center gap-4 rounded-[20px] bg-accent-soft p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-accent">
          <Zap className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-ink">Jatah gratis hari ini</span>
            <span className="text-xs font-semibold text-ink">
              {Math.min(quota.used, DAILY_FREE_PER_DAY)} dari {DAILY_FREE_PER_DAY}
            </span>
          </div>
          <Progress className="mt-2" value={(Math.min(quota.used, DAILY_FREE_PER_DAY) / DAILY_FREE_PER_DAY) * 100} track="white" />
          <p className="mt-1.5 text-xs text-subtle">
            Setelah habis, {DAILY_COIN_COST} coin per quiz. Coin kamu: {num(user.coin)}.
          </p>
        </div>
      </div>

      <Card className="mt-5 p-5 sm:p-6">
        <DailyForm firstName={firstName(user.name)} free={quota.free} usedToday={quota.used} coin={user.coin} initial={sp} subBab={subBab} />
      </Card>

      <section className="mt-7">
        <div className="mb-1 flex items-end justify-between">
          <h2 className="text-[17px] font-semibold text-ink">Riwayat</h2>
          <Link href="/siswa/profil/riwayat" className="text-[13px] font-semibold text-primary">
            Semua
          </Link>
        </div>
        {history.length === 0 ? (
          <EmptyState title="Belum ada Daily Quiz" body="Quiz pertamamu akan muncul di sini." />
        ) : (
          <div className="divide-y divide-border-2">
            {history.map((h) => (
              <HistoryRow key={h.id} id={h.id} title={h.title} subject={h.subject} sub={historySub(h.at, pointsFor("daily", h.score ?? 0, h.correct ?? 0))} score={h.score} />
            ))}
          </div>
        )}
      </section>
    </SiswaPage>
  );
}
