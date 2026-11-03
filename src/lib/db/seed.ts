// Demo data for the preview. Dates are relative to "now" so the dashboards always look current.
import { hashPassword } from "../auth/password";
import { CABANG, COIN_PACKS, KURIKULUM, MAPEL, SEKOLAH_SD, SEKOLAH_SMP } from "../catalog";
import { wibStartOfDay } from "../format";
import type { DB } from "./index";
import * as t from "./schema";
import { RUMATH_COIN, RUMATH_JENIS, RUMATH_MINUTES, RUMATH_QUESTIONS, RUMATH_VIDEOS, rumathSoal } from "../rumath";
import { buildQuestions, rng } from "./seed-questions";

/** `hour:minute` WIB, `daysFromToday` days from today. */
function at(daysFromToday: number, hour = 9, minute = 0) {
  return new Date(wibStartOfDay(new Date(), daysFromToday).getTime() + (hour * 60 + minute) * 60_000);
}

// Top of the Daily Quiz leaderboard, in order. Nadia (the demo siswa) sits at #12.
const TOP_SISWA: [string, string, number, number][] = [
  ["Raka Pratama", "SMPN 1 Surabaya", 2400, 2],
  ["Salsa Ayu", "SMPN 6 Surabaya", 2305, 7],
  ["Dimas Arya", "SMP Al-Hikmah", 2210, 1],
  ["Keisha Putri", "SMPN 3 Surabaya", 2120, 5],
  ["Bima Saputra", "SMPN 12 Surabaya", 1985, 4],
  ["Alya Rahma", "SMP Ciputra", 1870, 6],
  ["Fajar Nugroho", "SMPN 1 Surabaya", 1760, 3],
  ["Citra Lestari", "SMP Muhammadiyah 5", 1655, 9],
  ["Rizky Ramadhan", "SMPN 19 Surabaya", 1540, 8],
  ["Nabila Zahra", "SMPN 6 Surabaya", 1430, 5],
  ["Galih Pratama", "SMP Al-Hikmah", 1335, 2],
];

const OTHER_SMP = [
  "Aditya Wibowo", "Bella Safira", "Cahya Ningrum", "Daffa Hakim", "Eka Wulandari", "Farhan Maulana", "Gita Permata",
  "Hana Kirana", "Irfan Hidayat", "Jihan Aulia", "Kevin Santoso", "Laila Sari", "Mikael Tan", "Naura Azzahra",
  "Oki Prasetyo", "Putri Ayu", "Qori Amalia", "Rafi Akbar", "Sinta Dewi", "Tegar Wijaya", "Umar Faruq",
  "Vania Larasati", "Wahyu Setiawan", "Yasmin Hafsah", "Zidan Firmansyah",
];
const SD_NAMES = ["Arka Mahendra", "Bunga Melati", "Cinta Kirana", "Dafa Putra", "Elsa Nadhira", "Fikri Alamsyah", "Gendis Ayu", "Haikal Rasyid", "Intan Permatasari", "Jovan Hartono"];

const TUTORS: [string, string][] = [
  ["Budi Santoso", "tutor.budi@rumbasha.id"],
  ["Dewi Anggraini", "tutor.dewi@rumbasha.id"],
  ["Hendra Gunawan", "tutor.hendra@rumbasha.id"],
  ["Maya Kusuma", "tutor.maya@rumbasha.id"],
];

