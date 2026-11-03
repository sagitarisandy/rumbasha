import { eq } from "drizzle-orm";
import { readSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { longDate } from "@/lib/format";
import { buildPdf, type Line } from "@/lib/pdf-file";
import { monthRange, riwayat } from "@/lib/queries/riwayat";

/** Monthly learning report for parents. */
export async function GET(req: Request) {
  const session = await readSession();
  if (!session || session.role !== "siswa") return new Response("Masuk dulu.", { status: 401 });
  const range = monthRange(new URL(req.url).searchParams.get("bulan") ?? undefined);
  const db = await getDb();
  const [u] = await db.select().from(users).where(eq(users.id, session.uid));
  const items = await riwayat(session.uid, range.from, range.to);
  const quizzes = items.filter((x) => x.kind !== "modul");
  const avg = quizzes.length ? Math.round(quizzes.reduce((s, x) => s + (x.score ?? 0), 0) / quizzes.length) : 0;
  const grey: [number, number, number] = [0.42, 0.43, 0.58];

  const head: Line[] = [
    { text: "LAPORAN BELAJAR BULANAN", size: 9, color: grey },
    { text: `${u.name} · ${range.label}`, size: 18, bold: true, gap: 6 },
    { text: `Kelas ${u.grade} · ${u.school ?? "-"} · target ${u.target ?? "-"}`, color: grey, gap: 12 },
    { text: `Quiz selesai: ${quizzes.length}    Rata-rata nilai: ${avg}    Poin: +${quizzes.reduce((s, x) => s + x.points, 0)}    PDF dibaca: ${items.length - quizzes.length}`, bold: true, gap: 14 },
  ];
  const rows: Line[] = items.map((x) => ({ text: `${longDate(x.at)}   ${x.title} — ${x.sub}${x.points ? ` (+${x.points} poin)` : ""}`, size: 10, gap: 3 }));
  const perPage = 34;
  const pages: Line[][] = [];
  for (let i = 0; i < Math.max(1, rows.length); i += perPage) pages.push([...(i === 0 ? head : []), ...rows.slice(i, i + perPage)]);
  if (!rows.length) pages[0].push({ text: "Belum ada aktivitas di bulan ini." });

  const file = buildPdf(`Laporan ${u.name} ${range.label}`, pages);
  return new Response(new Uint8Array(file), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="laporan-${range.key}.pdf"` },
  });
}
