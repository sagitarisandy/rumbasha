// Read models for the siswa screens.
import { and, desc, eq, gt, inArray, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import { DAILY_FREE_PER_DAY } from "../catalog";
import { wibStartOfDay } from "../format";
import { getDb } from "../db";
import { attempts, materials, notificationReads, notifications, packages, progress, quizzes, settings, users } from "../db/schema";

export type Board = "daily" | "ujikom" | "tryout";

export async function getSetting<T>(key: string): Promise<T | null> {
  const db = await getDb();
  const [row] = await db.select().from(settings).where(eq(settings.key, key));
  return (row?.value as T) ?? null;
}

export async function unreadCount(userId: number) {
  const db = await getDb();
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(notifications)
    .leftJoin(notificationReads, and(eq(notificationReads.notificationId, notifications.id), eq(notificationReads.userId, userId)))
    .where(and(or(isNull(notifications.userId), eq(notifications.userId, userId)), isNull(notificationReads.userId)));
  return row.n;
}

export async function getPackage(id: number | null) {
  if (!id) return null;
  const db = await getDb();
  const [p] = await db.select().from(packages).where(eq(packages.id, id));
  return p ?? null;
}

/** Leaderboard rows; Daily Quiz uses accumulated points, Uji Kom/Tryout the sum of best scores. */
export async function leaderboard(board: Board, jenjang: string | null, limit = 10) {
  const db = await getDb();
  if (board === "daily") {
    return db
      .select({ id: users.id, name: users.name, school: users.school, avatar: users.avatar, score: users.points, delta: users.rankDelta })
      .from(users)
      .where(and(eq(users.role, "siswa"), eq(users.active, true), jenjang ? eq(users.jenjang, jenjang as "SD" | "SMP") : undefined))
      .orderBy(desc(users.points), users.id)
      .limit(limit);
  }
  const best = db
    .select({ userId: attempts.userId, quizId: attempts.quizId, best: sql<number>`max(${attempts.score})`.as("best") })
    .from(attempts)
    .innerJoin(quizzes, eq(quizzes.id, attempts.quizId))
    .where(and(eq(quizzes.kind, board), isNotNull(attempts.submittedAt)))
    .groupBy(attempts.userId, attempts.quizId)
    .as("best");
  return db
    .select({ id: users.id, name: users.name, school: users.school, avatar: users.avatar, score: sql<number>`sum(${best.best})::int`, delta: sql<number>`0` })
    .from(best)
    .innerJoin(users, eq(users.id, best.userId))
    .where(jenjang ? eq(users.jenjang, jenjang as "SD" | "SMP") : undefined)
    .groupBy(users.id)
    .orderBy(desc(sql`sum(${best.best})`), users.id)
    .limit(limit);
}

export async function myRank(board: Board, userId: number, jenjang: string | null) {
  const rows = await leaderboard(board, jenjang, 10_000);
  const i = rows.findIndex((r) => r.id === userId);
  return { rank: i < 0 ? null : i + 1, of: rows.length, me: i < 0 ? null : rows[i] };
}

export async function totalSiswa() {
  const db = await getDb();
  const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "siswa"));
  return r.n;
}

/** Last opened PDFs with their progress. */
export async function recentReads(userId: number, limit = 3) {
  const db = await getDb();
  return db
    .select({ id: materials.id, title: materials.title, subject: materials.subject, bidang: materials.bidang, bab: materials.bab, pages: materials.pages, page: progress.page, at: progress.updatedAt })
    .from(progress)
    .innerJoin(materials, eq(materials.id, progress.materialId))
    .where(eq(progress.userId, userId))
    .orderBy(desc(progress.updatedAt))
    .limit(limit);
}

