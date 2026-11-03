import { and, desc, eq, ilike, inArray, isNotNull, or } from "drizzle-orm";
import { ChevronRight, LineChart, Lock, Search, Star, Trophy } from "lucide-react";
import Link from "next/link";
import { EmptyState, MapelCard } from "@/components/app/visuals";
import { HelpCard, MobileBar, SiswaPage, StatTile } from "@/components/siswa/shell";
import { LinkButton } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { MAPEL } from "@/lib/catalog";
import { requireSiswa } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { attempts, quizzes } from "@/lib/db/schema";
import { clock, dayDate, num, shortDate, wibDay, wibParts, weekdayShort } from "@/lib/format";
import { pointsFor } from "@/lib/queries/hasil";
import { quizStats } from "@/lib/queries/siswa";
import { AccessCodeButton } from "./access-dialog";

type Search = { jenis?: string; mapel?: string; q?: string };

function relative(start: Date, now: Date) {
  const days = wibDay(start) - wibDay(now);
  if (days <= 0) return "hari ini";
  if (days === 1) return "besok";
  if (days < 14) return `${days} hari lagi`;
  return `${Math.round(days / 7)} minggu lagi`;
}

export default async function UjiKomPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireSiswa();
  const sp = await searchParams;
  const jenis = sp.jenis === "ujikom" || sp.jenis === "tryout" ? sp.jenis : "semua";
  const mapel = (MAPEL as readonly string[]).includes(sp.mapel ?? "") ? sp.mapel! : "Semua";
  const link = (p: Partial<Search>) => `/siswa/ujikom?${new URLSearchParams(Object.entries({ jenis, mapel, q: sp.q, ...p }).filter(([, v]) => v && v !== "semua" && v !== "Semua") as [string, string][])}`;
  const now = new Date();
  const db = await getDb();

  const kinds = jenis === "semua" ? (["ujikom", "tryout"] as const) : ([jenis] as const);
  const list = await db
    .select()
    .from(quizzes)
    .where(and(inArray(quizzes.kind, [...kinds]), eq(quizzes.jenjang, user.jenjang ?? "SMP"), mapel !== "Semua" ? or(eq(quizzes.subject, mapel), eq(quizzes.subject, "Semua")) : undefined, sp.q ? ilike(quizzes.title, `%${sp.q}%`) : undefined))
    .orderBy(quizzes.startsAt);
  const mine = await db
    .select({ id: attempts.id, quizId: attempts.quizId, score: attempts.score, correct: attempts.correct, at: attempts.submittedAt })
    .from(attempts)
    .innerJoin(quizzes, eq(quizzes.id, attempts.quizId))
    .where(and(eq(attempts.userId, user.id), inArray(quizzes.kind, ["ujikom", "tryout"]), isNotNull(attempts.submittedAt)))
    .orderBy(desc(attempts.submittedAt));
  const doneIds = new Set(mine.map((m) => m.quizId));
  const upcoming = list.filter((q) => q.status !== "draft" && !doneIds.has(q.id) && (!q.endsAt || q.endsAt > now));

  // Rank per finished quiz.
  const all = mine.length
    ? await db.select({ quizId: attempts.quizId, userId: attempts.userId, score: attempts.score }).from(attempts).where(and(inArray(attempts.quizId, mine.map((m) => m.quizId)), isNotNull(attempts.submittedAt)))
    : [];
  const done = mine
    .map((m) => {
      const q = list.find((x) => x.id === m.quizId);
      if (!q) return null;
      const scores = all.filter((a) => a.quizId === m.quizId).map((a) => a.score ?? 0).sort((a, b) => b - a);
      return { ...m, quiz: q, rank: scores.indexOf(m.score ?? 0) + 1, of: scores.length };
    })
    .filter((x) => !!x);

  const stats = await quizStats(user.id, ["ujikom", "tryout"]);
  const pointsTotal = mine.reduce((s, m) => s + pointsFor("ujikom", m.score ?? 0, m.correct ?? 0), 0);
  const bestTryout = done.filter((d) => d.quiz.kind === "tryout").sort((a, b) => a.rank - b.rank)[0];

  return (
    <SiswaPage
      header={<MobileBar title="Uji Kom & Tryout" />}
      aside={
        <>
          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-ink">Statistik kamu</h2>
            <div className="grid gap-3">
              <StatTile icon={<LineChart />} value={stats.avg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} label={`Rata-rata nilai · ${stats.n} sesi`} />
              <StatTile tone="orange" icon={<Star />} value={num(pointsTotal)} label="Poin uji kom + tryout" />
              <StatTile tone="green" icon={<Trophy />} value={bestTryout ? `#${bestTryout.rank}` : "–"} label={bestTryout ? `Peringkat di ${bestTryout.quiz.title}` : "Belum ikut tryout"} />
            </div>
          </section>
          <HelpCard />
        </>
      }
    >
      <div className="hidden lg:block">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">Uji Kom & Tryout</h1>
        <p className="mt-1 text-sm text-subtle">Jadwal dari tutor. Masuk pakai kode akses.</p>
      </div>
      <form action="/siswa/ujikom" className="relative mt-5">
        <Search className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-subtle" />
        <input name="q" defaultValue={sp.q} placeholder="Cari uji kom atau tryout" className="h-11 w-full rounded-[22px] bg-surface pl-11 pr-4 text-sm text-ink outline-none placeholder:text-subtle focus:ring-2 focus:ring-primary/25" />
      </form>
      <Segmented
        className="mt-4"
        value={jenis}
        items={[
          { value: "semua", label: "Semua", href: link({ jenis: "semua" }) },
          { value: "ujikom", label: "Uji Kom", href: link({ jenis: "ujikom" }) },
          { value: "tryout", label: "Tryout", href: link({ jenis: "tryout" }) },
        ]}
      />
      <p className="mb-2 mt-5 text-[13px] font-semibold text-ink-2">Mapel</p>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {(["Semua", ...MAPEL] as const).map((m) => (
          <MapelCard key={m} mapel={m} active={m === mapel} href={link({ mapel: m })} compact />
        ))}
      </div>

      <h2 className="mb-3 mt-6 text-[17px] font-semibold text-ink">Akan datang</h2>
      {upcoming.length === 0 && <EmptyState title="Belum ada jadwal" body="Jadwal Uji Kom dan Tryout dari tutor akan muncul di sini." />}
      <div className="flex flex-col gap-3">
        {upcoming.map((q) => {
          const start = q.startsAt ?? now;
          const live = start <= now && (!q.endsAt || q.endsAt > now);
          const today = wibDay(start) === wibDay(now);
          return (
            <Card key={q.id} className="p-4 sm:p-5">
              <div className="flex gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-soft text-center">
                  <span>
                    <span className="block text-[10px] font-semibold uppercase text-subtle">{today ? "Hari ini" : weekdayShort(start)}</span>
                    <span className="block text-lg font-semibold leading-tight text-ink">{today ? clock(start) : wibParts(start).day}</span>
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-ink">{q.kind === "tryout" ? "Tryout" : "Uji Kom"}</span>
                    {live ? (
                      <Badge variant="success">
                        <span className="size-1.5 rounded-full bg-success" /> Berlangsung
                      </Badge>
                    ) : (
                      <Badge>{relative(start, now)}</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-[16px] font-semibold leading-snug text-ink">{q.title}</p>
                  <p className="mt-0.5 text-[13px] text-subtle">
                    {q.subject === "Semua" ? "Semua mapel" : q.subject} · {q.questionIds.length} soal · {q.durationMin} menit
                  </p>
                  {!live && (
                    <p className="mt-2 flex items-center gap-1.5 text-[13px] text-subtle">
                      <Lock className="size-3.5" /> Dibuka {dayDate(start)}
                    </p>
                  )}
                </div>
              </div>
              {live && <AccessCodeButton quizId={q.id} title={q.title} total={q.questionIds.length} minutes={q.durationMin} />}
            </Card>
          );
        })}
      </div>

      <div className="mb-1 mt-8 flex items-end justify-between">
        <h2 className="text-[17px] font-semibold text-ink">Sudah dikerjakan</h2>
        <LinkButton href="/siswa/profil/riwayat" variant="link" className="text-[13px]">
          Semua
        </LinkButton>
      </div>
      <div className="divide-y divide-border-2">
        {done.map((d) => (
          <Link key={d.id} href={`/siswa/hasil/${d.id}`} className="flex items-center gap-3 py-3.5 hover:bg-sidebar">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-subtle">
                <span className="font-semibold text-ink">{d.quiz.kind === "tryout" ? "Tryout" : "Uji Kom"}</span> · {d.at ? shortDate(d.at) : ""}
              </p>
              <p className="mt-0.5 truncate text-[15px] font-semibold text-ink">{d.quiz.title}</p>
              <p className="text-[13px] text-subtle">
                {d.quiz.kind === "tryout" ? `Skor ${(d.score ?? 0) * 10}` : `Nilai ${d.score}`} · peringkat #{d.rank} dari {d.of}
              </p>
            </div>
            <ChevronRight className="size-4 text-faint" />
          </Link>
        ))}
        {done.length === 0 && <p className="py-6 text-sm text-subtle">Belum ada sesi yang selesai.</p>}
      </div>
    </SiswaPage>
  );
}
