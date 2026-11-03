import { and, eq, gt, inArray, isNotNull, sql } from "drizzle-orm";
import { CircleCheck, Coins, Download, PlayCircle, Repeat } from "lucide-react";
import type { ReactNode } from "react";
import { ColumnChart } from "@/components/admin/charts";
import { AdminHeader } from "@/components/admin/shell";
import { Table, Td, Th } from "@/components/admin/table";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/misc";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { attempts, questions, quizzes, users, videoProgress } from "@/lib/db/schema";
import { monthLabel, num, wibMonthStart, wibParts } from "@/lib/format";
import { RUMATH_JENIS } from "@/lib/rumath";

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

function window30() {
  const { y, m } = wibParts(new Date());
  return { from: wibMonthStart(y, m - 1), label: `${monthLabel(wibMonthStart(y, m - 1))} – sekarang` };
}

export default async function ReportRumathPage() {
  await requireStaff();
  const { from, label } = window30();
  const db = await getDb();
  const [rows, watched] = await Promise.all([
    db
      .select({ userId: attempts.userId, jenis: quizzes.bab, level: quizzes.level, qids: quizzes.questionIds, coin: quizzes.coinCost, correct: attempts.correct, total: attempts.total, answers: attempts.answers, jenjang: users.jenjang })
      .from(attempts)
      .innerJoin(quizzes, eq(quizzes.id, attempts.quizId))
      .innerJoin(users, eq(users.id, attempts.userId))
      .where(and(eq(quizzes.kind, "rumath"), isNotNull(attempts.submittedAt), gt(attempts.submittedAt, from))),
    db.select({ n: sql<number>`count(*)::int`, secs: sql<number>`coalesce(sum(${videoProgress.seconds}), 0)::int` }).from(videoProgress).where(gt(videoProgress.updatedAt, from)),
  ]);
  const ids = [...new Set(rows.flatMap((r) => r.qids))];
  const keys = ids.length ? await db.select({ id: questions.id, answer: questions.answer }).from(questions).where(inArray(questions.id, ids)) : [];
  const keyById = new Map(keys.map((k) => [k.id, k]));
  const avgRight = (xs: typeof rows) => (xs.length ? Math.round((xs.reduce((s, r) => s + (r.correct ?? 0), 0) / xs.length) * 10) / 10 : 0);
  const byLevel = (l: string) => avgRight(rows.filter((r) => r.level === l));
  const coin = rows.reduce((s, r) => s + r.coin, 0);
  const learners = new Set(rows.map((r) => r.userId)).size;
  const perJenis = RUMATH_JENIS.map((j) => {
    const xs = rows.filter((r) => r.jenis === j.name);
    const miss = new Map<number, number>();
    for (const r of xs) for (const id of r.qids) if (keyById.get(id) && r.answers[id] !== keyById.get(id)!.answer) miss.set(id, (miss.get(id) ?? 0) + 1);
    const hardest = [...miss.entries()].sort((a, b) => b[1] - a[1])[0];
    return { jenis: j.name, n: xs.length, peserta: new Set(xs.map((r) => r.userId)).size, avg: avgRight(xs), hardest: hardest ? keyById.get(hardest[0]) : null, coin: xs.reduce((s, r) => s + r.coin, 0) };
  });

  return (
    <>
      <AdminHeader
        sub="Latihan berhitung siswa SD dan SMP."
        actions={
          <a href="/api/admin/export?jenis=report-rumath" className={buttonClass({ variant: "ghost" })}>
            <Download /> Export Excel
          </a>
        }
      />
      <p className="mb-4 text-[13px] font-semibold text-ink">{label}</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi tone="bg-primary-soft" icon={<Repeat />} label="Sesi latihan" value={num(rows.length)} foot={`${num(learners)} siswa berlatih`} sub="Latihan yang selesai dikumpulkan" />
        <Kpi tone="bg-accent-soft" icon={<CircleCheck />} label="Rata-rata benar" value={`${avgRight(rows).toLocaleString("id-ID")}/10`} foot={`Lv1 ${byLevel("1").toLocaleString("id-ID")} · Lv2 ${byLevel("2").toLocaleString("id-ID")} · Lv3 ${byLevel("3").toLocaleString("id-ID")}`} sub="Per 10 soal" />
        <Kpi tone="bg-success-soft" icon={<PlayCircle />} label="Video ditonton" value={`${num(Math.round(watched[0].secs / 3600))} jam`} foot={`${num(watched[0].n)} video diputar`} sub="Total durasi tonton" />
        <Kpi tone="bg-cream" icon={<Coins />} label="Coin terpakai" value={num(coin)} foot={`Rata-rata ${learners ? Math.round(coin / learners) : 0} per siswa`} sub="Dari biaya latihan RUMATH" />
      </div>

      <Card className="mt-5 p-5 sm:p-6">
        <p className="text-[17px] font-semibold text-ink">Latihan per jenis soal</p>
        <p className="mb-3 text-[13px] text-subtle">Jumlah sesi latihan, {label.toLowerCase()}</p>
        <ColumnChart data={perJenis.map((p) => ({ label: p.jenis, value: p.n }))} height={240} />
      </Card>

      <Table className="mt-5">
        <thead>
          <tr>
            <Th>Jenis</Th>
            <Th>Sesi</Th>
            <Th>Peserta</Th>
            <Th>Rata-rata benar</Th>
            <Th>Soal tersulit</Th>
            <Th>Coin terpakai</Th>
          </tr>
        </thead>
        <tbody>
          {perJenis.map((p) => (
            <tr key={p.jenis}>
              <Td className="font-semibold">{p.jenis}</Td>
              <Td>{num(p.n)}</Td>
              <Td>{num(p.peserta)}</Td>
              <Td>{p.avg.toLocaleString("id-ID")}</Td>
              <Td className="text-ink-2">{p.hardest ? `R-${1000 + p.hardest.id}` : "—"}</Td>
              <Td>{num(p.coin)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