export async function seed(db: DB) {
  const r = rng(42);
  const [siswaPw, staffPw] = await Promise.all([hashPassword("siswa123"), hashPassword("admin123")]);

  // ---- master data -------------------------------------------------------------------------
  const md: (typeof t.masterData.$inferInsert)[] = [];
  for (const m of MAPEL) {
    md.push({ kind: "mapel", name: m });
    for (const b of KURIKULUM[m]) md.push({ kind: "bidang", name: b.name, parent: m });
  }
  for (let g = 1; g <= 9; g++) md.push({ kind: "kelas", name: `Kelas ${g}`, jenjang: g <= 6 ? "SD" : "SMP" });
  for (const s of SEKOLAH_SMP) md.push({ kind: "sekolah", name: s, jenjang: "SMP" });
  for (const s of SEKOLAH_SD) md.push({ kind: "sekolah", name: s, jenjang: "SD" });
  for (const c of CABANG) md.push({ kind: "cabang", name: c });
  await db.insert(t.masterData).values(md);

  // ---- packages ----------------------------------------------------------------------------
  const pkgs = await db
    .insert(t.packages)
    .values([
      { name: "Reguler SD", jenjang: "SD", price: 350000, priceOriginal: 450000, durationDays: 30, coin: 80, tagline: "Belajar rutin kelas 4–6", features: ["2 pertemuan per minggu", "Modul dan Daily Quiz", "80 coin tiap bulan"] },
      { name: "Reguler SMP", jenjang: "SMP", price: 450000, priceOriginal: 600000, durationDays: 30, coin: 100, tagline: "Belajar rutin kelas 7–9", features: ["2 pertemuan per minggu", "Modul, Daily Quiz, Uji Kom", "100 coin tiap bulan"] },
      { name: "Intensif Masuk SMA", jenjang: "SMP", price: 750000, priceOriginal: 950000, durationDays: 30, coin: 250, highlight: true, tagline: "Persiapan TKA dan seleksi SMA", features: ["4 pertemuan per minggu", "Tryout mingguan + analisis", "RUMATH tanpa coin", "Konsultasi pilih SMA"] },
      { name: "Privat 1-on-1", jenjang: "SMP", price: 1500000, priceOriginal: 1800000, durationDays: 30, coin: 300, tagline: "Tutor pribadi", features: ["Jadwal kamu yang atur", "Materi sesuai target sekolah", "Laporan bulanan ke orang tua"] },
    ])
    .returning();
  const pkg = Object.fromEntries(pkgs.map((p) => [p.name, p]));
  await db.insert(t.packages).values(
    COIN_PACKS.map((c) => ({ kind: "coin" as const, name: `${c.coin.toLocaleString("id-ID")} Coin`, jenjang: "SMP" as const, price: c.price, durationDays: 0, coin: c.coin, tagline: c.note })),
  );

  // ---- users -------------------------------------------------------------------------------
  const staff = await db
    .insert(t.users)
    .values([
      { role: "super", name: "Hendrawan", email: "super@rumbasha.id", passwordHash: staffPw, avatar: 9, branch: "Surabaya Timur", createdAt: at(-400) },
      { role: "admin", name: "Rina Sari", email: "rina@rumbasha.id", passwordHash: staffPw, avatar: 9, branch: "Surabaya Timur", phone: "081234500001", createdAt: at(-380) },
      { role: "admin", name: "Sari Wulandari", email: "admin.sari@rumbasha.id", passwordHash: staffPw, avatar: 2, branch: "Surabaya Barat", createdAt: at(-300) },
      { role: "admin", name: "Rio Firmansyah", email: "admin.rio@rumbasha.id", passwordHash: staffPw, avatar: 5, branch: "Sidoarjo", createdAt: at(-250) },
      ...TUTORS.map(([name, email], i) => ({ role: "tutor" as const, name, email, passwordHash: staffPw, avatar: (i * 3 + 1) % 10, branch: CABANG[i % 3], createdAt: at(-(360 - i * 40)) })),
    ])
    .returning();
  const rina = staff.find((u) => u.email === "rina@rumbasha.id")!;

  const smpRows: (typeof t.users.$inferInsert)[] = [];
  const slug = (n: string) => n.toLowerCase().replace(/[^a-z]+/g, ".").replace(/\.$/, "");
  TOP_SISWA.forEach(([name, school, points, avatar], i) =>
    smpRows.push({
      role: "siswa", name, email: `${slug(name)}@siswa.rumbasha.id`, passwordHash: siswaPw, school, grade: 9 - (i % 3 === 2 ? 1 : 0),
      jenjang: "SMP", target: i % 2 ? "SMAN 1 Surabaya" : "SMAN 5 Surabaya", branch: CABANG[i % 3], avatar, coin: 80 + ((i * 37) % 300),
      points, rankDelta: [0, 1, -1, 2, 0, -2, 1, 0, 3, -1, 0][i], streak: 2 + (i % 9),
      packageId: pkg[i % 4 === 0 ? "Intensif Masuk SMA" : "Reguler SMP"].id, packageUntil: at(30 + i * 9), createdAt: at(-(200 - i * 9)),
    }),
  );
  smpRows.push({
    role: "siswa", name: "Nadia Aulia", email: "nadia.aulia@gmail.com", passwordHash: siswaPw, phone: "081357246810",
    school: "SMPN 3 Surabaya", grade: 9, jenjang: "SMP", target: "SMAN 5 Surabaya", branch: "Surabaya Timur", avatar: 0,
    coin: 320, points: 1240, rankDelta: 3, streak: 6, packageId: pkg["Reguler SMP"].id, packageUntil: at(240),
    parent: { name: "Sri Wahyuni", relation: "Ibu", phone: "081299882210", email: "sri.wahyuni@gmail.com" }, createdAt: at(-130),
  });
  OTHER_SMP.forEach((name, i) =>
    smpRows.push({
      role: "siswa", name, email: `${slug(name)}@siswa.rumbasha.id`, passwordHash: siswaPw, school: SEKOLAH_SMP[(i * 3) % SEKOLAH_SMP.length],
      grade: 7 + (i % 3), jenjang: "SMP", target: ["SMAN 5 Surabaya", "SMAN 2 Surabaya", "SMAN 1 Sidoarjo", "SMA Al-Hikmah"][i % 4],
      branch: CABANG[i % 3], avatar: i % 10, coin: 20 + ((i * 53) % 260), points: 1200 - i * 38 - Math.floor(r() * 20),
      rankDelta: Math.floor(r() * 5) - 2, streak: Math.floor(r() * 6), active: i !== 7,
      packageId: i % 5 === 4 ? null : pkg[i % 6 === 0 ? "Intensif Masuk SMA" : "Reguler SMP"].id, packageUntil: i % 5 === 4 ? null : at(10 + i * 7),
      createdAt: at(-(i * 7 + 2)),
    }),
  );
  SD_NAMES.forEach((name, i) =>
    smpRows.push({
      role: "siswa", name, email: `${slug(name)}@siswa.rumbasha.id`, passwordHash: siswaPw, school: SEKOLAH_SD[i % SEKOLAH_SD.length],
      grade: 4 + (i % 3), jenjang: "SD", target: "SMP Favorit", branch: CABANG[i % 3], avatar: (i + 4) % 10, coin: 40 + i * 10,
      points: 900 - i * 61, streak: i % 4, packageId: pkg["Reguler SD"].id, packageUntil: at(20 + i * 5), createdAt: at(-(i * 3 + 1)),
    }),
  );
  const siswa = await db.insert(t.users).values(smpRows).returning();
  const nadia = siswa.find((u) => u.email === "nadia.aulia@gmail.com")!;
  const smp = siswa.filter((u) => u.jenjang === "SMP");

  // ---- materi ------------------------------------------------------------------------------
  const matRows: (typeof t.materials.$inferInsert)[] = [];
  for (const mapel of MAPEL) {
    for (const bidang of KURIKULUM[mapel]) {
      for (const bab of bidang.bab) {
        bab.pdfs.forEach(([title, pages], i) =>
          matRows.push({
            title, subject: mapel, bidang: bidang.name, bab: bab.name, jenjang: "SMP", grade: 7 + ((i + bab.name.length) % 3), pages,
            summary: `Ringkasan ${title.toLowerCase()} untuk kelas 7–9, lengkap dengan contoh soal dan latihan.`,
            author: TUTORS[(i + title.length) % TUTORS.length][0], videoCount: i % 3 === 1 ? 2 : 0,
            status: i === bab.pdfs.length - 1 && bab.pdfs.length > 4 ? "draft" : "publish",
            createdAt: at(-(10 + ((i * 7 + title.length) % 80))), updatedAt: at(-((i * 3 + title.length) % 30)),
          }),
        );
      }
    }
  }
  for (const [title, pages] of [["Pecahan Senilai", 12], ["Penjumlahan Pecahan Biasa", 14], ["KPK dan FPB", 16], ["Bangun Datar Sederhana", 10]] as const)
    matRows.push({ title, subject: "Matematika", bidang: title.includes("Bangun") ? "Geometri" : "Bilangan", bab: title.includes("Bangun") ? "Bangun Datar" : "Pecahan", jenjang: "SD", grade: 5, pages, author: TUTORS[0][0] });
  const mats = await db.insert(t.materials).values(matRows).returning();
  const mat = (title: string) => mats.find((m) => m.title === title)!;

  // Nadia's reading history: Pecahan fully opened, a little of everything else.
  const prog: (typeof t.progress.$inferInsert)[] = [
    { userId: nadia.id, materialId: mat("Penjumlahan Pecahan").id, page: 9, updatedAt: new Date(Date.now() - 2 * 3_600_000) },
    { userId: nadia.id, materialId: mat("Pengurangan Pecahan").id, page: 18, updatedAt: at(-3) },
    { userId: nadia.id, materialId: mat("Hukum Newton I").id, page: 3, updatedAt: at(-1, 19) },
    { userId: nadia.id, materialId: mat("Simple Present: Form").id, page: 10, updatedAt: at(-4) },
  ];
  const nadiaReads = mats.filter((m) => m.jenjang === "SMP" && m.status === "publish");
  const wantBySubject: Record<string, number> = { Matematika: 24, IPA: 12, "B. Indonesia": 9, "B. Inggris": 9, IPS: 3 };
  for (const m of nadiaReads) {
    if (prog.some((p) => p.materialId === m.id)) continue;
    const have = prog.filter((p) => mats.find((x) => x.id === p.materialId)?.subject === m.subject).length;
    if (have >= wantBySubject[m.subject]) continue;
    prog.push({ userId: nadia.id, materialId: m.id, page: r() < 0.5 ? m.pages : Math.max(1, Math.floor(m.pages * r())), updatedAt: at(-(5 + Math.floor(r() * 40))) });
  }
  for (const u of smp.slice(0, 20)) {
    if (u.id === nadia.id) continue;
    for (const m of nadiaReads.slice(0, 6)) prog.push({ userId: u.id, materialId: m.id, page: Math.ceil(m.pages * r()), updatedAt: at(-Math.floor(r() * 20)) });
  }
  await db.insert(t.progress).values(prog);

  // ---- bank soal ---------------------------------------------------------------------------
  const qs = await db
    .insert(t.questions)
    .values(buildQuestions().map((q, i) => ({ ...q, createdAt: at(-(i % 60)) })))
    .returning();
  const pgSmp = qs.filter((q) => q.type === "pg" && q.jenjang === "SMP");
  const byBab = (bab: string) => pgSmp.filter((q) => q.bab === bab);
  const bySubject = (s: string) => pgSmp.filter((q) => q.subject === s);
  const take = <T,>(arr: T[], n: number) => [...arr].sort(() => r() - 0.5).slice(0, n);

  // ---- quiz --------------------------------------------------------------------------------
  const quizRows: (typeof t.quizzes.$inferInsert)[] = [
    { title: "Uji Kompetensi Matematika — Pecahan", kind: "ujikom", subject: "Matematika", bidang: "Bilangan", bab: "Pecahan", jenjang: "SMP", grade: 9, durationMin: 60, questionIds: take([...byBab("Pecahan"), ...byBab("Perbandingan")], 20).map((q) => q.id), accessCode: "MTK019", startsAt: new Date(Date.now() - 40 * 60_000), endsAt: at(14, 22), createdBy: "tutor.budi" },
    { title: "Uji Kompetensi IPA — Gaya & Gerak", kind: "ujikom", subject: "IPA", bidang: "Fisika", bab: "Gaya dan Hukum Newton", jenjang: "SMP", grade: 9, durationMin: 60, questionIds: take(bySubject("IPA"), 12).map((q) => q.id), accessCode: "IPA030", startsAt: at(5, 19), endsAt: at(5, 21), createdBy: "tutor.budi" },
    { title: "Tryout Bersama Rumbasha", kind: "tryout", subject: "Semua", jenjang: "SMP", grade: 9, durationMin: 120, questionIds: take(pgSmp, 40).map((q) => q.id), accessCode: "TOB201", startsAt: new Date(Date.UTC(2026, 11, 20, 1, 0)), endsAt: new Date(Date.UTC(2026, 11, 20, 3, 30)), createdBy: "Rina Sari" },
    { title: "Tryout Masuk SMA #2", kind: "tryout", subject: "Semua", jenjang: "SMP", grade: 9, durationMin: 120, questionIds: take(pgSmp, 30).map((q) => q.id), accessCode: "TOSMA2", startsAt: at(-22, 8), endsAt: at(-22, 10, 30), status: "selesai", createdBy: "Rina Sari" },
    { title: "Uji Kom IPA — Zat & Wujudnya", kind: "ujikom", subject: "IPA", bidang: "Kimia", bab: "Zat dan Wujudnya", jenjang: "SMP", grade: 8, durationMin: 45, questionIds: take(bySubject("IPA"), 10).map((q) => q.id), accessCode: "ZAT008", startsAt: at(-26, 19), endsAt: at(-26, 21), status: "selesai", createdBy: "tutor.dewi" },
    { title: "Uji Kom Matematika — Bangun Datar", kind: "ujikom", subject: "Matematika", bidang: "Geometri", bab: "Bangun Datar", jenjang: "SMP", grade: 8, durationMin: 45, questionIds: take(byBab("Bangun Datar"), 12).map((q) => q.id), accessCode: "BDT001", startsAt: at(-33, 19), endsAt: at(-33, 21), status: "selesai", createdBy: "tutor.budi" },
    { title: "Uji Kom B. Inggris — Tenses", kind: "ujikom", subject: "B. Inggris", bidang: "Grammar", jenjang: "SMP", grade: 8, durationMin: 30, questionIds: take(bySubject("B. Inggris"), 6).map((q) => q.id), status: "draft", createdBy: "tutor.maya" },
    { title: "Quiz Trial Calon Siswa", kind: "trial", subject: "Semua", jenjang: "SMP", grade: 9, durationMin: 10, questionIds: [byBab("Pecahan")[0], byBab("Persamaan Linear")[0], byBab("Aljabar")[0], bySubject("IPA")[0], bySubject("B. Inggris")[0]].map((q) => q.id), createdBy: "sistem" },
  ];
  // Daily Quiz sets the seeded history points at (one per bab + level).
  for (const bab of ["Pecahan", "Perbandingan", "Aljabar", "Persamaan Linear", "Bangun Datar", "Statistika", "Gaya dan Hukum Newton", "Zat dan Wujudnya", "Simple Present Tense", "Teks Narasi", "Peta dan Letak Indonesia"]) {
    const pool = byBab(bab);
    if (!pool.length) continue;
    const sample = pool[0];
    for (const level of ["Mudah", "Sedang", "Sulit"]) {
      const ids = take(pool.filter((q) => q.level === level).concat(pool), 5).map((q) => q.id);
      quizRows.push({ title: `${bab} · ${level}`, kind: "daily", subject: sample.subject, bidang: sample.bidang, bab, level, jenjang: "SMP", durationMin: 10, questionIds: [...new Set(ids)], createdBy: "sistem" });
    }
  }
  const quizzes = await db.insert(t.quizzes).values(quizRows).returning();
  const quiz = (title: string) => quizzes.find((q) => q.title === title)!;

  // ---- RUMATH: videos per jenis + generated latihan sets -----------------------------------
  const levelName = ["Mudah", "Sedang", "Sulit"] as const;
  for (const { name: jenis } of RUMATH_JENIS) {
    const vids = await db
      .insert(t.videos)
      .values(RUMATH_VIDEOS[jenis].map(([title, dur, description], i) => ({ title, subject: "Matematika", bidang: jenis, jenjang: "SMP" as const, durationSec: dur, url: "", description, position: i + 1, views: 80 + Math.floor(r() * 900), createdAt: at(-(40 - i * 3)) })))
      .returning();
    if (jenis === "Penjumlahan") {
      await db.insert(t.videoProgress).values([
        { userId: nadia.id, videoId: vids[0].id, seconds: vids[0].durationSec, done: true, updatedAt: at(-6) },
        { userId: nadia.id, videoId: vids[1].id, seconds: 192, updatedAt: at(-1, 18) },
      ]);
    }
    if (jenis === "Perkalian") await db.insert(t.videoProgress).values({ userId: nadia.id, videoId: vids[0].id, seconds: 120, updatedAt: at(-3, 18) });
    if (jenis === "Soal cerita") await db.insert(t.videoProgress).values({ userId: nadia.id, videoId: vids[2].id, seconds: 210, saved: true, updatedAt: at(-4, 18) });
    for (const level of [1, 2]) {
      const gen = Array.from({ length: RUMATH_QUESTIONS }, () => rumathSoal(jenis, level, r));
      const ids = await db
        .insert(t.questions)
        .values(gen.map((g) => ({ subject: "Matematika", bidang: "RUMATH", bab: jenis, jenjang: "SMP" as const, grade: 7, level: levelName[level - 1], type: "isian" as const, prompt: g.prompt, options: [g.hint], answer: g.answer, explanation: g.explanation, tag: "RUMATH" })))
        .returning({ id: t.questions.id });
      const [rq] = await db
        .insert(t.quizzes)
        .values({ title: `RUMATH · ${jenis} Lv ${level}`, kind: "rumath", subject: "Matematika", bidang: "RUMATH", bab: jenis, level: String(level), jenjang: "SMP", durationMin: RUMATH_MINUTES, questionIds: ids.map((x) => x.id), coinCost: RUMATH_COIN, createdBy: "sistem" })
        .returning();
      quizzes.push(rq);
    }
  }

  // ---- attempts ----------------------------------------------------------------------------
  const qById = new Map((await db.select().from(t.questions)).map((q) => [q.id, q]));
  const answersFor = (ids: number[], score: number) => {
    const total = ids.length;
    const correct = Math.round((score / 100) * total);
    const answers: Record<string, string> = {};
    ids.forEach((id, i) => {
      const q = qById.get(id)!;
      if (i < correct) answers[id] = q.answer;
      else if (q.type === "isian") answers[id] = String(Number(q.answer) + 1);
      else answers[id] = String((Number(q.answer) + 1) % q.options.length);
    });
    return { answers, correct, total };
  };
  const attemptRows: (typeof t.attempts.$inferInsert)[] = [];
  const addAttempt = (userId: number, qz: typeof quizzes[number], score: number, when: Date) => {
    const ids = qz.questionIds;
    const { answers, correct, total } = answersFor(ids, score);
    const real = Math.round((correct / total) * 100);
    attemptRows.push({ userId, quizId: qz.id, answers, correct, total, score: real, startedAt: new Date(when.getTime() - 8 * 60_000), submittedAt: when });
  };

  const dailies = quizzes.filter((q) => q.kind === "daily");
  // Nadia's recent Daily Quiz history from the design.
  addAttempt(nadia.id, quiz("Pecahan · Sedang"), 80, at(-1, 7, 12));
  addAttempt(nadia.id, quiz("Gaya dan Hukum Newton · Mudah"), 100, at(-1, 16, 40));
  addAttempt(nadia.id, quiz("Bangun Datar · Sulit"), 60, at(-3, 19, 5));
  for (let i = 0; i < 21; i++) addAttempt(nadia.id, dailies[Math.floor(r() * dailies.length)], 60 + Math.floor(r() * 9) * 5, at(-(4 + i * 3), 18, 30));

  // Everyone else: 12 weeks of Daily Quiz for the admin chart and leaderboard.
  siswa.forEach((u, idx) => {
    if (u.id === nadia.id) return;
    const skill = u.jenjang === "SD" ? 74 : 62 + Math.max(0, 22 - idx);
    const n = 6 + Math.floor(r() * 14);
    for (let i = 0; i < n; i++) {
      const week = Math.floor(r() * 12);
      const trend = (12 - week) * 0.6;
      const score = Math.max(20, Math.min(100, Math.round((skill + trend + (r() - 0.5) * 30) / 20) * 20));
      addAttempt(u.id, dailies[Math.floor(r() * dailies.length)], score, at(-(week * 7 + Math.floor(r() * 7)), 15 + Math.floor(r() * 6), Math.floor(r() * 59)));
    }
  });

  // Finished Uji Kom / Tryout with full rankings.
  const finished: [string, number, number][] = [
    ["Tryout Masuk SMA #2", 71, -22],
    ["Uji Kom IPA — Zat & Wujudnya", 88, -26],
    ["Uji Kom Matematika — Bangun Datar", 76, -33],
  ];
  for (const [title, nadiaScore, day] of finished) {
    const qz = quiz(title);
    addAttempt(nadia.id, qz, nadiaScore, at(day, 20, 10));
    smp.filter((u) => u.id !== nadia.id).slice(0, title.startsWith("Tryout") ? 36 : 30).forEach((u, i) => {
      const score = Math.max(30, Math.min(100, Math.round(95 - i * 1.6 + (r() - 0.5) * 18)));
      addAttempt(u.id, qz, score, at(day, 20, Math.floor(r() * 50)));
    });
  }
  // RUMATH practice.
  const rumaths = quizzes.filter((q) => q.kind === "rumath");
  smp.slice(0, 30).forEach((u) => {
    for (let i = 0; i < 3; i++) addAttempt(u.id, rumaths[Math.floor(r() * rumaths.length)], 40 + Math.floor(r() * 4) * 20, at(-Math.floor(r() * 28), 17));
  });
  addAttempt(nadia.id, rumaths[0], 80, at(-2, 17, 20));
  addAttempt(nadia.id, rumaths[4], 100, at(-6, 17, 45));

  for (let i = 0; i < attemptRows.length; i += 200) await db.insert(t.attempts).values(attemptRows.slice(i, i + 200));

  // ---- notifications -----------------------------------------------------------------------
  await db.insert(t.notifications).values([
    { kind: "quiz", title: "Uji Kom Matematika sudah dibuka", body: "Uji Kompetensi Matematika — Pecahan sedang berlangsung. Siapkan kode akses dari tutor.", href: "/siswa/ujikom", createdAt: new Date(Date.now() - 35 * 60_000) },
    { userId: nadia.id, kind: "peringkat", title: "Kamu naik 3 peringkat!", body: "Sekarang kamu peringkat #12 Daily Quiz. Pertahankan streak 6 harimu.", href: "/siswa/peringkat", createdAt: new Date(Date.now() - 3 * 3_600_000) },
    { kind: "materi", title: "Materi baru: Rumus ABC", body: "Bab Persamaan Kuadrat punya PDF baru dari Kak Dewi.", href: "/siswa/modul?mapel=Matematika", createdAt: at(-1, 10) },
    { kind: "promo", title: "Promo November", body: "Diskon 30% Paket Intensif Masuk SMA sampai 30 November.", href: "/siswa/paket", createdAt: at(-2, 8) },
    { kind: "quiz", title: "Tryout Bersama 20 Desember", body: "Tryout Bersama Rumbasha dibuka Sabtu, 20 Des pukul 08.00. 40 soal, 120 menit.", href: "/siswa/ujikom", createdAt: at(-4, 9) },
    { kind: "sistem", title: "Jatah Daily Quiz terisi lagi", body: "Kamu dapat 2 Daily Quiz gratis setiap hari. Setelah itu 10 coin per quiz.", href: "/siswa/quiz", createdAt: at(-6, 6) },
  ]);

  // ---- images ------------------------------------------------------------------------------
  const svg = (body: string, w = 320, h = 200) =>
    Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#fff"/>${body}</svg>`).toString("base64");
  await db.insert(t.images).values([
    { name: "segitiga-siku-siku.svg", mime: "image/svg+xml", size: 812, width: 320, height: 200, folder: "Soal", uploadedBy: "admin.sari", data: svg(`<path d="M60 170 L60 40 L260 170 Z" fill="#EEF0FF" stroke="#3F4197" stroke-width="3"/><rect x="60" y="150" width="20" height="20" fill="none" stroke="#3F4197" stroke-width="2"/><text x="40" y="110" font-size="16" fill="#0E1168">6</text><text x="150" y="190" font-size="16" fill="#0E1168">8</text><text x="170" y="95" font-size="16" fill="#0E1168">c</text>`) },
    { name: "lingkaran-jari-jari.svg", mime: "image/svg+xml", size: 640, width: 320, height: 200, folder: "Soal", uploadedBy: "admin.sari", data: svg(`<circle cx="160" cy="100" r="80" fill="#FFF0E3" stroke="#F78433" stroke-width="3"/><line x1="160" y1="100" x2="240" y2="100" stroke="#0E1168" stroke-width="2"/><circle cx="160" cy="100" r="4" fill="#0E1168"/><text x="190" y="92" font-size="16" fill="#0E1168">r = 7</text>`) },
    { name: "diagram-batang-nilai.svg", mime: "image/svg+xml", size: 920, width: 320, height: 200, folder: "Soal", uploadedBy: "Rina Sari", data: svg([60, 120, 90, 150, 110].map((v, i) => `<rect x="${40 + i * 52}" y="${180 - v}" width="34" height="${v}" rx="4" fill="${i % 2 ? "#F78433" : "#3F4197"}"/>`).join("") + `<line x1="30" y1="180" x2="300" y2="180" stroke="#9A9CB8"/>`) },
    { name: "garis-bilangan.svg", mime: "image/svg+xml", size: 700, width: 320, height: 120, folder: "Soal", uploadedBy: "admin.rio", data: svg(`<line x1="20" y1="60" x2="300" y2="60" stroke="#0E1168" stroke-width="2"/>${Array.from({ length: 11 }, (_, i) => `<line x1="${30 + i * 26}" y1="52" x2="${30 + i * 26}" y2="68" stroke="#0E1168"/><text x="${26 + i * 26}" y="90" font-size="12" fill="#0E1168">${i - 5}</text>`).join("")}`, 320, 120) },
    { name: "rangkaian-listrik.svg", mime: "image/svg+xml", size: 760, width: 320, height: 200, folder: "Soal", uploadedBy: "tutor.hendra", data: svg(`<rect x="60" y="40" width="200" height="120" fill="none" stroke="#0E1168" stroke-width="3"/><rect x="140" y="28" width="40" height="24" fill="#FFF7DD" stroke="#D97706" stroke-width="2"/><line x1="55" y1="90" x2="65" y2="90" stroke="#0E1168" stroke-width="6"/><text x="150" y="190" font-size="14" fill="#0E1168">R = 6 Ω</text>`) },
    { name: "banner-promo-november.svg", mime: "image/svg+xml", size: 540, width: 320, height: 120, folder: "Banner", uploadedBy: "Rina Sari", data: svg(`<rect width="320" height="120" rx="16" fill="#F78433"/><text x="20" y="55" font-size="20" font-weight="700" fill="#fff">Diskon 30%</text><text x="20" y="82" font-size="13" fill="#fff">Paket Intensif Masuk SMA</text>`, 320, 120) },
  ]);

  // ---- coin, payments, tasks, activity, settings -------------------------------------------
  await db.insert(t.coinTx).values([
    { userId: nadia.id, amount: 100, note: "Coin bulanan Reguler SMP", by: "sistem", createdAt: at(-3, 0, 5) },
    { userId: nadia.id, amount: -10, note: "Daily Quiz tambahan", by: "sistem", createdAt: at(-5, 19) },
    { userId: nadia.id, amount: -5, note: "RUMATH — Kali 11", by: "sistem", createdAt: at(-2, 17, 18) },
    { userId: nadia.id, amount: 300, note: "Top-up 300 coin", by: "sistem", createdAt: at(-20, 14) },
  ]);
  await db.insert(t.payments).values([
    { userId: nadia.id, item: "Reguler SMP · Semester", amount: 2430000, method: "QRIS", createdAt: at(-125, 10) },
    { userId: nadia.id, item: "Top-up 300 coin", amount: 68000, method: "GoPay", createdAt: at(-20, 14) },
  ]);
  const admins = staff.filter((u) => u.role === "admin");
  await db.insert(t.tasks).values([
    { title: "Upload 40 soal Daily Quiz SMP — Pecahan", category: "Bank soal", assigneeId: rina.id, priority: "Tinggi", dueAt: at(0, 17), createdBy: "Hendrawan" },
    { title: "Buat pengumuman Tryout Bersama", category: "Pengumuman", assigneeId: rina.id, priority: "Tinggi", dueAt: at(1, 12), createdBy: "Hendrawan" },
    { title: "Kode akses Uji Kom IPA 30 Okt", category: "Quiz", assigneeId: rina.id, priority: "Sedang", dueAt: at(4, 18), createdBy: "Hendrawan" },
    { title: "Import 120 akun siswa baru", category: "User", assigneeId: rina.id, priority: "Sedang", dueAt: at(-2), done: true, createdBy: "Hendrawan" },
    { title: "Review materi Statistika kelas 8", category: "Materi", assigneeId: admins[1].id, priority: "Rendah", dueAt: at(6), createdBy: "Hendrawan" },
    { title: "Cek laporan RUMATH bulan Oktober", category: "Report", assigneeId: admins[2].id, priority: "Sedang", dueAt: at(2), createdBy: "Hendrawan" },
  ]);
  await db.insert(t.activity).values([
    { actor: "admin.sari", avatar: 2, text: "import 240 soal pilihan ganda", createdAt: new Date(Date.now() - 5 * 60_000) },
    { actor: "tutor.budi", avatar: 1, text: "membuat kode Uji Kom IPA", createdAt: new Date(Date.now() - 20 * 60_000) },
    { actor: "admin.rio", avatar: 5, text: "menambah 12 siswa via Excel", createdAt: new Date(Date.now() - 2 * 3_600_000) },
    { actor: "Rina Sari", avatar: 9, text: "publish 2 materi baru", createdAt: at(-1, 15) },
  ]);
  await db.insert(t.settings).values([
    { key: "hero", value: { title: "Bangun dasar yang kuat sejak SD", subtitle: "Siapkan TKA dan seleksi masuk SMA bersama Rumbasha.", cta: "Coba Quiz Trial", ctaHref: "/quiz-trial", published: true } },
    { key: "promo", value: { label: "Promo November", title: "Diskon 30% Paket Intensif Masuk SMA", cta: "Lihat promo", href: "/siswa/paket", active: true } },
    { key: "announcement", value: { text: "Tryout Bersama · Sabtu, 20 Des pukul 08.00", href: "/siswa/ujikom" } },
    {
      key: "leaderboard",
      value: {
        daily: { periode: "Mingguan", reset: "Senin 00.00", poin: "Nilai ÷ 2 per quiz", top: 10, hadiah: "50 coin untuk 3 teratas" },
        ujikom: { periode: "Per sesi", reset: "Saat sesi ditutup", poin: "Nilai × 1,4", top: 10, hadiah: "Sertifikat digital" },
        tryout: { periode: "Per tryout", reset: "Saat tryout ditutup", poin: "Skor 0–1.000", top: 20, hadiah: "Konsultasi gratis" },
        rumath: { periode: "Bulanan", reset: "Tgl 1, 00.00", poin: "10 poin / soal benar", top: 10, hadiah: "100 coin untuk juara 1" },
      },
    },
    {
      key: "landing",
      value: {
        sections: [
          { key: "hero", name: "Hero", desc: "Judul, tombol, foto alumni", visible: true },
          { key: "video", name: "Video profil", desc: "Video company profile 2 menit", visible: true },
          { key: "bukti", name: "Bukti prestasi", desc: "Alumni yang masuk SMA favorit", visible: true },
          { key: "program", name: "Program", desc: "Reguler, Intensif, Privat", visible: true },
          { key: "fasilitas", name: "Fasilitas", desc: "Foto ruang kelas & cabang", visible: true },
          { key: "testimoni", name: "Testimoni", desc: "Cerita orang tua & siswa", visible: true },
          { key: "promo", name: "Promo", desc: "Banner promo bulanan", visible: false },
          { key: "faq", name: "FAQ", desc: "12 pertanyaan", visible: true },
        ],
        changes: ["Hero · judul diubah", "Promo · disembunyikan"],
        publishedAt: new Date(Date.now() - 83 * 86_400_000).toISOString(),
        publishedBy: "Rina Sari",
      },
    },
    { key: "contact", value: { whatsapp: "6281234567890", hours: "Senin–Sabtu 08.00–20.00" } },
  ]);
}
