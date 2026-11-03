"use server";

import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { DAILY_COIN_COST, DAILY_FREE_PER_DAY, DAILY_MINUTES, DAILY_QUESTIONS } from "@/lib/catalog";
import { requireSiswa } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { attempts, coinTx, notifications, packages, questions, quizzes, users, videoProgress } from "@/lib/db/schema";
import { isCorrect, pointsFor } from "@/lib/queries/hasil";
import { RUMATH_COIN, RUMATH_JENIS, RUMATH_MINUTES, RUMATH_QUESTIONS, rumathSoal, type RumathJenis } from "@/lib/rumath";
import { dailyUsedToday } from "@/lib/queries/siswa";

export type ActionResult = { error?: string };

const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

/** Daily Quiz: 5 random soal from the bank for the chosen bab + level. 2 free a day, then 10 coin. */
export async function startDaily(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const user = await requireSiswa();
  const subject = String(form.get("mapel") ?? "");
  const bidang = String(form.get("bidang") ?? "");
  const bab = String(form.get("bab") ?? "");
  const level = String(form.get("level") ?? "Mudah") as "Mudah" | "Sedang" | "Sulit";
  if (!subject || subject === "Semua") return { error: "Pilih mapel dulu." };

  const db = await getDb();
  const { free } = await dailyUsedToday(user.id);
  if (free <= 0 && user.coin < DAILY_COIN_COST) return { error: `Jatah gratis habis dan coin kurang (butuh ${DAILY_COIN_COST}). Isi coin dulu, ya.` };

  const pool = await db
    .select({ id: questions.id, bab: questions.bab, bidang: questions.bidang, level: questions.level })
    .from(questions)
    .where(and(eq(questions.subject, subject), eq(questions.type, "pg"), eq(questions.jenjang, user.jenjang ?? "SMP")));
  const tiers = [
    pool.filter((q) => q.bab === bab && q.level === level),
    pool.filter((q) => q.bab === bab),
    pool.filter((q) => q.bidang === bidang),
    pool,
  ];
  const picked: number[] = [];
  for (const tier of tiers) {
    for (const q of shuffle(tier)) if (picked.length < DAILY_QUESTIONS && !picked.includes(q.id)) picked.push(q.id);
  }
  if (picked.length === 0) return { error: "Bank soal untuk materi ini belum ada. Coba bab lain." };

  const [quiz] = await db
    .insert(quizzes)
    .values({ title: `${bab || bidang || subject} · ${level}`, kind: "daily", subject, bidang: bidang || null, bab: bab || null, level, jenjang: user.jenjang ?? "SMP", durationMin: DAILY_MINUTES, questionIds: picked, createdBy: `auto:${user.id}` })
    .returning();
  if (free <= 0) {
    await db.update(users).set({ coin: sql`${users.coin} - ${DAILY_COIN_COST}` }).where(eq(users.id, user.id));
    await db.insert(coinTx).values({ userId: user.id, amount: -DAILY_COIN_COST, note: "Daily Quiz tambahan", by: "sistem" });
  }
  const [att] = await db.insert(attempts).values({ userId: user.id, quizId: quiz.id, total: picked.length }).returning();
  redirect(`/student/session/${att.id}`);
}

function windowError(q: typeof quizzes.$inferSelect, now = new Date()) {
  if (q.status === "draft") return "Quiz ini belum dibuka.";
  if (q.startsAt && now < q.startsAt) return "Sesi belum dimulai. Tunggu jadwalnya, ya.";
  if (q.endsAt && now > q.endsAt) return "Sesi sudah ditutup.";
  return null;
}

/** Checks a Uji Kom / Tryout access code without starting the quiz. */
export async function checkCode(quizId: number, code: string): Promise<{ ok: boolean; error?: string; total?: number; minutes?: number }> {
  await requireSiswa();
  const db = await getDb();
  const [q] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
  if (!q) return { ok: false, error: "Quiz tidak ditemukan." };
  const w = windowError(q);
  if (w) return { ok: false, error: w };
  if ((q.accessCode ?? "").toUpperCase() !== code.trim().toUpperCase()) return { ok: false, error: "Kode salah. Cek lagi kode dari tutor." };
  return { ok: true, total: q.questionIds.length, minutes: q.durationMin };
}

