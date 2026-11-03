// Drizzle table definitions; ddl.ts holds the matching CREATE TABLE statements.
import { boolean, integer, jsonb, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";

export type Role = "siswa" | "tutor" | "admin" | "super";
export type Jenjang = "SD" | "SMP";
export type QuizKind = "daily" | "ujikom" | "tryout" | "rumath" | "trial";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  role: text("role").$type<Role>().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  school: text("school"),
  grade: integer("grade"),
  jenjang: text("jenjang").$type<Jenjang>(),
  target: text("target"),
  branch: text("branch"),
  avatar: integer("avatar").notNull().default(0),
  coin: integer("coin").notNull().default(0),
  points: integer("points").notNull().default(0),
  rankDelta: integer("rank_delta").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  /** orang tua / wali: receives the monthly report */
  parent: jsonb("parent").$type<{ name: string; relation: string; phone: string; email?: string }>(),
  packageId: integer("package_id"),
  packageUntil: timestamp("package_until", { mode: "date" }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

/** Small lookup lists: mapel, bidang (per mapel), kelas, sekolah, cabang. */
export const masterData = pgTable("master_data", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(),
  name: text("name").notNull(),
  parent: text("parent"),
  jenjang: text("jenjang"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  bidang: text("bidang").notNull(),
  bab: text("bab").notNull(),
  jenjang: text("jenjang").$type<Jenjang>().notNull(),
  grade: integer("grade").notNull(),
  pages: integer("pages").notNull().default(12),
  summary: text("summary"),
  status: text("status").$type<"publish" | "draft">().notNull().default("publish"),
  author: text("author"),
  videoCount: integer("video_count").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const progress = pgTable(
  "progress",
  {
    userId: integer("user_id").notNull(),
    materialId: integer("material_id").notNull(),
    page: integer("page").notNull().default(1),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.materialId] })],
);

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  bidang: text("bidang").notNull(),
  bab: text("bab").notNull(),
  jenjang: text("jenjang").$type<Jenjang>().notNull(),
  grade: integer("grade").notNull(),
  level: text("level").$type<"Mudah" | "Sedang" | "Sulit">().notNull(),
  type: text("type").$type<"pg" | "isian">().notNull().default("pg"),
  /** Prompt text; math goes between $…$ (see MathText). */
  prompt: text("prompt").notNull(),
  options: jsonb("options").$type<string[]>().notNull().default([]),
  /** Option index as a string for "pg", the expected value for "isian". */
  answer: text("answer").notNull(),
  explanation: text("explanation"),
  tag: text("tag"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  kind: text("kind").$type<QuizKind>().notNull(),
  subject: text("subject").notNull(),
  bidang: text("bidang"),
  bab: text("bab"),
  level: text("level"),
  jenjang: text("jenjang").$type<Jenjang>().notNull(),
  grade: integer("grade"),
  durationMin: integer("duration_min").notNull().default(10),
  questionIds: jsonb("question_ids").$type<number[]>().notNull().default([]),
  accessCode: text("access_code"),
  startsAt: timestamp("starts_at", { mode: "date" }),
  endsAt: timestamp("ends_at", { mode: "date" }),
  status: text("status").$type<"aktif" | "draft" | "selesai">().notNull().default("aktif"),
  coinCost: integer("coin_cost").notNull().default(0),
  freeAttempts: integer("free_attempts").notNull().default(0),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  quizId: integer("quiz_id").notNull(),
  answers: jsonb("answers").$type<Record<string, string>>().notNull().default({}),
  flagged: jsonb("flagged").$type<number[]>().notNull().default([]),
  score: integer("score"),
  correct: integer("correct"),
  total: integer("total").notNull(),
  startedAt: timestamp("started_at", { mode: "date" }).notNull().defaultNow(),
  submittedAt: timestamp("submitted_at", { mode: "date" }),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull().default("Matematika"),
  bidang: text("bidang").notNull(),
  jenjang: text("jenjang").$type<Jenjang>().notNull(),
  durationSec: integer("duration_sec").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  /** order inside its jenis (RUMATH "video 2 dari 4") */
  position: integer("position").notNull().default(1),
  quizId: integer("quiz_id"),
  views: integer("views").notNull().default(0),
  status: text("status").$type<"publish" | "draft">().notNull().default("publish"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const videoProgress = pgTable(
  "video_progress",
  {
    userId: integer("user_id").notNull(),
    videoId: integer("video_id").notNull(),
    seconds: integer("seconds").notNull().default(0),
    done: boolean("done").notNull().default(false),
    saved: boolean("saved").notNull().default(false),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.videoId] })],
);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  /** null = broadcast to every siswa */
  userId: integer("user_id"),
  kind: text("kind").$type<"quiz" | "promo" | "materi" | "peringkat" | "sistem">().notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  href: text("href"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const notificationReads = pgTable(
  "notification_reads",
  {
    userId: integer("user_id").notNull(),
    notificationId: integer("notification_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.notificationId] })],
);

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  /** base64 payload; fine for a preview, swap for Blob storage in production */
  data: text("data").notNull(),
  folder: text("folder").notNull().default("Soal"),
  uploadedBy: text("uploaded_by"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  /** "langganan" (monthly package) or "coin" (top-up pack, `coin` = amount, `tagline` = note) */
  kind: text("kind").$type<"langganan" | "coin">().notNull().default("langganan"),
  name: text("name").notNull(),
  jenjang: text("jenjang").$type<Jenjang>().notNull(),
  /** per month; semester/tahunan get a discount in the UI */
  price: integer("price").notNull(),
  priceOriginal: integer("price_original"),
  tagline: text("tagline"),
  durationDays: integer("duration_days").notNull(),
  coin: integer("coin").notNull().default(0),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  highlight: boolean("highlight").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const coinTx = pgTable("coin_tx", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  note: text("note").notNull(),
  by: text("by"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  item: text("item").notNull(),
  amount: integer("amount").notNull(),
  method: text("method").notNull(),
  status: text("status").$type<"menunggu" | "lunas">().notNull().default("lunas"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  assigneeId: integer("assignee_id"),
  priority: text("priority").$type<"Tinggi" | "Sedang" | "Rendah">().notNull(),
  dueAt: timestamp("due_at", { mode: "date" }),
  done: boolean("done").notNull().default(false),
  note: text("note"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const activity = pgTable("activity", {
  id: serial("id").primaryKey(),
  actor: text("actor").notNull(),
  avatar: integer("avatar").notNull().default(0),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

/** Key/value settings: landing page hero, leaderboard rules, promo banner. */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});
