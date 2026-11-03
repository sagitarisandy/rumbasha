import { and, asc, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { getDb } from "../db";
import { attempts, materials, questions, quizzes } from "../db/schema";

export const KIND_LABEL: Record<string, string> = { daily: "Daily Quiz", ujikom: "Uji Kom", tryout: "Tryout", rumath: "RUMATH", trial: "Quiz Trial" };

export const pointsFor = (kind: string, score: number, correct: number) =>
  kind === "daily" ? Math.round(score / 2) : kind === "ujikom" || kind === "tryout" ? Math.round(score * 1.4) : kind === "rumath" ? correct * 10 : 0;

export function isCorrect(q: { type: string; answer: string }, given: string | undefined) {
  if (given === undefined) return false;
  return q.type === "isian" ? Number(String(given).replace(",", ".")) === Number(q.answer) : given === q.answer;
}

/** Everything the result and pembahasan pages need for one submitted attempt. */
export async function loadResult(attemptId: number, userId: number) {
  const db = await getDb();
  const [a] = await db.select().from(attempts).where(and(eq(attempts.id, attemptId), eq(attempts.userId, userId)));
  if (!a || !a.submittedAt) return null;
  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, a.quizId));
  const rows = await db.select().from(questions).where(inArray(questions.id, quiz.questionIds));
  const byId = new Map(rows.map((q) => [q.id, q]));
  const items = quiz.questionIds
    .map((id) => byId.get(id))
    .filter((q) => !!q)
    .map((q) => {
      const given = a.answers[q.id];
      return { q, given, status: given === undefined ? ("kosong" as const) : isCorrect(q, given) ? ("benar" as const) : ("salah" as const) };
    });
  const benar = items.filter((x) => x.status === "benar").length;
  const salah = items.filter((x) => x.status === "salah").length;

  // Rank among everyone who finished this quiz (best attempt per siswa).
  const board = await db
    .select({ userId: attempts.userId, best: sql<number>`max(${attempts.score})`.as("best") })
    .from(attempts)
    .where(and(eq(attempts.quizId, quiz.id), isNotNull(attempts.submittedAt)))
    .groupBy(attempts.userId)
    .orderBy(desc(sql`max(${attempts.score})`));
  const rank = board.findIndex((r) => r.userId === userId) + 1;
  const avg = board.length ? Math.round(board.reduce((s, r) => s + Number(r.best), 0) / board.length) : null;

  // "Perlu diulang": the bab of wrong/empty soal, mapped to PDFs of that bab.
  const wrongByBab = new Map<string, number>();
  for (const it of items) if (it.status !== "benar") wrongByBab.set(it.q.bab, (wrongByBab.get(it.q.bab) ?? 0) + 1);
  const babs = [...wrongByBab.keys()];
  const mats = babs.length
    ? await db
        .select({ id: materials.id, title: materials.title, bab: materials.bab })
        .from(materials)
        .where(and(inArray(materials.bab, babs), eq(materials.subject, quiz.subject === "Semua" ? materials.subject : quiz.subject), eq(materials.status, "publish")))
        .orderBy(asc(materials.id))
    : [];
  const review = babs
    .sort((x, y) => (wrongByBab.get(y) ?? 0) - (wrongByBab.get(x) ?? 0))
    .slice(0, 3)
    .map((bab) => ({ bab, wrong: wrongByBab.get(bab) ?? 0, material: mats.find((m) => m.bab === bab) ?? null }));

  return {
    attempt: a,
    quiz,
    items,
    benar,
    salah,
    kosong: items.length - benar - salah,
    score: a.score ?? 0,
    points: pointsFor(quiz.kind, a.score ?? 0, benar),
    rank: rank || null,
    participants: board.length,
    avg,
    seconds: Math.max(0, Math.round((a.submittedAt.getTime() - a.startedAt.getTime()) / 1000)),
    review,
  };
}
