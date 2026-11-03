"use server";

import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { attempts, questions, quizzes } from "@/lib/db/schema";

export type TrialResult = { correct: number; total: number; strong: string | null; weak: string | null };

/** Grades the public trial quiz. Stored without a user so admins can count trial takers. */
export async function gradeTrial(ids: number[], answers: Record<string, string>): Promise<TrialResult> {
  const clean = ids.slice(0, 10).filter((n) => Number.isInteger(n));
  const db = await getDb();
  const rows = clean.length ? await db.select().from(questions).where(inArray(questions.id, clean)) : [];
  const perBab = new Map<string, { ok: number; n: number }>();
  let correct = 0;
  for (const q of rows) {
    const ok = answers[q.id] === q.answer;
    if (ok) correct++;
    const s = perBab.get(q.bab) ?? { ok: 0, n: 0 };
    perBab.set(q.bab, { ok: s.ok + (ok ? 1 : 0), n: s.n + 1 });
  }
  const ranked = [...perBab.entries()].sort((a, b) => b[1].ok / b[1].n - a[1].ok / a[1].n);
  const [trial] = await db.select({ id: quizzes.id }).from(quizzes).where(eq(quizzes.kind, "trial")).limit(1);
  if (trial) {
    const now = new Date();
    await db.insert(attempts).values({ quizId: trial.id, answers, total: rows.length, correct, score: Math.round((correct / Math.max(1, rows.length)) * 100), startedAt: new Date(now.getTime() - 5 * 60_000), submittedAt: now });
  }
  return {
    correct,
    total: rows.length,
    strong: ranked[0] && ranked[0][1].ok > 0 ? ranked[0][0] : null,
    weak: ranked.length > 1 && ranked[ranked.length - 1][1].ok < ranked[ranked.length - 1][1].n ? ranked[ranked.length - 1][0] : null,
  };
}