/** Starts (or resumes) Uji Kom, Tryout and RUMATH sessions. */
export async function startQuiz(quizId: number, code?: string): Promise<ActionResult> {
  const user = await requireSiswa();
  const db = await getDb();
  const [q] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
  if (!q) return { error: "Quiz tidak ditemukan." };

  const [open] = await db.select().from(attempts).where(and(eq(attempts.userId, user.id), eq(attempts.quizId, q.id), isNull(attempts.submittedAt)));
  if (open) redirect(`/student/session/${open.id}`);

  if (q.kind === "ujikom" || q.kind === "tryout") {
    const w = windowError(q);
    if (w) return { error: w };
    if ((q.accessCode ?? "").toUpperCase() !== (code ?? "").trim().toUpperCase()) return { error: "Kode salah." };
    const [done] = await db.select({ id: attempts.id }).from(attempts).where(and(eq(attempts.userId, user.id), eq(attempts.quizId, q.id)));
    if (done) redirect(`/student/results/${done.id}`);
  }
  if (q.kind === "rumath" && q.coinCost > 0) {
    const pkg = user.packageId ? (await db.select().from(packages).where(eq(packages.id, user.packageId)))[0] : null;
    const free = pkg?.features.some((f) => f.toLowerCase().includes("rumath tanpa coin"));
    if (!free) {
      if (user.coin < q.coinCost) return { error: `Coin kurang. RUMATH butuh ${q.coinCost} coin.` };
      await db.update(users).set({ coin: sql`${users.coin} - ${q.coinCost}` }).where(eq(users.id, user.id));
      await db.insert(coinTx).values({ userId: user.id, amount: -q.coinCost, note: q.title, by: "sistem" });
    }
  }
  const [att] = await db.insert(attempts).values({ userId: user.id, quizId: q.id, total: q.questionIds.length }).returning();
  redirect(`/student/session/${att.id}`);
}

async function ownOpenAttempt(attemptId: number) {
  const user = await requireSiswa();
  const db = await getDb();
  const [a] = await db.select().from(attempts).where(and(eq(attempts.id, attemptId), eq(attempts.userId, user.id)));
  if (!a || a.submittedAt) return null;
  return { db, a, user };
}

export async function saveAnswer(attemptId: number, questionId: number, answer: string | null) {
  const ctx = await ownOpenAttempt(attemptId);
  if (!ctx) return;
  const answers = { ...ctx.a.answers };
  if (answer === null || answer === "") delete answers[questionId];
  else answers[questionId] = answer;
  await ctx.db.update(attempts).set({ answers }).where(eq(attempts.id, attemptId));
}

export async function toggleFlag(attemptId: number, questionId: number) {
  const ctx = await ownOpenAttempt(attemptId);
  if (!ctx) return;
  const flagged = ctx.a.flagged.includes(questionId) ? ctx.a.flagged.filter((x) => x !== questionId) : [...ctx.a.flagged, questionId];
  await ctx.db.update(attempts).set({ flagged }).where(eq(attempts.id, attemptId));
}

