import { sql } from "drizzle-orm";
import { connection } from "next/server";
import { getDb, queryRows } from "@/lib/db";

export async function GET() {
  await connection();
  await getDb();
  const started = Date.now();
  const rows = await queryRows<{ users: number; materials: number; questions: number; quizzes: number; attempts: number }>(sql`
    select (select count(*)::int from users) as users,
           (select count(*)::int from materials) as materials,
           (select count(*)::int from questions) as questions,
           (select count(*)::int from quizzes) as quizzes,
           (select count(*)::int from attempts) as attempts`);
  return Response.json({
    ok: true,
    database: process.env.DATABASE_URL ? "postgres" : "pglite",
    counts: rows[0],
    ms: Date.now() - started,
  });
}
