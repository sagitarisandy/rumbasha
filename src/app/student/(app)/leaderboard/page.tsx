import { eq } from "drizzle-orm";
import { CircleHelp, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Avatar, Rumbi } from "@/components/app/visuals";
import { MyStatsAside } from "@/components/siswa/my-stats";
import { MobileBar, SiswaPage } from "@/components/siswa/shell";
import { Segmented } from "@/components/ui/tabs";
import { requireSiswa } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { quizzes } from "@/lib/db/schema";
import { num } from "@/lib/format";
import { rankBoard, totalSiswa, type Board } from "@/lib/queries/siswa";
import { RankFilters } from "./filters";

type Search = { papan?: string; periode?: string; kelas?: string; sekolah?: string; quiz?: string };

type Row = Awaited<ReturnType<typeof rankBoard>>[number];

function Podium({ r, place, meId }: { r?: Row; place: 1 | 2 | 3; meId: number }) {
  if (!r) return <div className="flex-1" />;
  return (
    <div className="flex flex-1 flex-col items-center">
      <Avatar n={r.avatar} className={place === 1 ? "size-14" : "size-11"} />
      <p className="mt-1.5 max-w-full truncate text-center text-[13px] font-semibold text-ink">{r.id === meId ? "Kamu" : r.name}</p>
      <p className="mb-2 max-w-full truncate text-center text-[11px] text-subtle">{r.school}</p>
      <div className={`flex w-full flex-col items-center justify-center rounded-t-2xl ${place === 1 ? "h-[88px] bg-accent text-white" : place === 2 ? "h-[64px] bg-primary-soft text-ink" : "h-[52px] bg-primary-soft text-ink"}`}>
        <span className="text-lg font-semibold">{place}</span>
        <span className={`text-xs ${place === 1 ? "text-white/85" : "text-subtle"}`}>{num(r.score)}</span>
      </div>
    </div>
  );
}

export default async function PeringkatPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireSiswa();
  const sp = await searchParams;
  const board: Board = sp.papan === "ujikom" || sp.papan === "tryout" ? sp.papan : "daily";
  const period = sp.periode === "bulan" || sp.periode === "semua" ? sp.periode : sp.periode === "minggu" ? "minggu" : board === "daily" ? "semua" : "semua";
  const db = await getDb();
  const quiz = sp.quiz ? (await db.select().from(quizzes).where(eq(quizzes.id, Number(sp.quiz))))[0] : undefined;
  const rows = await rankBoard({ board: quiz ? (quiz.kind as Board) : board, period, jenjang: user.jenjang, grade: sp.kelas === "saya" ? user.grade : null, school: sp.sekolah === "saya" ? user.school : null, quizId: quiz?.id });
  const me = rows.find((r) => r.id === user.id);
  const total = await totalSiswa();
  const unit = board === "daily" && !quiz ? "poin" : "nilai";
  const link = (p: Partial<Search>) => `/student/leaderboard?${new URLSearchParams(Object.entries({ papan: board, periode: sp.periode, kelas: sp.kelas, sekolah: sp.sekolah, ...p }).filter(([, v]) => v) as [string, string][])}`;
  const [first, second, third] = rows;

  return (
    <SiswaPage header={<MobileBar title="Peringkat" right={<span className="grid size-10 place-items-center text-subtle"><CircleHelp className="size-5" /></span>} />} aside={<MyStatsAside user={user} />}>
      <h1 className="hidden text-[26px] font-semibold tracking-[-0.02em] text-ink lg:block">{quiz ? `Peringkat · ${quiz.title}` : "Peringkat"}</h1>

      <div className="mt-4 flex items-center justify-between rounded-[20px] p-1">
        <div>
          <p className="text-xs text-subtle">{quiz ? "Peringkat kamu di quiz ini" : "Peringkat global"}</p>
          <p className="text-[34px] font-semibold leading-tight text-ink">
            {me ? `#${me.rank}` : "–"} <span className="text-sm font-normal text-subtle">dari {num(quiz ? rows.length : total)} siswa</span>
          </p>
        </div>
        <Rumbi pose="juara" className="h-[72px]" />
      </div>

      {!quiz && (
        <>
          <Segmented
            className="mt-4"
            value={board}
            items={[
              { value: "daily", label: "Daily Quiz", href: link({ papan: "daily" }) },
              { value: "ujikom", label: "Uji Kom", href: link({ papan: "ujikom" }) },
              { value: "tryout", label: "Tryout", href: link({ papan: "tryout" }) },
            ]}
          />
          <RankFilters board={board} periode={sp.periode ?? ""} kelas={sp.kelas ?? ""} sekolah={sp.sekolah ?? ""} grade={user.grade} />
        </>
      )}

      <div className="mt-6 flex items-end gap-2">
        <Podium r={second} place={2} meId={user.id} />
        <Podium r={first} place={1} meId={user.id} />
        <Podium r={third} place={3} meId={user.id} />
      </div>

      <ul className="divide-y divide-border-2">
        {rows.slice(3, 10).map((r) => (
          <li key={r.id} className={`flex items-center gap-3 py-3 ${r.id === user.id ? "bg-primary-soft" : ""}`}>
            <span className="w-6 text-center text-[13px] font-semibold text-ink-2">{r.rank}</span>
            <Avatar n={r.avatar} className="size-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-ink">{r.id === user.id ? "Kamu" : r.name}</p>
              <p className="truncate text-xs text-subtle">{r.school}</p>
            </div>
            <span className="text-[15px] font-semibold text-ink">{num(r.score)}</span>
            {r.delta > 0 ? <TrendingUp className="size-4 text-success" /> : r.delta < 0 ? <TrendingDown className="size-4 text-destructive" /> : <span className="size-4" />}
          </li>
        ))}
        {rows.length === 0 && <li className="py-8 text-center text-sm text-subtle">Belum ada data untuk filter ini.</li>}
      </ul>

      {me && me.rank > 3 && (
        <div className="sticky bottom-20 mt-4 flex items-center gap-3 rounded-2xl border border-border-2 bg-white px-3 py-3 shadow-panel lg:bottom-4">
          <span className="w-6 text-center text-[13px] font-semibold text-ink-2">{me.rank}</span>
          <Avatar n={me.avatar} className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-ink">Kamu · {user.name}</p>
            <p className="truncate text-xs text-subtle">
              {user.school}
              {board === "daily" && user.rankDelta > 0 ? ` · naik ${user.rankDelta}` : ""}
            </p>
          </div>
          <p className="text-[15px] font-semibold text-ink">
            {num(me.score)} <span className="text-xs font-normal text-subtle">{unit}</span>
          </p>
        </div>
      )}
      {quiz && (
        <Link href="/student/leaderboard" className="mt-6 block text-center text-sm font-semibold text-primary">
          Lihat peringkat global
        </Link>
      )}
    </SiswaPage>
  );
}
