"use server";

import { eq, or } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession, homeFor } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type LoginState = { error?: string; email?: string };

const MAX_TRIES = 5;

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "");
  if (!email || !password) return { error: "Isi email/no. HP dan kata sandi.", email };

  const jar = await cookies();
  const tries = Number(jar.get("rb_tries")?.value ?? 0);
  if (tries >= MAX_TRIES) return { error: "Terlalu banyak percobaan. Coba lagi 15 menit lagi atau chat admin.", email };

  const db = await getDb();
  const [user] = await db.select().from(users).where(or(eq(users.email, email), eq(users.phone, email)));
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    const left = MAX_TRIES - tries - 1;
    jar.set("rb_tries", String(tries + 1), { httpOnly: true, maxAge: 15 * 60, path: "/" });
    return { error: left > 0 ? `Kata sandi salah. Sisa ${left} kali coba.` : "Terlalu banyak percobaan. Coba lagi 15 menit lagi.", email };
  }
  if (!user.active) return { error: "Akun ini dinonaktifkan. Hubungi admin Rumbasha.", email };

  jar.delete("rb_tries");
  await createSession(user.id, user.role);
  const home = homeFor(user.role);
  redirect(next.startsWith(home) ? next : home);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