/** Grades and closes the attempt, adds poin, then shows the result page. */
export async function submitAttempt(attemptId: number, finalAnswers?: Record<string, string>) {
  const ctx = await ownOpenAttempt(attemptId);
  if (!ctx) redirect(`/student/results/${attemptId}`);
  const { db, a, user } = ctx;
  const answers = finalAnswers ? { ...a.answers, ...finalAnswers } : a.answers;
  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, a.quizId));
  const qs = await db.select().from(questions).where(inArray(questions.id, quiz.questionIds));
  const correct = qs.filter((q) => isCorrect(q, answers[q.id])).length;
  const total = quiz.questionIds.length;
  const score = Math.round((correct / Math.max(1, total)) * 100);
  const points = pointsFor(quiz.kind, score, correct);

  await db.update(attempts).set({ answers, correct, score, total, submittedAt: new Date() }).where(eq(attempts.id, a.id));
  if (points > 0) await db.update(users).set({ points: sql`${users.points} + ${points}` }).where(eq(users.id, user.id));
  if (quiz.kind === "ujikom" || quiz.kind === "tryout") {
    await db.insert(notifications).values({ userId: user.id, kind: "quiz", title: `Hasil ${quiz.title} sudah keluar`, body: `Nilai kamu ${score}. Lihat pembahasan untuk soal yang salah.`, href: `/student/results/${a.id}` });
  }
  redirect(`/student/results/${a.id}`);
}

/** RUMATH "Cek jawaban": saves the isian answer and tells right away whether it was right. */
export async function checkIsian(attemptId: number, questionId: number, answer: string): Promise<{ correct: boolean; expected: string; explanation: string | null } | null> {
  const ctx = await ownOpenAttempt(attemptId);
  if (!ctx) return null;
  const [q] = await ctx.db.select().from(questions).where(eq(questions.id, questionId));
  if (!q) return null;
  await ctx.db.update(attempts).set({ answers: { ...ctx.a.answers, [questionId]: answer } }).where(eq(attempts.id, attemptId));
  return { correct: isCorrect(q, answer), expected: q.answer, explanation: q.explanation };
}

/** RUMATH latihan: 10 generated isian soal for the chosen jenis + level, then the usual coin check. */
export async function startRumath(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const user = await requireSiswa();
  const jenis = String(form.get("jenis") ?? "Penjumlahan") as RumathJenis;
  const level = Math.max(1, Math.min(3, Number(form.get("level") ?? 1)));
  if (!RUMATH_JENIS.some((j) => j.name === jenis)) return { error: "Jenis soal tidak dikenal." };
  const db = await getDb();
  const levelName = (["Mudah", "Sedang", "Sulit"] as const)[level - 1];
  const gen = Array.from({ length: RUMATH_QUESTIONS }, () => rumathSoal(jenis, level));
  const ids = await db
    .insert(questions)
    .values(gen.map((g) => ({ subject: "Matematika", bidang: "RUMATH", bab: jenis, jenjang: user.jenjang ?? ("SMP" as const), grade: user.grade ?? 7, level: levelName, type: "isian" as const, prompt: g.prompt, options: [g.hint], answer: g.answer, explanation: g.explanation, tag: "RUMATH-auto" })))
    .returning({ id: questions.id });
  const [quiz] = await db
    .insert(quizzes)
    .values({ title: `${jenis} Lv ${level}`, kind: "rumath", subject: "Matematika", bidang: "RUMATH", bab: jenis, level: String(level), jenjang: user.jenjang ?? "SMP", durationMin: RUMATH_MINUTES, questionIds: ids.map((x) => x.id), coinCost: RUMATH_COIN, createdBy: `auto:${user.id}` })
    .returning();
  return startQuiz(quiz.id);
}

export async function saveVideo(videoId: number, seconds: number, done: boolean) {
  const user = await requireSiswa();
  const db = await getDb();
  await db
    .insert(videoProgress)
    .values({ userId: user.id, videoId, seconds: Math.round(seconds), done, updatedAt: new Date() })
    .onConflictDoUpdate({ target: [videoProgress.userId, videoProgress.videoId], set: { seconds: sql`greatest(${videoProgress.seconds}, ${Math.round(seconds)})`, done: sql`${videoProgress.done} or ${done}`, updatedAt: new Date() } });
}

export async function toggleSaveVideo(videoId: number) {
  const user = await requireSiswa();
  const db = await getDb();
  await db
    .insert(videoProgress)
    .values({ userId: user.id, videoId, saved: true })
    .onConflictDoUpdate({ target: [videoProgress.userId, videoProgress.videoId], set: { saved: sql`not ${videoProgress.saved}` } });
}
