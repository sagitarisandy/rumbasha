import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { images } from "@/lib/db/schema";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDb();
  const [img] = await db.select().from(images).where(eq(images.id, Number(id)));
  if (!img) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(Buffer.from(img.data, "base64")), {
    headers: { "Content-Type": img.mime, "Cache-Control": "public, max-age=3600", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'" },
  });
}
