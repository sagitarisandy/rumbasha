// Data access layer: every server page/action goes through these guards.
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { readSession } from "./auth/session";
import { getDb } from "./db";
import { users } from "./db/schema";

export const getCurrentUser = cache(async () => {
  // Everything behind a login is per-request (and full of "now"-relative dates).
  await connection();
  const session = await readSession();
  if (!session) return null;
  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.id, session.uid));
  return user && user.active ? user : null;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireSiswa() {
  const user = await getCurrentUser();
  if (!user || user.role !== "siswa") redirect("/login");
  return user;
}

export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || user.role === "siswa") redirect("/login");
  return user;
}

export const isSuper = (u: CurrentUser) => u.role === "super";
