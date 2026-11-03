import { and, asc, desc, eq, sql } from "drizzle-orm";
import { ChevronRight, Coins, LineChart, Target } from "lucide-react";
import Link from "next/link";
import { HistoryRow, historySub } from "@/components/siswa/history-row";
import { HelpCard, MobileBar, SiswaPage, StatTile } from "@/components/siswa/shell";
import { VideoThumb } from "@/components/siswa/video-thumb";
import { Card } from "@/components/ui/misc";
import { requireSiswa } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { packages, videoProgress, videos } from "@/lib/db/schema";
import { num } from "@/lib/format";
import { pointsFor } from "@/lib/queries/hasil";
import { quizHistory, quizStats } from "@/lib/queries/siswa";
import { RUMATH_JENIS, RUMATH_QUESTIONS } from "@/lib/rumath";
import { RumathForm } from "./rumath-form";

export default async function RumathPage({ searchParams }: { searchParams: Promise<{ jenis?: string }> }) {
  const user = await requireSiswa();
  const sp = await searchParams;
  const db = await getDb();
  const [vids, watching, stats, history, pkg] = await Promise.all([
    db.select().from(videos).where(eq(videos.status, "publish")).orderBy(asc(videos.bidang), asc(videos.position)),
    db
      .select({ v: videos, seconds: videoProgress.seconds, done: videoProgress.done })
      .from(videoProgress)
      .innerJoin(videos, eq(videos.id, videoProgress.videoId))
      .where(and(eq(videoProgress.userId, user.id), sql`${videoProgress.seconds} > 0`))
      .orderBy(desc(videoProgress.updatedAt))
      .limit(6),
    quizStats(user.id, ["rumath"]),
    quizHistory(user.id, ["rumath"], 4),
    user.packageId ? db.select().from(packages).where(eq(packages.id, user.packageId)) : Promise.resolve([]),
  ]);
  const free = !!pkg[0]?.features.some((f) => f.toLowerCase().includes("rumath tanpa coin"));
  const countBy = (jenis: string) => vids.filter((v) => v.bidang === jenis);

  return (
    <SiswaPage
      header={
        <MobileBar
          title="RUMATH"
          right={
            <Link href="/student/plans?tab=coin" className="flex items-center gap-1 pr-2 text-[13px] font-semibold text-ink">
              <Coins className="size-4 text-warning" /> {num(user.coin)} coin
            </Link>
          }
        />
      }
      aside={
        <>
          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-ink">Statistik RUMATH</h2>
            <div className="grid gap-3">
              <StatTile icon={<LineChart />} value={stats.avg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} label={`Rata-rata nilai · ${stats.n} latihan`} />
              <StatTile tone="green" icon={<Target />} value={num(stats.n * RUMATH_QUESTIONS)} label="Soal dijawab" />
              <StatTile tone="yellow" icon={<Coins />} value={num(user.coin)} label={free ? "Coin · RUMATH gratis di paketmu" : "Coin tersisa"} />
            </div>
          </section>
          {history.length > 0 && (
            <section>
              <h2 className="mb-1 text-[17px] font-semibold text-ink">Latihan terakhir</h2>
              <div className="divide-y divide-border-2">
                {history.map((h) => (
                  <HistoryRow key={h.id} id={h.id} title={h.title.replace("RUMATH · ", "")} subject="Matematika" sub={historySub(h.at, pointsFor("rumath", h.score ?? 0, h.correct ?? 0))} score={h.score} />
                ))}
              </div>
            </section>
          )}
          <HelpCard />
        </>
      }
    >
      <div className="hidden lg:block">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">RUMATH</h1>
        <p className="mt-1 text-sm text-subtle">Hitung cepat bareng Rumbi: tonton videonya, lalu latihan soal isian.</p>
      </div>

      {watching.length > 0 && (
        <section className="mt-5">
          <h2 className="mb-3 text-[17px] font-semibold text-ink">Lanjutkan nonton</h2>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {watching.map(({ v, seconds, done }) => (
              <Link key={v.id} href={`/student/rumath/video/${v.id}`} className="w-[200px] shrink-0">
                <VideoThumb jenis={v.bidang} seconds={v.durationSec} progress={done ? 100 : (seconds / v.durationSec) * 100} />
                <p className="mt-2 truncate text-sm font-semibold text-ink">{v.title}</p>
                <p className="text-xs text-subtle">
                  Video {v.position} dari {countBy(v.bidang).length}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Card className="mt-6 p-5 sm:p-6">
        <RumathForm coin={user.coin} free={free} initialJenis={sp.jenis} />
      </Card>

      <section className="mt-7">
        <h2 className="mb-1 text-[17px] font-semibold text-ink">Materi video</h2>
        <div className="divide-y divide-border-2">
          {RUMATH_JENIS.map((j) => {
            const list = countBy(j.name);
            return (
              <Link key={j.name} href={list[0] ? `/student/rumath/video/${list[0].id}` : "/student/rumath"} className="flex items-center gap-4 py-3.5 hover:bg-sidebar">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-lg font-semibold text-primary">{j.symbol}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-ink">{j.name}</p>
                  <p className="text-xs text-subtle">
                    {list.length} video · latihan {RUMATH_QUESTIONS} soal
                  </p>
                </div>
                <ChevronRight className="size-4 text-faint" />
              </Link>
            );
          })}
        </div>
      </section>
    </SiswaPage>
  );
}
