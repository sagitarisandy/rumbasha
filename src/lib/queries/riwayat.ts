import { and, desc, eq, gte, isNotNull, lt } from "drizzle-orm";
import { getDb } from "../db";
import { monthLabel, wibMonthStart, wibParts } from "../format";
import { attempts, materials, progress, quizzes } from "../db/schema";
import { KIND_LABEL, pointsFor } from "./hasil";

export type RiwayatItem = { key: string; kind: "daily" | "ujikom" | "tryout" | "rumath" | "modul"; title: string; sub: string; points: number; at: Date; href: string; score: number | null };

export function monthRange(bulan?: string) {
  const now = wibParts(new Date());
  const [y, m] = /^\d{4}-\d{2}$/.test(bulan ?? "") ? bulan!.split("-").map(Number) : [now.y, now.m + 1];
  const from = wibMonthStart(y, m - 1);
  return { from, to: wibMonthStart(y, m), key: `${y}-${String(m).padStart(2, "0")}`, label: monthLabel(from) };
}

/** Quiz attempts and PDFs opened in one month, newest first. */
export async function riwayat(userId: number, from: Date, to: Date): Promise<RiwayatItem[]> {
  const db = await getDb();
  const [qs, reads] = await Promise.all([
    db
      .select({ id: attempts.id, kind: quizzes.kind, title: quizzes.title, score: attempts.score, correct: attempts.correct, total: attempts.total, at: attempts.submittedAt })
      .from(attempts)
      .innerJoin(quizzes, eq(quizzes.id, attempts.quizId))
      .where(and(eq(attempts.userId, userId), isNotNull(attempts.submittedAt), gte(attempts.submittedAt, from), lt(attempts.submittedAt, to)))
      .orderBy(desc(attempts.submittedAt)),
    db
      .select({ id: materials.id, title: materials.title, bab: materials.bab, pages: materials.pages, page: progress.page, at: progress.updatedAt })
      .from(progress)
      .innerJoin(materials, eq(materials.id, progress.materialId))
      .where(and(eq(progress.userId, userId), gte(progress.updatedAt, from), lt(progress.updatedAt, to)))
      .orderBy(desc(progress.updatedAt)),
  ]);
  const items: RiwayatItem[] = [
    ...qs.map((q) => ({
      key: `a${q.id}`,
      kind: q.kind as RiwayatItem["kind"],
      title: `${KIND_LABEL[q.kind] ?? "Quiz"} — ${q.title.replace("RUMATH · ", "")}`,
      sub: q.kind === "rumath" ? `${q.correct}/${q.total} benar` : q.kind === "tryout" ? `skor ${(q.score ?? 0) * 10}` : `nilai ${q.score}`,
      points: pointsFor(q.kind, q.score ?? 0, q.correct ?? 0),
      at: q.at!,
      href: `/student/results/${q.id}`,
      score: q.score,
    })),
    ...reads.map((r) => ({
      key: `m${r.id}`,
      kind: "modul" as const,
      title: `Modul — ${r.title}`,
      sub: r.page >= r.pages ? "PDF selesai dibaca" : `dibaca sampai hal. ${r.page}/${r.pages}`,
      points: 0,
      at: r.at,
      href: `/student/modules/${r.id}`,
      score: null,
    })),
  ];
  return items.sort((a, b) => b.at.getTime() - a.at.getTime());
}
