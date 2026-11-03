import { and, eq, gt, isNotNull } from "drizzle-orm";
import { AlarmClock, ClipboardCheck, Download, LineChart as LineIcon, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ColumnChart, LineChart } from "@/components/admin/charts";
import { AdminHeader } from "@/components/admin/shell";
import { Table, Td, Th } from "@/components/admin/table";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { attempts, questions, quizzes, users } from "@/lib/db/schema";
import { longDate, num, shortDate } from "@/lib/format";
import { scoreTrend } from "@/lib/queries/admin";

function Kpi({ icon, label, value, foot, sub, tone }: { icon: ReactNode; label: string; value: string; foot: string; sub: string; tone: string }) {
  return (
    <div className={`rounded-[20px] p-5 ${tone}`}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-white text-primary [&_svg]:size-[18px]">{icon}</span>
        <span className="text-sm text-ink-2">{label}</span>
      </div>
      <p className="mt-4 text-[30px] font-bold leading-none tracking-[-0.02em] text-ink">{value}</p>
      <p className="mt-3 text-sm font-semibold text-ink">{foot}</p>
      <p className="text-xs text-subtle">{sub}</p>
    </div>
  );
}

const DAYS = 60;
const since = () => new Date(Date.now() - DAYS * 86_400_000);

export default async function ReportQuizPage({ searchParams }: { searchParams: Promise<{ tipe?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const kind = sp.tipe === "daily" || sp.tipe === "tryout" ? sp.tipe : "ujikom";
  const db = await getDb();
  const rows = await db
    .select({ quizId: quizzes.id, title: quizzes.title, grade: quizzes.grade, duration: quizzes.durationMin, qids: quizzes.questionIds, score: attempts.score, answers: attempts.answers, started: attempts.startedAt, at: attempts.submittedAt, jenjang: users.jenjang })
    .from(attempts)
    .innerJoin(quizzes, eq(quizzes.id, attempts.quizId))
    .innerJoin(users, eq(users.id, attempts.userId))
    .where(and(eq(quizzes.kind, kind), isNotNull(attempts.submittedAt), gt(attempts.submittedAt, since())));
  const trend = await scoreTrend("12m", [kind]);

  const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10 : 0);
  const all = rows.map((r) => r.score ?? 0);
  const sd = rows.filter((r) => r.jenjang === "SD").map((r) => r.score ?? 0);
  const smp = rows.filter((r) => r.jenjang !== "SD").map((r) => r.score ?? 0);
  const onTime = rows.filter((r) => r.at!.getTime() - r.started.getTime() <= r.duration * 60_000 * 0.95).length;
  const buckets = [0, 0, 0, 0, 0];
  for (const s of all) buckets[Math.min(4, Math.floor(Math.max(0, s - 1) / 20))]++;
  const peak = buckets.indexOf(Math.max(...buckets));

  // Soal most often answered wrong.
  const wrong = new Map<number, number>();
  const qids = [...new Set(rows.flatMap((r) => r.qids))];
  const keys = qids.length ? await db.select({ id: questions.id, answer: questions.answer, bab: questions.bab }).from(questions) : [];
  const keyById = new Map(keys.map((k) => [k.id, k]));
  for (const r of rows) for (const id of r.qids) if (keyById.get(id) && r.answers[id] !== keyById.get(id)!.answer) wrong.set(id, (wrong.get(id) ?? 0) + 1);
  const hard = [...wrong.entries()].filter(([, n]) => n / Math.max(1, rows.length) > 0.15);
  const babWrong = new Map<string, number>();
  for (const [id, n] of wrong) babWrong.set(keyById.get(id)!.bab, (babWrong.get(keyById.get(id)!.bab) ?? 0) + n);
  const worstBab = [...babWrong.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  // Sessions table: one row per quiz.
  const sessions = new Map<number, { title: string; grade: number | null; at: Date; scores: number[] }>();
  for (const r of rows) {
    const s = sessions.get(r.quizId) ?? { title: r.title, grade: r.grade, at: r.at!, scores: [] };
    s.scores.push(r.score ?? 0);
    if (r.at! > s.at) s.at = r.at!;
    sessions.set(r.quizId, s);
  }
  const list = [...sessions.entries()].sort((a, b) => b[1].at.getTime() - a[1].at.getTime()).slice(0, 12);

  return (
    <>
      <AdminHeader
        sub="Nilai Daily Quiz, Uji Kom, dan Tryout."
        actions={
          <a href="/api/admin/export?jenis=report-quiz" className={buttonClass({ variant: "ghost" })}>
            <Download /> Export Excel
          </a>
        }
      />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          size="sm"
          className="w-[320px]"
          value={kind}
          items={[
            { value: "daily", label: "Daily Quiz", href: "/admin/report-quiz?tipe=daily" },
            { value: "ujikom", label: "Uji Kom", href: "/admin/report-quiz" },
            { value: "tryout", label: "Tryout", href: "/admin/report-quiz?tipe=tryout" },
          ]}
        />
        <p className="text-[13px] font-semibold text-ink">
          {longDate(since())} – {longDate(new Date())}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi tone="bg-primary-soft" icon={<ClipboardCheck />} label="Sesi dikerjakan" value={num(rows.length)} foot={`${num(sessions.size)} quiz berbeda`} sub={`${DAYS} hari terakhir`} />
        <Kpi tone="bg-accent-soft" icon={<LineIcon />} label="Rata-rata nilai" value={avg(all).toLocaleString("id-ID")} foot={`SD ${sd.length ? avg(sd).toLocaleString("id-ID") : "–"} · SMP ${smp.length ? avg(smp).toLocaleString("id-ID") : "–"}`} sub="Semua kelas" />
        <Kpi tone="bg-info-soft" icon={<AlarmClock />} label="Selesai tepat waktu" value={`${rows.length ? Math.round((onTime / rows.length) * 100) : 0}%`} foot={`${num(rows.length - onTime)} kehabisan waktu`} sub="Dikumpulkan sebelum timer habis" />
        <Kpi tone="bg-destructive-soft" icon={<TriangleAlert />} label="Soal sering salah" value={num(hard.length)} foot={worstBab ? `Terbanyak: ${worstBab}` : "Belum ada"} sub="Salah oleh lebih dari 15% siswa" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <p className="text-[17px] font-semibold text-ink">Tren nilai rata-rata</p>
          <p className="mb-3 text-[13px] text-subtle">Per minggu, 12 minggu terakhir</p>
          <LineChart labels={trend.labels} max={100} series={[{ name: "SD", values: trend.sd }, { name: "SMP", values: trend.smp }]} height={220} />
        </Card>
        <Card className="p-5 sm:p-6">
          <p className="text-[17px] font-semibold text-ink">Sebaran nilai</p>
          <p className="mb-3 text-[13px] text-subtle">Jumlah siswa per rentang · rentang terbanyak disorot</p>
          <ColumnChart data={["0–20", "21–40", "41–60", "61–80", "81–100"].map((label, i) => ({ label, value: buckets[i] }))} highlight={peak} height={236} />
        </Card>
      </div>

      <Table className="mt-5">
        <thead>
          <tr>
            <Th>Tanggal</Th>
            <Th>Quiz</Th>
            <Th>Kelas</Th>
            <Th>Peserta</Th>
            <Th>Rata-rata</Th>
            <Th>Tertinggi</Th>
            <Th>Terendah</Th>
            <Th className="text-right">Aksi</Th>
          </tr>
        </thead>
        <tbody>
          {list.map(([id, s]) => (
            <tr key={id} className="hover:bg-sidebar">
              <Td className="whitespace-nowrap text-ink-2">{shortDate(s.at)}</Td>
              <Td className="font-semibold">{s.title}</Td>
              <Td className="text-ink-2">{s.grade ? `Kelas ${s.grade}` : "Campuran"}</Td>
              <Td>{s.scores.length}</Td>
              <Td className="font-semibold">{avg(s.scores).toLocaleString("id-ID")}</Td>
              <Td>{Math.max(...s.scores)}</Td>
              <Td>{Math.min(...s.scores)}</Td>
              <Td className="text-right">
                <Link href={`/admin/report-quiz/${id}`} className="inline-flex h-8 items-center rounded-2xl bg-primary-soft px-3 text-xs font-semibold text-primary">
                  Detail
                </Link>
              </Td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <Td colSpan={8} className="py-10 text-center text-subtle">
                Belum ada sesi di periode ini.
              </Td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}
