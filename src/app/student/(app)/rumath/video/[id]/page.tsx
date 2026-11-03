import { and, asc, eq } from "drizzle-orm";
import { CheckCircle2, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HelpCard, MobileBar, SiswaPage } from "@/components/siswa/shell";
import { VideoPlayer } from "@/components/siswa/video-player";
import { VideoThumb } from "@/components/siswa/video-thumb";
import { LinkButton } from "@/components/ui/button";
import { requireSiswa } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { videoProgress, videos } from "@/lib/db/schema";
import { rng } from "@/lib/db/seed-questions";
import { RUMATH_JENIS, rumathSoal, type RumathJenis } from "@/lib/rumath";
import { SaveVideoButton } from "./save-button";

/** Chalkboard lines for the video scene, e.g. 47 / + 38 / 85. */
function boardFor(jenis: RumathJenis, id: number) {
  const s = rumathSoal(jenis, 2, rng(id * 97));
  const m = s.prompt.match(/\$(\d+) (\+|-|\\times|\\div) (\d+) = \?\$/);
  if (!m) return [`$${s.answer}$`];
  const op = { "+": "+", "-": "-", "\\times": "\\times", "\\div": "\\div" }[m[2]];
  return [`$${m[1]}$`, `$${op} ${m[3]}$`, `$${s.answer}$`];
}

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSiswa();
  const { id } = await params;
  const db = await getDb();
  const [v] = await db.select().from(videos).where(eq(videos.id, Number(id)));
  if (!v) notFound();
  const siblings = await db
    .select({ v: videos, seconds: videoProgress.seconds, done: videoProgress.done })
    .from(videos)
    .leftJoin(videoProgress, and(eq(videoProgress.videoId, videos.id), eq(videoProgress.userId, user.id)))
    .where(eq(videos.bidang, v.bidang))
    .orderBy(asc(videos.position));
  const mine = siblings.find((s) => s.v.id === v.id);
  const [saved] = await db.select({ saved: videoProgress.saved }).from(videoProgress).where(and(eq(videoProgress.userId, user.id), eq(videoProgress.videoId, v.id)));
  const jenis = (RUMATH_JENIS.some((j) => j.name === v.bidang) ? v.bidang : "Penjumlahan") as RumathJenis;

  return (
    <SiswaPage header={<MobileBar title={v.bidang} back="/student/rumath" />} aside={<HelpCard />}>
      <VideoPlayer id={v.id} total={v.durationSec} start={mine?.done ? 0 : (mine?.seconds ?? 0)} board={boardFor(jenis, v.id)} />
      <p className="mt-4 text-xs text-subtle">
        RUMATH · {v.bidang} · video {v.position} dari {siblings.length}
      </p>
      <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.01em] text-ink">{v.title}</h1>
      <p className="mt-1 text-sm text-subtle">{v.description}</p>
      <div className="mt-4 flex items-center gap-2">
        <LinkButton href={`/student/rumath?jenis=${encodeURIComponent(v.bidang)}`}>
          <Pencil /> Latihan {v.bidang}
        </LinkButton>
        <SaveVideoButton id={v.id} initial={!!saved?.saved} />
      </div>

      <h2 className="mb-2 mt-8 text-[17px] font-semibold text-ink">Video lain</h2>
      <div className="flex flex-col gap-3">
        {siblings
          .filter((s) => s.v.id !== v.id)
          .map((s) => (
            <Link key={s.v.id} href={`/student/rumath/video/${s.v.id}`} className="flex items-center gap-4 rounded-2xl p-1 hover:bg-sidebar">
              <VideoThumb jenis={s.v.bidang} seconds={s.v.durationSec} progress={s.done ? 100 : ((s.seconds ?? 0) / s.v.durationSec) * 100} className="h-[72px] w-[124px] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-ink">{s.v.title}</p>
                <p className="text-xs text-subtle">
                  Video {s.v.position}
                  {s.done ? " · selesai" : s.seconds ? " · sedang ditonton" : ""}
                </p>
              </div>
              {s.done && <CheckCircle2 className="size-5 shrink-0 text-success" />}
            </Link>
          ))}
      </div>
    </SiswaPage>
  );
}
