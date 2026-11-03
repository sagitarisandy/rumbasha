"use server";

import { and, eq, isNull, or, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { requireSiswa } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { PERIODS } from "@/lib/catalog";
import { fullDate } from "@/lib/format";
import { coinTx, materials, notificationReads, notifications, packages, payments, progress, users } from "@/lib/db/schema";

/** Remember the furthest page read (the PDF viewer calls this as you page through). */
export async function saveProgress(materialId: number, page: number) {
  const user = await requireSiswa();
  const db = await getDb();
  const [m] = await db.select({ pages: materials.pages }).from(materials).where(eq(materials.id, materialId));
  if (!m) return;
  const p = Math.max(1, Math.min(m.pages, Math.round(page)));
  await db
    .insert(progress)
    .values({ userId: user.id, materialId, page: p, updatedAt: new Date() })
    .onConflictDoUpdate({ target: [progress.userId, progress.materialId], set: { page: sql`greatest(${progress.page}, ${p})`, updatedAt: new Date() } });
}

export async function markAllRead() {
  const user = await requireSiswa();
  const db = await getDb();
  const mine = await db.select({ id: notifications.id }).from(notifications).where(or(isNull(notifications.userId), eq(notifications.userId, user.id)));
  if (mine.length) await db.insert(notificationReads).values(mine.map((n) => ({ userId: user.id, notificationId: n.id }))).onConflictDoNothing();
  refresh();
}

export async function markRead(id: number) {
  const user = await requireSiswa();
  const db = await getDb();
  await db.insert(notificationReads).values({ userId: user.id, notificationId: id }).onConflictDoNothing();
}

export type ProfileState = { ok?: boolean; error?: string };

export async function updateProfile(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const user = await requireSiswa();
  const get = (k: string) => String(form.get(k) ?? "").trim();
  const name = get("name");
  const email = get("email").toLowerCase();
  const phone = get("phone").replace(/[^\d]/g, "");
  const parentPhone = get("parentPhone").replace(/[^\d]/g, "");
  const grade = Number(get("grade"));
  if (name.length < 3) return { error: "Nama minimal 3 huruf." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Format email belum benar." };
  if (phone && !/^0\d{9,13}$/.test(phone)) return { error: "No. WhatsApp diawali 0 dan 10–14 digit." };
  if (parentPhone && !/^0\d{9,13}$/.test(parentPhone)) return { error: "No. WhatsApp orang tua diawali 0 dan 10–14 digit." };
  const db = await getDb();
  const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (taken && taken.id !== user.id) return { error: "Email ini sudah dipakai akun lain." };
  await db
    .update(users)
    .set({
      name,
      email,
      phone: phone || null,
      school: get("school") || user.school,
      target: get("target") || user.target,
      jenjang: get("jenjang") === "SD" ? "SD" : "SMP",
      grade: Number.isFinite(grade) && grade >= 1 && grade <= 9 ? grade : user.grade,
      avatar: Number(get("avatar") || user.avatar) % 10,
      parent: get("parentName") ? { name: get("parentName"), relation: get("parentRelation") || "Orang tua", phone: parentPhone, email: get("parentEmail") || undefined } : user.parent,
    })
    .where(eq(users.id, user.id));
  refresh();
  return { ok: true };
}

export async function changePassword(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const user = await requireSiswa();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (!(await verifyPassword(current, user.passwordHash))) return { error: "Kata sandi lama salah." };
  if (next.length < 8) return { error: "Kata sandi baru minimal 8 karakter." };
  if (next !== String(form.get("confirm") ?? "")) return { error: "Konfirmasi kata sandi tidak sama." };
  const db = await getDb();
  await db.update(users).set({ passwordHash: await hashPassword(next) }).where(eq(users.id, user.id));
  return { ok: true };
}

export type PurchaseResult = { ok?: boolean; error?: string; message?: string };

/**
 * Preview checkout: the payment is simulated as instantly paid, then coin is added or the
 * package extended. A real build would create a gateway invoice and finish this in a webhook.
 */
export async function purchase(input: { type: "coin"; packageId: number; method: string } | { type: "paket"; packageId: number; period: string; method: string }): Promise<PurchaseResult> {
  const user = await requireSiswa();
  const db = await getDb();
  const method = ["QRIS", "Virtual Account", "E-wallet"].includes(input.method) ? input.method : "QRIS";
  if (input.type === "coin") {
    const [pack] = await db.select().from(packages).where(and(eq(packages.id, input.packageId), eq(packages.kind, "coin"), eq(packages.active, true)));
    if (!pack) return { error: "Paket coin tidak ditemukan." };
    await db.insert(payments).values({ userId: user.id, item: `Top-up ${pack.coin} coin`, amount: pack.price, method });
    await db.update(users).set({ coin: sql`${users.coin} + ${pack.coin}` }).where(eq(users.id, user.id));
    await db.insert(coinTx).values({ userId: user.id, amount: pack.coin, note: `Top-up ${pack.coin} coin`, by: method });
    await db.insert(notifications).values({ userId: user.id, kind: "sistem", title: `${pack.coin} coin masuk`, body: `Pembayaran ${method} berhasil. Coin kamu sudah bertambah.`, href: "/student/plans?tab=coin" });
    refresh();
    return { ok: true, message: `${pack.coin} coin sudah masuk ke akunmu.` };
  }
  const [pkg] = await db.select().from(packages).where(and(eq(packages.id, input.packageId), eq(packages.kind, "langganan")));
  const period = PERIODS.find((p) => p.key === input.period) ?? PERIODS[0];
  if (!pkg || !pkg.active) return { error: "Paket tidak tersedia." };
  const amount = Math.round(pkg.price * period.months * (1 - period.discount));
  const base = user.packageUntil && user.packageUntil > new Date() && user.packageId === pkg.id ? user.packageUntil : new Date();
  const until = new Date(base.getTime() + period.months * 30 * 86_400_000);
  await db.insert(payments).values({ userId: user.id, item: `${pkg.name} · ${period.label.replace(/ −.*/, "")}`, amount, method });
  await db.update(users).set({ packageId: pkg.id, packageUntil: until, coin: sql`${users.coin} + ${pkg.coin}` }).where(eq(users.id, user.id));
  if (pkg.coin) await db.insert(coinTx).values({ userId: user.id, amount: pkg.coin, note: `Coin bulanan ${pkg.name}`, by: "sistem" });
  await db.insert(notifications).values({ userId: user.id, kind: "sistem", title: `Paket ${pkg.name} aktif`, body: `Aktif sampai ${fullDate(until)}.`, href: "/student/plans" });
  refresh();
  return { ok: true, message: `Paket ${pkg.name} aktif sampai ${fullDate(until)}.` };
}
