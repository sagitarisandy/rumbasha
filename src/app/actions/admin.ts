"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword } from "@/lib/auth/password";
import { MAPEL } from "@/lib/catalog";
import { requireStaff, type CurrentUser } from "@/lib/dal";
import { TZ } from "@/lib/format";
import { getDb } from "@/lib/db";
import * as t from "@/lib/db/schema";

export type FormState = { ok?: boolean; error?: string; message?: string };

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string, d = 0) => {
  const n = Number(String(f.get(k) ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : d;
};
const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";

async function log(user: CurrentUser, text: string) {
  const db = await getDb();
  await db.insert(t.activity).values({ actor: user.name, avatar: user.avatar, text });
}

async function staff(needSuper = false) {
  const user = await requireStaff();
  if (needSuper && user.role !== "super") throw new Error("Hanya Super Admin.");
  return user;
}

// ---- delete -----------------------------------------------------------------------------------

const TABLES = {
  materi: [t.materials, t.materials.id, "materi"],
  soal: [t.questions, t.questions.id, "soal"],
  image: [t.images, t.images.id, "gambar"],
  master: [t.masterData, t.masterData.id, "master data"],
  quiz: [t.quizzes, t.quizzes.id, "quiz"],
  video: [t.videos, t.videos.id, "video"],
  user: [t.users, t.users.id, "user"],
  paket: [t.packages, t.packages.id, "paket"],
  task: [t.tasks, t.tasks.id, "task"],
} as const;

export async function deleteEntity(entity: keyof typeof TABLES, id: number): Promise<{ error?: string }> {
  const user = await staff();
  const [table, col, label] = TABLES[entity];
  if (entity === "user" && id === user.id) return { error: "Tidak bisa menghapus akun sendiri." };
  if (entity === "task" && user.role !== "super") return { error: "Hanya Super Admin yang bisa menghapus task." };
  const db = await getDb();
  await db.delete(table).where(eq(col, id));
  await log(user, `menghapus ${label} #${id}`);
  refresh();
  return {};
}

// ---- master data ------------------------------------------------------------------------------

export async function saveMaster(id: number | null, _prev: FormState, f: FormData): Promise<FormState> {
  const user = await staff();
  const values = { kind: str(f, "kind"), name: str(f, "name"), parent: str(f, "parent") || null, jenjang: str(f, "jenjang") || null, active: bool(f, "active") };
  if (!values.name) return { error: "Nama wajib diisi." };
  const db = await getDb();
  if (id) await db.update(t.masterData).set(values).where(eq(t.masterData.id, id));
  else await db.insert(t.masterData).values(values);
  await log(user, `${id ? "mengubah" : "menambah"} master data ${values.name}`);
  refresh();
  return { ok: true };
}

// ---- users ------------------------------------------------------------------------------------

export async function saveUser(id: number | null, _prev: FormState, f: FormData): Promise<FormState> {
  const user = await staff();
  const role = str(f, "role") as t.Role;
  if (!["siswa", "tutor", "admin", "super"].includes(role)) return { error: "Role tidak dikenal." };
  if (role === "super" && user.role !== "super") return { error: "Hanya Super Admin yang bisa membuat Super Admin." };
  const email = str(f, "email").toLowerCase();
  if (!str(f, "name") || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Nama dan email yang valid wajib diisi." };
  const db = await getDb();
  const [dupe] = await db.select({ id: t.users.id }).from(t.users).where(eq(t.users.email, email));
  if (dupe && dupe.id !== id) return { error: "Email sudah dipakai." };
  const grade = num(f, "grade");
  const values = {
    role,
    name: str(f, "name"),
    email,
    phone: str(f, "phone") || null,
    school: str(f, "school") || null,
    branch: str(f, "branch") || null,
    jenjang: role === "siswa" ? ((grade && grade <= 6 ? "SD" : "SMP") as t.Jenjang) : null,
    grade: role === "siswa" ? grade || null : null,
    packageId: num(f, "packageId") || null,
    active: bool(f, "active"),
  };
  const password = str(f, "password");
  if (id) {
    await db.update(t.users).set({ ...values, ...(password ? { passwordHash: await hashPassword(password) } : {}) }).where(eq(t.users.id, id));
  } else {
    if (password.length < 8) return { error: "Kata sandi awal minimal 8 karakter." };
    await db.insert(t.users).values({ ...values, passwordHash: await hashPassword(password), avatar: Math.floor(Math.random() * 10), packageUntil: values.packageId ? new Date(Date.now() + 30 * 86_400_000) : null });
  }
  await log(user, `${id ? "mengubah" : "menambah"} akun ${values.name}`);
  refresh();
  if (!id) redirect("/admin/users");
  return { ok: true, message: "Tersimpan." };
}

/** CSV import: name,email,role,kelas,sekolah (header optional). Default password: rumbasha123. */
export async function importUsers(_prev: FormState, f: FormData): Promise<FormState> {
  const user = await staff();
  const file = f.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih file CSV dulu." };
  const text = await file.text();
  const rows = text.split(/\r?\n/).map((l) => l.split(/[;,]/).map((c) => c.trim().replace(/^"|"$/g, ""))).filter((r) => r.length >= 2 && r[1].includes("@"));
  if (!rows.length) return { error: "Tidak ada baris valid. Format: nama,email,role,kelas,sekolah" };
  const db = await getDb();
  const existing = new Set((await db.select({ email: t.users.email }).from(t.users)).map((u) => u.email));
  const pw = await hashPassword("rumbasha123");
  const fresh = rows.filter((r) => !existing.has(r[1].toLowerCase()));
  if (fresh.length)
    await db.insert(t.users).values(
      fresh.map((r) => {
        const role = (["siswa", "tutor", "admin"].includes(r[2]) ? r[2] : "siswa") as t.Role;
        const grade = Number(r[3]) || null;
        return { role, name: r[0], email: r[1].toLowerCase(), passwordHash: pw, grade, jenjang: role === "siswa" ? ((grade && grade <= 6 ? "SD" : "SMP") as t.Jenjang) : null, school: r[4] || null, avatar: Math.floor(Math.random() * 10) };
      }),
    );
  await log(user, `menambah ${fresh.length} akun via Excel`);
  refresh();
  return { ok: true, message: `${fresh.length} akun ditambahkan${rows.length - fresh.length ? `, ${rows.length - fresh.length} dilewati (email sudah ada)` : ""}. Kata sandi awal: rumbasha123.` };
}

// ---- coin & akses -----------------------------------------------------------------------------

export async function bulkCoin(ids: number[], mode: "tambah" | "kurangi" | "atur", amount: number, note: string): Promise<FormState> {
  const user = await staff();
  if (!ids.length) return { error: "Pilih siswa dulu." };
  if (!Number.isFinite(amount) || amount < 0) return { error: "Jumlah coin tidak valid." };
  const db = await getDb();
  const rows = await db.select({ id: t.users.id, coin: t.users.coin }).from(t.users).where(inArray(t.users.id, ids));
  for (const r of rows) {
    const next = mode === "tambah" ? r.coin + amount : mode === "kurangi" ? Math.max(0, r.coin - amount) : amount;
    await db.update(t.users).set({ coin: next }).where(eq(t.users.id, r.id));
    if (next !== r.coin) await db.insert(t.coinTx).values({ userId: r.id, amount: next - r.coin, note: note || "Penyesuaian admin", by: user.name });
  }
  await log(user, `mengubah coin ${rows.length} siswa`);
  refresh();
  return { ok: true, message: `Coin ${rows.length} siswa diperbarui.` };
}

export async function bulkAkses(ids: number[], packageId: number | null, until: string): Promise<FormState> {
  const user = await staff();
  if (!ids.length) return { error: "Pilih siswa dulu." };
  const date = until ? new Date(`${until}T23:59:00`) : null;
  const db = await getDb();
  await db.update(t.users).set({ packageId, packageUntil: date }).where(inArray(t.users.id, ids));
  await log(user, `mengubah akses ${ids.length} siswa`);
  refresh();
  return { ok: true, message: `Akses ${ids.length} siswa diperbarui.` };
}

// ---- paket ------------------------------------------------------------------------------------

export async function savePaket(id: number | null, _prev: FormState, f: FormData): Promise<FormState> {
  const user = await staff();
  const kind = str(f, "kind") === "coin" ? "coin" : "langganan";
  const values = {
    kind: kind as "coin" | "langganan",
    name: str(f, "name"),
    jenjang: (str(f, "jenjang") === "SD" ? "SD" : "SMP") as t.Jenjang,
    price: num(f, "price"),
    priceOriginal: num(f, "priceOriginal") || null,
    durationDays: kind === "coin" ? 0 : num(f, "durationDays", 30),
    coin: num(f, "coin"),
    tagline: str(f, "tagline") || null,
    features: str(f, "features").split("\n").map((s) => s.trim()).filter(Boolean),
    highlight: bool(f, "highlight"),
    active: bool(f, "active"),
  };
  if (!values.name || values.price <= 0) return { error: "Nama dan harga wajib diisi." };
  const db = await getDb();
  if (id) await db.update(t.packages).set(values).where(eq(t.packages.id, id));
  else await db.insert(t.packages).values(values);
  await log(user, `${id ? "mengubah" : "menambah"} paket ${values.name}`);
  refresh();
  if (!id) redirect("/admin/plans");
  return { ok: true, message: "Tersimpan." };
}

// ---- task -------------------------------------------------------------------------------------

export async function saveTask(id: number | null, _prev: FormState, f: FormData): Promise<FormState> {
  const user = await staff(true).catch(() => null);
  if (!user) return { error: "Hanya Super Admin yang bisa membuat atau mengubah task." };
  const values = { title: str(f, "title"), category: str(f, "category") || "Umum", assigneeId: num(f, "assigneeId") || null, priority: (str(f, "priority") || "Sedang") as "Tinggi" | "Sedang" | "Rendah", dueAt: str(f, "dueAt") ? new Date(`${str(f, "dueAt")}T17:00:00`) : null, note: str(f, "note") || null };
  if (!values.title) return { error: "Judul task wajib diisi." };
  const db = await getDb();
  if (id) await db.update(t.tasks).set(values).where(eq(t.tasks.id, id));
  else await db.insert(t.tasks).values({ ...values, createdBy: user.name });
  await log(user, `${id ? "mengubah" : "membuat"} task ${values.title}`);
  refresh();
  return { ok: true };
}

export async function toggleTask(id: number) {
  const user = await staff();
  const db = await getDb();
  await db.update(t.tasks).set({ done: sql`not ${t.tasks.done}` }).where(eq(t.tasks.id, id));
  await log(user, `memperbarui task #${id}`);
  refresh();
}

// ---- materi -----------------------------------------------------------------------------------

export async function saveMateri(id: number | null, _prev: FormState, f: FormData): Promise<FormState> {
  const user = await staff();
  const subject = str(f, "subject");
  if (!(MAPEL as readonly string[]).includes(subject)) return { error: "Pilih mapel." };
  const file = f.get("file");
  let pages = num(f, "pages", 12);
  if (file instanceof File && file.size > 0) {
    if (file.type !== "application/pdf") return { error: "File harus PDF." };
    if (file.size > 20 * 1024 * 1024) return { error: "Ukuran PDF maksimal 20 MB." };
    // Count pages from the PDF itself.
    const head = Buffer.from(await file.arrayBuffer()).toString("latin1");
    const counted = (head.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    if (counted) pages = counted;
  }
  const values = {
    title: str(f, "title"),
    subject,
    bidang: str(f, "bidang"),
    bab: str(f, "bab"),
    jenjang: (str(f, "jenjang") === "SD" ? "SD" : "SMP") as t.Jenjang,
    grade: num(f, "grade", 7),
    pages: Math.max(1, pages),
    summary: str(f, "summary") || null,
    status: (f.get("intent") === "draft" ? "draft" : "publish") as "draft" | "publish",
    author: user.name,
    updatedAt: new Date(),
  };
  if (!values.title || !values.bidang || !values.bab) return { error: "Judul, bidang, dan bab wajib diisi." };
  const db = await getDb();
  if (id) await db.update(t.materials).set(values).where(eq(t.materials.id, id));
  else await db.insert(t.materials).values(values);
  await log(user, `${values.status === "publish" ? "publish" : "menyimpan draf"} materi ${values.title}`);
  if (!id && values.status === "publish") {
    await db.insert(t.notifications).values({ kind: "materi", title: `Materi baru: ${values.title}`, body: `${values.subject} · ${values.bab}. Yuk dibaca!`, href: "/student/modules" });
  }
  refresh();
  redirect("/admin/materials");
}

// ---- soal -------------------------------------------------------------------------------------

export async function saveSoal(id: number | null, _prev: FormState, f: FormData): Promise<FormState> {
  const user = await staff();
  const type = str(f, "type") === "isian" ? "isian" : "pg";
  const options = type === "pg" ? f.getAll("option").map((o) => String(o).trim()).filter(Boolean) : [str(f, "hint")].filter(Boolean);
  const answer = type === "pg" ? str(f, "answer") : str(f, "answerValue");
  if (!str(f, "prompt")) return { error: "Pertanyaan wajib diisi." };
  if (type === "pg" && (options.length < 2 || !options[Number(answer)])) return { error: "Isi minimal 2 opsi dan pilih kuncinya." };
  if (type === "isian" && answer === "") return { error: "Isi kunci jawaban angka." };
  const values = {
    type: type as "pg" | "isian",
    subject: str(f, "subject"),
    bidang: str(f, "bidang"),
    bab: str(f, "bab"),
    jenjang: (str(f, "jenjang") === "SD" ? "SD" : "SMP") as t.Jenjang,
    grade: num(f, "grade", 7),
    level: (str(f, "level") || "Mudah") as "Mudah" | "Sedang" | "Sulit",
    prompt: str(f, "prompt"),
    options,
    answer,
    explanation: str(f, "explanation") || null,
    tag: f.getAll("usage").map(String).join(",") || null,
  };
  const db = await getDb();
  if (id) await db.update(t.questions).set(values).where(eq(t.questions.id, id));
  else await db.insert(t.questions).values(values);
  await log(user, `${id ? "mengubah" : "menambah"} soal ${values.bab}`);
  refresh();
  if (f.get("intent") === "lagi") return { ok: true, message: "Soal tersimpan. Lanjut tulis soal berikutnya." };
  redirect("/admin/questions");
}

/** CSV: pertanyaan;A;B;C;D;E;kunci(A-E);mapel;bab;level */
export async function importSoal(_prev: FormState, f: FormData): Promise<FormState> {
  const user = await staff();
  const file = f.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih file CSV dulu." };
  const rows = (await file.text()).split(/\r?\n/).map((l) => l.split(";").map((c) => c.trim())).filter((r) => r.length >= 7 && /^[A-E]$/i.test(r[6]));
  if (!rows.length) return { error: "Tidak ada baris valid. Format: pertanyaan;A;B;C;D;E;kunci;mapel;bab;level" };
  const db = await getDb();
  await db.insert(t.questions).values(
    rows.map((r) => ({
      prompt: r[0],
      options: r.slice(1, 6).filter(Boolean),
      answer: String("ABCDE".indexOf(r[6].toUpperCase())),
      subject: (MAPEL as readonly string[]).includes(r[7]) ? r[7] : "Matematika",
      bidang: "Umum",
      bab: r[8] || "Umum",
      jenjang: "SMP" as const,
      grade: 8,
      level: (["Mudah", "Sedang", "Sulit"].includes(r[9]) ? r[9] : "Sedang") as "Mudah" | "Sedang" | "Sulit",
      type: "pg" as const,
    })),
  );
  await log(user, `import ${rows.length} soal pilihan ganda`);
  refresh();
  return { ok: true, message: `${rows.length} soal masuk ke bank soal.` };
}

// ---- quiz -------------------------------------------------------------------------------------

export async function saveQuiz(id: number | null, payload: { title: string; kind: string; subject: string; jenjang: string; grade: number | null; durationMin: number; questionIds: number[]; startsAt: string; endsAt: string; accessCode: string; coinCost: number; publish: boolean }): Promise<FormState> {
  const user = await staff();
  if (!payload.title) return { error: "Nama quiz wajib diisi." };
  if (!payload.questionIds.length) return { error: "Pilih minimal 1 soal." };
  const needsCode = payload.kind === "ujikom" || payload.kind === "tryout";
  if (payload.publish && needsCode && !/^[A-Z0-9]{6}$/.test(payload.accessCode)) return { error: "Kode akses harus 6 huruf/angka." };
  const values = {
    title: payload.title,
    kind: payload.kind as t.QuizKind,
    subject: payload.subject,
    jenjang: (payload.jenjang === "SD" ? "SD" : "SMP") as t.Jenjang,
    grade: payload.grade,
    durationMin: Math.max(1, payload.durationMin),
    questionIds: payload.questionIds,
    startsAt: payload.startsAt ? new Date(payload.startsAt) : null,
    endsAt: payload.endsAt ? new Date(payload.endsAt) : null,
    accessCode: needsCode ? payload.accessCode || null : null,
    coinCost: payload.coinCost,
    status: (payload.publish ? "aktif" : "draft") as "aktif" | "draft",
  };
  const db = await getDb();
  if (id) await db.update(t.quizzes).set(values).where(eq(t.quizzes.id, id));
  else await db.insert(t.quizzes).values({ ...values, createdBy: user.name });
  await log(user, `${payload.publish ? "menjadwalkan" : "menyimpan draf"} quiz ${payload.title}`);
  if (payload.publish && needsCode && !id) {
    await db.insert(t.notifications).values({ kind: "quiz", title: `${payload.kind === "tryout" ? "Tryout" : "Uji Kom"} baru: ${payload.title}`, body: values.startsAt ? `Dibuka ${values.startsAt.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: TZ })}. Minta kode akses ke tutor.` : "Minta kode akses ke tutor.", href: "/student/exams" });
  }
  refresh();
  return { ok: true };
}

export async function setAccessCode(quizId: number, code: string): Promise<FormState> {
  const user = await staff();
  const clean = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(clean)) return { error: "Kode harus 6 huruf/angka." };
  const db = await getDb();
  await db.update(t.quizzes).set({ accessCode: clean, status: "aktif" }).where(eq(t.quizzes.id, quizId));
  await log(user, `membuat kode akses ${clean}`);
  refresh();
  return { ok: true, message: `Kode ${clean} aktif.` };
}

// ---- RUMATH video -----------------------------------------------------------------------------

export async function saveVideo(id: number | null, _prev: FormState, f: FormData): Promise<FormState> {
  const user = await staff();
  const [m, s] = str(f, "duration").split(":").map(Number);
  const values = {
    title: str(f, "title"),
    bidang: str(f, "jenis") || "Penjumlahan",
    jenjang: (str(f, "jenjang") === "SD" ? "SD" : "SMP") as t.Jenjang,
    durationSec: Math.max(30, (m || 0) * 60 + (s || 0)),
    url: str(f, "url"),
    description: str(f, "description") || null,
    position: num(f, "position", 1),
    status: (f.get("intent") === "draft" ? "draft" : "publish") as "draft" | "publish",
  };
  if (!values.title) return { error: "Judul video wajib diisi." };
  const db = await getDb();
  if (id) await db.update(t.videos).set(values).where(eq(t.videos.id, id));
  else await db.insert(t.videos).values(values);
  await log(user, `${id ? "mengubah" : "menambah"} video RUMATH ${values.title}`);
  refresh();
  redirect("/admin/rumath");
}

// ---- settings: leaderboard & landing ----------------------------------------------------------

async function putSetting(key: string, value: unknown) {
  const db = await getDb();
  await db.insert(t.settings).values({ key, value }).onConflictDoUpdate({ target: t.settings.key, set: { value, updatedAt: new Date() } });
}

export async function saveLeaderboard(board: string, _prev: FormState, f: FormData): Promise<FormState> {
  const user = await staff();
  const db = await getDb();
  const [row] = await db.select().from(t.settings).where(eq(t.settings.key, "leaderboard"));
  const current = (row?.value ?? {}) as Record<string, unknown>;
  current[board] = { periode: str(f, "periode"), reset: str(f, "reset"), poin: str(f, "poin"), top: num(f, "top", 10), hadiah: str(f, "hadiah") };
  await putSetting("leaderboard", current);
  await log(user, `mengatur leaderboard ${board}`);
  refresh();
  return { ok: true };
}

export async function setPoints(userId: number, _prev: FormState, f: FormData): Promise<FormState> {
  const user = await staff();
  const points = num(f, "points", -1);
  if (points < 0) return { error: "Poin tidak valid." };
  const db = await getDb();
  await db.update(t.users).set({ points }).where(eq(t.users.id, userId));
  await log(user, `mengoreksi poin siswa #${userId}`);
  refresh();
  return { ok: true };
}

export type LandingSection = { key: string; name: string; desc: string; visible: boolean };
export type Landing = { sections: LandingSection[]; changes: string[]; publishedAt: string; publishedBy: string };

export async function updateLanding(sections: LandingSection[], change: string): Promise<FormState> {
  await staff();
  const db = await getDb();
  const [row] = await db.select().from(t.settings).where(eq(t.settings.key, "landing"));
  const cur = row?.value as Landing;
  await putSetting("landing", { ...cur, sections, changes: [...new Set([...(cur?.changes ?? []), change])] });
  refresh();
  return { ok: true };
}

export async function saveHero(_prev: FormState, f: FormData): Promise<FormState> {
  const user = await staff();
  await putSetting("hero", { title: str(f, "title"), subtitle: str(f, "subtitle"), cta: str(f, "cta"), ctaHref: str(f, "ctaHref") || "/trial", published: false });
  const db = await getDb();
  const [row] = await db.select().from(t.settings).where(eq(t.settings.key, "landing"));
  const cur = row?.value as Landing;
  await putSetting("landing", { ...cur, changes: [...new Set([...(cur?.changes ?? []), "Hero · judul diubah"])] });
  await log(user, "mengubah hero landing page");
  refresh();
  return { ok: true };
}

export async function publishLanding(): Promise<FormState> {
  const user = await staff();
  const db = await getDb();
  const [row] = await db.select().from(t.settings).where(eq(t.settings.key, "landing"));
  await putSetting("landing", { ...(row?.value as Landing), changes: [], publishedAt: new Date().toISOString(), publishedBy: user.name });
  await log(user, "publish landing page");
  refresh();
  return { ok: true, message: "Landing page dipublish." };
}

// ---- images -----------------------------------------------------------------------------------

export async function uploadImages(_prev: FormState, f: FormData): Promise<FormState> {
  const user = await staff();
  const files = f.getAll("files").filter((x): x is File => x instanceof File && x.size > 0);
  if (!files.length) return { error: "Pilih gambar dulu." };
  const bad = files.find((x) => !/^image\/(png|jpe?g|webp|svg\+xml|gif)$/.test(x.type) || x.size > 2 * 1024 * 1024);
  if (bad) return { error: `${bad.name}: harus PNG/JPG/WebP/SVG, maksimal 2 MB.` };
  const db = await getDb();
  await db.insert(t.images).values(
    await Promise.all(files.map(async (x) => ({ name: x.name, mime: x.type, size: x.size, data: Buffer.from(await x.arrayBuffer()).toString("base64"), folder: str(f, "folder") || "Soal", uploadedBy: user.name }))),
  );
  await log(user, `upload ${files.length} gambar`);
  refresh();
  return { ok: true, message: `${files.length} gambar terupload.` };
}

export async function resetDemo(): Promise<FormState> {
  const user = await staff(true).catch(() => null);
  if (!user) return { error: "Hanya Super Admin." };
  const { resetDatabase } = await import("@/lib/db");
  await resetDatabase();
  redirect("/login");
}
