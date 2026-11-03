import { asc, isNull, ne, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { questions, quizzes } from "@/lib/db/schema";
import type { BankItem } from "./quiz-builder";

/** Curated bank soal with how often each soal is already used (for the quiz builder). */
export async function bankForBuilder(): Promise<BankItem[]> {
  const db = await getDb();
  const [rows, qz] = await Promise.all([
    db.select().from(questions).where(or(isNull(questions.tag), ne(questions.tag, "RUMATH-auto"))).orderBy(asc(questions.id)),
    db.select({ ids: quizzes.questionIds }).from(quizzes),
  ]);
  const used = new Map<number, number>();
  for (const q of qz) for (const id of q.ids) used.set(id, (used.get(id) ?? 0) + 1);
  return rows.map((r) => ({ id: r.id, prompt: r.prompt, subject: r.subject, bab: r.bab, level: r.level, type: r.type, jenjang: r.jenjang, used: used.get(r.id) ?? 0 }));
}