/** Per-mapel "x/y PDF" progress (a PDF counts once it was opened). */
export async function mapelProgress(userId: number) {
  const db = await getDb();
  const rows = await db
    .select({
      subject: materials.subject,
      total: sql<number>`count(*)::int`,
      opened: sql<number>`count(${progress.materialId})::int`,
    })
    .from(materials)
    .leftJoin(progress, and(eq(progress.materialId, materials.id), eq(progress.userId, userId)))
    .where(and(eq(materials.status, "publish"), eq(materials.jenjang, "SMP")))
    .groupBy(materials.subject);
  return rows;
}

/** Bab summaries for one mapel/bidang (PDF count, opened, quiz count). */
export async function babSummaries(userId: number, subject: string, bidang?: string) {
  const db = await getDb();
  const mats = await db
    .select({ bab: materials.bab, bidang: materials.bidang, id: materials.id, pages: materials.pages, page: progress.page })
    .from(materials)
    .leftJoin(progress, and(eq(progress.materialId, materials.id), eq(progress.userId, userId)))
    .where(and(eq(materials.subject, subject), eq(materials.status, "publish"), eq(materials.jenjang, "SMP"), bidang ? eq(materials.bidang, bidang) : undefined));
  const quizCounts = await db
    .select({ bab: quizzes.bab, n: sql<number>`count(*)::int` })
    .from(quizzes)
    .where(and(eq(quizzes.subject, subject), inArray(quizzes.kind, ["daily", "ujikom"]), isNotNull(quizzes.bab)))
    .groupBy(quizzes.bab);
  const map = new Map<string, { bab: string; bidang: string; pdf: number; opened: number; done: number; quiz: number }>();
  for (const m of mats) {
    const s = map.get(m.bab) ?? { bab: m.bab, bidang: m.bidang, pdf: 0, opened: 0, done: 0, quiz: 0 };
    s.pdf++;
    if (m.page) s.opened++;
    if (m.page && m.page >= m.pages) s.done++;
    map.set(m.bab, s);
  }
  for (const q of quizCounts) {
    const s = q.bab ? map.get(q.bab) : undefined;
    if (s) s.quiz = q.n;
  }
  return [...map.values()];
}

/** Daily Quiz taken today (for the free quota). */
export async function dailyUsedToday(userId: number) {
  const db = await getDb();
  const start = wibStartOfDay();
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(attempts)
    .innerJoin(quizzes, eq(quizzes.id, attempts.quizId))
    .where(and(eq(attempts.userId, userId), eq(quizzes.kind, "daily"), gt(attempts.startedAt, start)));
  return { used: r.n, free: Math.max(0, DAILY_FREE_PER_DAY - r.n) };
}

export async function quizHistory(userId: number, kinds: string[], limit = 5) {
  const db = await getDb();
  return db
    .select({ id: attempts.id, quizId: quizzes.id, title: quizzes.title, kind: quizzes.kind, subject: quizzes.subject, bab: quizzes.bab, level: quizzes.level, score: attempts.score, correct: attempts.correct, total: attempts.total, at: attempts.submittedAt })
    .from(attempts)
    .innerJoin(quizzes, eq(quizzes.id, attempts.quizId))
    .where(and(eq(attempts.userId, userId), inArray(quizzes.kind, kinds as ("daily" | "ujikom" | "tryout" | "rumath")[]), isNotNull(attempts.submittedAt)))
    .orderBy(desc(attempts.submittedAt))
    .limit(limit);
}

export async function quizStats(userId: number, kinds: string[]) {
  const db = await getDb();
  const [r] = await db
    .select({ n: sql<number>`count(*)::int`, avg: sql<number>`coalesce(avg(${attempts.score}), 0)::float` })
    .from(attempts)
    .innerJoin(quizzes, eq(quizzes.id, attempts.quizId))
    .where(and(eq(attempts.userId, userId), inArray(quizzes.kind, kinds as ("daily" | "ujikom" | "tryout" | "rumath")[]), isNotNull(attempts.submittedAt)));
  return r;
}

