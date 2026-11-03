import { readSession } from "@/lib/auth/session";
import { resetDatabase } from "@/lib/db";

export async function POST() {
  const session = await readSession();
  if (process.env.NODE_ENV === "production" && session?.role !== "super") return new Response("Forbidden", { status: 403 });
  const started = Date.now();
  await resetDatabase();
  return Response.json({ ok: true, ms: Date.now() - started });
}
