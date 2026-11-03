import { asc, desc, eq, inArray, isNotNull, and } from "drizzle-orm";
import { readSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { attempts, packages, quizzes, users } from "@/lib/db/schema";
import { longDate } from "@/lib/format";
import { rankBoard, type Board } from "@/lib/queries/siswa";

const csv = (rows: (string | number | null | undefined)[][]) => rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");

/** CSV exports for the admin tables (opens in Excel). */
export async function GET(req: Request) {
  const session = await readSession();
  if (!session || session.role === "siswa") return new Response("Forbidden", { status: 403 });
  const url = new URL(req.url);
  const jenis = url.searchParams.get("jenis");
  const db = await getDb();
  let rows: (string | number | null)[][] = [];

  if (jenis === "leaderboard") {
    const board = (url.searchParams.get("papan") ?? "daily") as Board;
    const list = await rankBoard({ board, period: "semua", jenjang: null });
    rows = [["Peringkat", "Nama", "Sekolah", "Skor"], ...list.map((r) => [r.rank, r.name, r.school, r.score])];
  } else if (jenis === "report-quiz") {
    const list = await db
      .select({ title: quizzes.title, kind: quizzes.kind, name: users.name, school: users.school, score: attempts.score, at: attempts.submittedAt })
      .from(attempts)
      .innerJoin(quizzes, eq(quizzes.id, attempts.quizId))
      .innerJoin(users, eq(users.id, attempts.userId))
      .where(and(isNotNull(attempts.submittedAt), inArray(quizzes.kind, ["daily", "ujikom", "tryout"])))
      .orderBy(desc(attempts.submittedAt));
    rows = [["Tanggal", "Quiz", "Tipe", "Siswa", "Sekolah", "Nilai"], ...list.map((r) => [longDate(r.at!), r.title, r.kind, r.name, r.school, r.score])];
  } else if (jenis === "report-rumath") {
    const list = await db
      .select({ title: quizzes.title, name: users.name, correct: attempts.correct, total: attempts.total, at: attempts.submittedAt })
      .from(attempts)
      .innerJoin(quizzes, eq(quizzes.id, attempts.quizId))
      .innerJoin(users, eq(users.id, attempts.userId))
      .where(and(isNotNull(attempts.submittedAt), eq(quizzes.kind, "rumath")))
      .orderBy(desc(attempts.submittedAt));
    rows = [["Tanggal", "Latihan", "Siswa", "Benar", "Jumlah soal"], ...list.map((r) => [longDate(r.at!), r.title, r.name, r.correct, r.total])];
  } else if (jenis === "coin") {
    const list = await db.select({ name: users.name, grade: users.grade, coin: users.coin, pkg: packages.name, until: users.packageUntil }).from(users).leftJoin(packages, eq(packages.id, users.packageId)).where(eq(users.role, "siswa")).orderBy(asc(users.name));
    rows = [["Nama", "Kelas", "Paket", "Coin", "Berlaku s/d"], ...list.map((r) => [r.name, r.grade, r.pkg, r.coin, r.until ? longDate(r.until) : ""])];
  } else return new Response("Jenis export tidak dikenal", { status: 400 });

  return new Response("﻿" + csv(rows), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="rumbasha-${jenis}.csv"` } });
}