/** Top rows + the current siswa for the three leaderboards (Beranda and Peringkat panels). */
export async function getBoards(user: { id: number; jenjang: string | null; rankDelta: number }, limit = 10) {
  const boards = {} as Record<Board, { top: { id: number; name: string; school: string | null; avatar: number; score: number; rank: number }[]; me: { id: number; name: string; school: string | null; avatar: number; score: number; rank: number } | null; delta: number; unit: string; of: number }>;
  for (const b of ["daily", "ujikom", "tryout"] as const) {
    const all = await leaderboard(b, user.jenjang, 10_000);
    const ranked = all.map((r, i) => ({ id: r.id, name: r.name, school: r.school, avatar: r.avatar, score: Number(r.score), rank: i + 1 }));
    boards[b] = {
      top: ranked.slice(0, limit),
      me: ranked.find((r) => r.id === user.id) ?? null,
      delta: b === "daily" ? user.rankDelta : 0,
      unit: b === "daily" ? "poin" : "nilai",
      of: ranked.length,
    };
  }
  return boards;
}

export type RankFilter = { board: Board; period: "minggu" | "bulan" | "semua"; grade?: number | null; school?: string | null; jenjang: string | null; quizId?: number };

/**
 * Full leaderboard for the Peringkat page. Daily Quiz: poin (all time) or poin earned in the
 * period (score/2 per quiz). Uji Kom/Tryout: sum of best scores. quizId: best score in that quiz.
 */
export async function rankBoard(f: RankFilter) {
  const db = await getDb();
  const since = f.period === "minggu" ? new Date(Date.now() - 7 * 86_400_000) : f.period === "bulan" ? new Date(Date.now() - 30 * 86_400_000) : null;
  const who = and(eq(users.role, "siswa"), eq(users.active, true), f.jenjang ? eq(users.jenjang, f.jenjang as "SD" | "SMP") : undefined, f.grade ? eq(users.grade, f.grade) : undefined, f.school ? eq(users.school, f.school) : undefined);

  let rows: { id: number; name: string; school: string | null; avatar: number; score: number; delta: number }[];
  if (f.board === "daily" && !since && !f.quizId) {
    rows = await db.select({ id: users.id, name: users.name, school: users.school, avatar: users.avatar, score: users.points, delta: users.rankDelta }).from(users).where(who).orderBy(desc(users.points), users.id);
  } else {
    const best = db
      .select({ userId: attempts.userId, quizId: attempts.quizId, best: sql<number>`max(${attempts.score})`.as("best") })
      .from(attempts)
      .innerJoin(quizzes, eq(quizzes.id, attempts.quizId))
      .where(
        and(
          isNotNull(attempts.submittedAt),
          f.quizId ? eq(attempts.quizId, f.quizId) : eq(quizzes.kind, f.board),
          since ? gt(attempts.submittedAt, since) : undefined,
        ),
      )
      .groupBy(attempts.userId, attempts.quizId)
      .as("best");
    const total = f.board === "daily" && !f.quizId ? sql<number>`sum(${best.best} / 2)::int` : sql<number>`sum(${best.best})::int`;
    rows = await db
      .select({ id: users.id, name: users.name, school: users.school, avatar: users.avatar, score: total, delta: users.rankDelta })
      .from(best)
      .innerJoin(users, eq(users.id, best.userId))
      .where(who)
      .groupBy(users.id)
      .orderBy(desc(total), users.id);
  }
  return rows.map((r, i) => ({ ...r, score: Number(r.score), rank: i + 1 }));
}

export async function monthStats(userId: number, from: Date, to: Date) {
  const db = await getDb();
  const rows = await db
    .select({ kind: quizzes.kind, score: attempts.score, correct: attempts.correct })
    .from(attempts)
    .innerJoin(quizzes, eq(quizzes.id, attempts.quizId))
    .where(and(eq(attempts.userId, userId), isNotNull(attempts.submittedAt), gt(attempts.submittedAt, from), lt(attempts.submittedAt, to)));
  return rows;
}
