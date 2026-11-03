import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/shell";
import { Table, Td, Th } from "@/components/admin/table";
import { MathText } from "@/components/app/math-text";
import { Avatar } from "@/components/app/visuals";
import { Card, Progress } from "@/components/ui/misc";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { attempts, questions, quizzes, users } from "@/lib/db/schema";
import { duration, longDate } from "@/lib/format";
import { KIND_LABEL } from "@/lib/queries/hasil";

export default async function DetailSesiPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const db = await getDb();
  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, Number(id)));
  if (!quiz) notFound();
  const [rows, qs] = await Promise.all([
    db
      .select({ id: attempts.id, name: users.name, school: users.school, avatar: users.avatar, score: attempts.score, correct: attempts.correct, total: attempts.total, answers: attempts.answers, started: attempts.startedAt, at: attempts.submittedAt })
      .from(attempts)
      .innerJoin(users, eq(users.id, attempts.userId))
      .where(and(eq(attempts.quizId, quiz.id), isNotNull(attempts.submittedAt)))
      .orderBy(desc(attempts.score)),
    quiz.questionIds.length ? db.select().from(questions).where(inArray(questions.id, quiz.questionIds)) : [],
  ]);
  const perSoal = qs
    .map((q) => ({ q, right: rows.filter((r) => r.answers[q.id] === q.answer).length }))
    .sort((a, b) => a.right - b.right);
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + (r.score ?? 0), 0) / rows.length) : 0;

  return (
    <>
      <AdminHeader back="/admin/report-quiz" title={quiz.title} sub={`${KIND_LABEL[quiz.kind]} · ${rows.length} peserta · rata-rata ${avg}${quiz.startsAt ? ` · ${longDate(quiz.startsAt)}` : ""}`} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Siswa</Th>
              <Th>Benar</Th>
              <Th>Nilai</Th>
              <Th>Waktu</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <Td className="font-semibold">{i + 1}</Td>
                <Td>
                  <span className="flex items-center gap-3">
                    <Avatar n={r.avatar} className="size-8" />
                    <span>
                      <span className="block font-semibold">{r.name}</span>
                      <span className="text-xs text-subtle">{r.school}</span>
                    </span>
                  </span>
                </Td>
                <Td>
                  {r.correct}/{r.total}
                </Td>
                <Td className={`font-semibold ${(r.score ?? 0) >= 75 ? "text-success-ink" : (r.score ?? 0) < 60 ? "text-destructive-ink" : "text-ink"}`}>{r.score}</Td>
                <Td className="text-ink-2">{duration(Math.min(quiz.durationMin * 60, Math.round((r.at!.getTime() - r.started.getTime()) / 1000)))}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Card className="h-fit p-5">
          <p className="font-semibold text-ink">Soal paling sering salah</p>
          <p className="mb-3 text-[13px] text-subtle">Persentase siswa yang menjawab benar</p>
          <div className="flex flex-col gap-4">
            {perSoal.slice(0, 8).map(({ q, right }) => {
              const pct = rows.length ? Math.round((right / rows.length) * 100) : 0;
              return (
                <div key={q.id}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="line-clamp-1 text-ink">
                      <MathText text={q.prompt} />
                    </span>
                    <span className="shrink-0 font-semibold text-ink">{pct}%</span>
                  </div>
                  <p className="mb-1 text-xs text-subtle">
                    Q-{1000 + q.id} · {q.bab}
                  </p>
                  <Progress value={pct} color={pct < 50 ? "#E36A20" : "#5558C9"} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
