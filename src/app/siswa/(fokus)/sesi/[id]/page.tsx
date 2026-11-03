import { and, eq, inArray } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { QuizSession, type SessionQuestion } from "@/components/siswa/quiz-session";
import { requireSiswa } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { attempts, questions, quizzes } from "@/lib/db/schema";

const EXIT: Record<string, string> = { daily: "/siswa/quiz", ujikom: "/siswa/ujikom", tryout: "/siswa/ujikom", rumath: "/siswa/rumath" };
const KIND: Record<string, string> = { daily: "Daily Quiz", ujikom: "Uji Kom", tryout: "Tryout", rumath: "RUMATH" };

export default async function SesiPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSiswa();
  const { id } = await params;
  const db = await getDb();
  const [a] = await db.select().from(attempts).where(and(eq(attempts.id, Number(id)), eq(attempts.userId, user.id)));
  if (!a) notFound();
  if (a.submittedAt) redirect(`/siswa/hasil/${a.id}`);
  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, a.quizId));
  const rows = await db.select().from(questions).where(inArray(questions.id, quiz.questionIds));
  const byId = new Map(rows.map((q) => [q.id, q]));

  // Never send answer keys or explanations to the browser.
  const qs: SessionQuestion[] = quiz.questionIds
    .map((qid) => byId.get(qid))
    .filter((q) => !!q)
    .map((q) => ({ id: q.id, type: q.type, prompt: q.prompt, options: q.type === "pg" ? q.options : [], hint: q.type === "isian" ? (q.options[0] ?? null) : null }));

  let deadline = a.startedAt.getTime() + quiz.durationMin * 60_000;
  if (quiz.endsAt) deadline = Math.min(deadline, quiz.endsAt.getTime());

  return (
    <QuizSession
      attemptId={a.id}
      title={`${KIND[quiz.kind] ?? "Quiz"} · ${quiz.title}`}
      exitHref={EXIT[quiz.kind] ?? "/siswa"}
      questions={qs}
      initialAnswers={a.answers}
      initialFlagged={a.flagged}
      deadline={deadline}
    />
  );
}
