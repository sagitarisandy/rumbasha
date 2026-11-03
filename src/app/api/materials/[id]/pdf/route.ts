import { eq } from "drizzle-orm";
import { readSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { materials } from "@/lib/db/schema";
import { pdfPage, plainMath } from "@/lib/pdf-content";
import { buildPdf, type Line } from "@/lib/pdf-file";

export async function GET(_req: Request, ctx: RouteContext<"/api/materials/[id]/pdf">) {
  if (!(await readSession())) return new Response("Masuk dulu untuk mengunduh.", { status: 401 });
  const { id } = await ctx.params;
  const db = await getDb();
  const [m] = await db.select().from(materials).where(eq(materials.id, Number(id)));
  if (!m) return new Response("Materi tidak ditemukan.", { status: 404 });

  const pages = Array.from({ length: m.pages }, (_, i) =>
    pdfPage(m, i + 1).flatMap((b): Line[] => {
      switch (b.kind) {
        case "label":
          return [{ text: b.text, size: 9, color: [0.42, 0.43, 0.58] }];
        case "h":
          return [{ text: b.text, size: 18, bold: true, gap: 10 }];
        case "p":
          return [{ text: plainMath(b.text), gap: 8 }];
        case "lines":
          return [{ text: `Penjelasan ${m.title.toLowerCase()} dibahas langkah demi langkah dengan contoh dari kehidupan sehari-hari. Perhatikan setiap langkah dan catat bagian yang penting.`, gap: 8 }];
        case "math":
          return [{ text: plainMath(b.text), size: 14, gap: 10 }];
        case "note":
          return [{ text: `Catatan: ${b.text}`, size: 10, color: [0.76, 0.35, 0.07] as [number, number, number], gap: 8 }];
        case "list":
          return b.items.map((t) => ({ text: `•  ${plainMath(t)}`, gap: 2 }));
      }
    }),
  );
  const file = buildPdf(m.title, pages);
  const name = `${m.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
  return new Response(new Uint8Array(file), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${name}"` },
  });
}
