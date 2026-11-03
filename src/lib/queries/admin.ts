import { and, desc, eq, gt, inArray, isNotNull, sql } from "drizzle-orm";
import { getDb, queryRows } from "../db";
import { shortDate } from "../format";
import { attempts, quizzes, users } from "../db/schema";

/** Average Daily Quiz score per bucket for SD and SMP. range: "12m" (weeks), "30h", "7h" (days). */
export async function scoreTrend(range: "12m" | "30h" | "7h", kinds: string[] = ["daily"]) {
  const db = await getDb();
  const days = range === "12m" ? 84 : range === "30h" ? 30 : 7;
  const since = new Date(Date.now() - days * 86_400_000);
  const rows = await db
    .select({ at: attempts.submittedAt, score: attempts.score, jenjang: users.jenjang })
    .from(attempts)
    .innerJoin(quizzes, eq(quizzes.id, attempts.quizId))
    .innerJoin(users, eq(users.id, attempts.userId))
    .where(and(isNotNull(attempts.submittedAt), gt(attempts.submittedAt, since), inArray(quizzes.kind, kinds as ("daily" | "ujikom" | "tryout" | "rumath")[])));
  const buckets = range === "12m" ? 12 : days;
  const size = range === "12m" ? 7 : 1;
  const start = since.getTime();
  const agg = { SD: Array.from({ length: buckets }, () => [0, 0]), SMP: Array.from({ length: buckets }, () => [0, 0]) };
  for (const r of rows) {
    const b = Math.min(buckets - 1, Math.floor((r.at!.getTime() - start) / (size * 86_400_000)));
    const j = r.jenjang === "SD" ? "SD" : "SMP";
    agg[j][b][0] += r.score ?? 0;
    agg[j][b][1]++;
  }
  const labels = Array.from({ length: buckets }, (_, i) => {
    if (range === "12m") return `M${i + 1}`;
    const d = new Date(start + (i + 1) * 86_400_000);
    return shortDate(d);
  });
  const avg = (a: number[][]) => a.map(([s, n]) => (n ? Math.round((s / n) * 10) / 10 : null));
  return { labels, sd: avg(agg.SD), smp: avg(agg.SMP) };
}

export async function counts() {
  const rows = await queryRows<Record<string, number>>(sql`
    select
      (select count(*)::int from users) as users,
      (select count(*)::int from users where role = 'siswa') as siswa,
      (select count(*)::int from users where role = 'tutor') as tutor,
      (select count(*)::int from users where role in ('admin','super')) as admin,
      (select count(*)::int from users where created_at > now() - interval '30 days') as users_new,
      (select count(*)::int from questions where tag is distinct from 'RUMATH-auto') as soal,
      (select count(*)::int from questions where tag is distinct from 'RUMATH-auto' and created_at > now() - interval '7 days') as soal_new,
      (select count(*)::int from questions where jenjang = 'SD' and tag is distinct from 'RUMATH-auto') as soal_sd,
      (select count(*)::int from materials) as materi,
      (select count(*)::int from materials where status = 'publish' and updated_at > now() - interval '7 days') as materi_new,
      (select count(*)::int from materials where jenjang = 'SD') as materi_sd,
      (select count(*)::int from attempts where started_at > now() - interval '30 days') as att_all,
      (select count(*)::int from attempts where started_at > now() - interval '30 days' and submitted_at is not null) as att_done,
      (select count(*)::int from attempts where started_at between now() - interval '60 days' and now() - interval '30 days' and submitted_at is not null) as att_prev
  `);
  return rows[0];
}

export async function activeSessions() {
  const db = await getDb();
  const now = new Date();
  const rows = await db.select().from(quizzes).where(and(inArray(quizzes.kind, ["ujikom", "tryout"]), eq(quizzes.status, "aktif")));
  return rows.filter((q) => q.startsAt && q.startsAt <= now && (!q.endsAt || q.endsAt > now)).length;
}

export async function recentAttemptsBy(userIds: number[]) {
  if (!userIds.length) return [];
  const db = await getDb();
  return db.select().from(attempts).where(inArray(attempts.userId, userIds)).orderBy(desc(attempts.submittedAt)).limit(50);
}
