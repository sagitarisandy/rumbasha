// Curriculum tree and per-mapel styling shared by the seed, siswa and admin screens.

export const MAPEL = ["Matematika", "IPA", "B. Indonesia", "B. Inggris", "IPS"] as const;
export type Mapel = (typeof MAPEL)[number];

type MapelStyle = {
  slug: string;
  color: string;
  /** soft tint behind Rumbi in the mapel filter cards */
  tint: string;
  /** decoration on the materi cover: math notation ($…$) or a short word */
  motif: string;
};

export const MAPEL_STYLE: Record<Mapel | "Semua", MapelStyle> = {
  Semua: { slug: "semua", color: "#F78433", tint: "#FFF0E3", motif: "" },
  Matematika: { slug: "matematika", color: "#3F4197", tint: "#EEF0FF", motif: "$\\f{2}{3} + \\f{1}{4}$" },
  IPA: { slug: "ipa", color: "#14A06B", tint: "#E9F6EF", motif: "atom" },
  "B. Indonesia": { slug: "b-indonesia", color: "#E5574D", tint: "#FDECEC", motif: "Aa" },
  "B. Inggris": { slug: "b-inggris", color: "#2A86DB", tint: "#E8F2FF", motif: "Hello!" },
  IPS: { slug: "ips", color: "#0E9AA0", tint: "#E3F5F5", motif: "globe" },
};

export function mapelStyle(mapel: string) {
  return MAPEL_STYLE[(mapel in MAPEL_STYLE ? mapel : "Semua") as Mapel | "Semua"];
}

/** Notation shown on Matematika bab covers. */
export const BAB_MOTIF: Record<string, string> = {
  Pecahan: "$\\f{2}{3} + \\f{1}{4}$",
  Perbandingan: "$3 : 4$",
  Aljabar: "$2(4x - 2y)$",
  "Persamaan Linear": "$2x + 5 = 11$",
  "Persamaan Kuadrat": "$x^2 + 5x + 6 = 0$",
  "Bangun Datar": "$L = \\pi r^2$",
  "Teorema Pythagoras": "$a^2 + b^2 = c^2$",
  Statistika: "$\\f{\\Sigma x}{n}$",
  "Bilangan Bulat": "$-7 + 12$",
  "KPK dan FPB": "$12, 18$",
};

type Bab = { name: string; pdfs: [string, number][] };
type Bidang = { name: string; bab: Bab[] };

/** SMP tree (Kelas 7–9). SD reuses a smaller copy below. */
export const KURIKULUM: Record<Mapel, Bidang[]> = {
  Matematika: [
    {
      name: "Bilangan",
      bab: [
        { name: "Pecahan", pdfs: [["Penjumlahan Pecahan", 24], ["Pengurangan Pecahan", 18], ["Perkalian Pecahan", 20], ["Pembagian Pecahan", 22], ["Pecahan Campuran", 16], ["Desimal dan Persen", 14]] },
        { name: "Perbandingan", pdfs: [["Perbandingan Senilai", 12], ["Perbandingan Berbalik Nilai", 14], ["Skala dan Peta", 10], ["Soal Cerita Perbandingan", 16], ["Kecepatan dan Debit", 12]] },
      ],
    },
    {
      name: "Aljabar",
      bab: [
        { name: "Aljabar", pdfs: [["Bentuk Aljabar", 16], ["Operasi Bentuk Aljabar", 18], ["Pemfaktoran", 20], ["Pecahan Aljabar", 14], ["Substitusi", 10], ["Soal Cerita Aljabar", 12], ["Latihan Campuran", 8], ["Ringkasan Aljabar", 6]] },
        { name: "Persamaan Linear", pdfs: [["Persamaan Linear Satu Variabel", 14], ["Pertidaksamaan Linear", 12], ["Sistem Persamaan Linear Dua Variabel", 22], ["Gradien dan Garis Lurus", 18], ["Soal Cerita SPLDV", 14], ["Latihan TKA", 10]] },
        { name: "Persamaan Kuadrat", pdfs: [["Bentuk Umum Persamaan Kuadrat", 12], ["Akar dengan Pemfaktoran", 16], ["Rumus ABC", 14], ["Fungsi Kuadrat", 20], ["Latihan Persamaan Kuadrat", 10]] },
      ],
    },
    {
      name: "Geometri",
      bab: [
        { name: "Bangun Datar", pdfs: [["Keliling dan Luas Segi Empat", 18], ["Luas Lingkaran", 14], ["Segitiga", 16], ["Bangun Gabungan", 12], ["Sudut dan Garis", 14], ["Kesebangunan", 18], ["Latihan Bangun Datar", 10]] },
        { name: "Teorema Pythagoras", pdfs: [["Rumus Pythagoras", 12], ["Tripel Pythagoras", 8], ["Soal Cerita Pythagoras", 10]] },
      ],
    },
    {
      name: "Statistika",
      bab: [{ name: "Statistika", pdfs: [["Mean, Median, Modus", 16], ["Penyajian Data", 14], ["Peluang", 18], ["Latihan Statistika", 10]] }],
    },
  ],
  IPA: [
    {
      name: "Fisika",
      bab: [
        { name: "Gaya dan Hukum Newton", pdfs: [["Hukum Newton I", 12], ["Hukum Newton II", 14], ["Hukum Newton III", 10], ["Gaya Gesek", 12]] },
        { name: "Gerak Lurus", pdfs: [["GLB dan GLBB", 16], ["Kecepatan dan Percepatan", 12], ["Grafik Gerak", 10]] },
        { name: "Listrik", pdfs: [["Listrik Statis", 12], ["Rangkaian Listrik", 16], ["Hukum Ohm", 10]] },
      ],
    },
    {
      name: "Biologi",
      bab: [
        { name: "Sistem Pencernaan", pdfs: [["Organ Pencernaan", 14], ["Enzim Pencernaan", 10], ["Gangguan Pencernaan", 8]] },
        { name: "Sel dan Jaringan", pdfs: [["Struktur Sel", 12], ["Jaringan Tumbuhan", 14]] },
      ],
    },
    {
      name: "Kimia",
      bab: [{ name: "Zat dan Wujudnya", pdfs: [["Wujud Zat", 10], ["Perubahan Wujud", 12], ["Massa Jenis", 10], ["Campuran dan Larutan", 14]] }],
    },
  ],
  "B. Indonesia": [
    {
      name: "Teks",
      bab: [
        { name: "Teks Narasi", pdfs: [["Struktur Teks Narasi", 10], ["Kaidah Kebahasaan Narasi", 12], ["Menulis Cerpen", 14]] },
        { name: "Teks Eksposisi", pdfs: [["Struktur Teks Eksposisi", 10], ["Fakta dan Opini", 8], ["Menulis Eksposisi", 12]] },
        { name: "Teks Deskripsi", pdfs: [["Ciri Teks Deskripsi", 8], ["Menulis Deskripsi", 10]] },
      ],
    },
    {
      name: "Kebahasaan",
      bab: [{ name: "Kalimat Efektif", pdfs: [["Ciri Kalimat Efektif", 10], ["Ejaan dan Tanda Baca", 12], ["Kata Baku", 8], ["Konjungsi", 8]] }],
    },
  ],
  "B. Inggris": [
    {
      name: "Grammar",
      bab: [
        { name: "Simple Present Tense", pdfs: [["Simple Present: Form", 10], ["Simple Present: Usage", 8], ["Present Continuous", 10]] },
        { name: "Simple Past Tense", pdfs: [["Regular and Irregular Verbs", 12], ["Past Tense in Stories", 10]] },
      ],
    },
    {
      name: "Reading",
      bab: [
        { name: "Descriptive Text", pdfs: [["Describing People", 8], ["Describing Places", 8], ["Descriptive Text Practice", 10]] },
        { name: "Recount Text", pdfs: [["Recount Text Structure", 8], ["Recount Practice", 10]] },
      ],
    },
  ],
  IPS: [
    {
      name: "Geografi",
      bab: [{ name: "Peta dan Letak Indonesia", pdfs: [["Membaca Peta", 10], ["Letak Astronomis", 8], ["Letak Geografis", 8], ["Iklim Indonesia", 12]] }],
    },
    {
      name: "Sejarah",
      bab: [{ name: "Kerajaan Hindu-Buddha", pdfs: [["Kerajaan Kutai dan Tarumanegara", 10], ["Sriwijaya", 10], ["Majapahit", 12]] }],
    },
    {
      name: "Ekonomi",
      bab: [{ name: "Kegiatan Ekonomi", pdfs: [["Produksi, Distribusi, Konsumsi", 12], ["Pasar", 10], ["Koperasi", 8]] }],
    },
  ],
};

export function bidangOf(mapel: string) {
  return KURIKULUM[mapel as Mapel]?.map((b) => b.name) ?? [];
}

export function babOf(mapel: string, bidang: string) {
  return KURIKULUM[mapel as Mapel]?.find((b) => b.name === bidang)?.bab.map((b) => b.name) ?? [];
}

export const LEVELS = [
  { name: "Mudah", stars: 1, hint: "soal dasar" },
  { name: "Sedang", stars: 2, hint: "campuran" },
  { name: "Sulit", stars: 3, hint: "soal cerita" },
] as const;

export const SEKOLAH_SMP = ["SMPN 1 Surabaya", "SMPN 3 Surabaya", "SMPN 6 Surabaya", "SMPN 12 Surabaya", "SMP Al-Hikmah", "SMP Muhammadiyah 5", "SMPN 19 Surabaya", "SMP Ciputra"];
export const SEKOLAH_SD = ["SD Al-Hikmah", "SDN Kertajaya", "SDN Dr. Soetomo", "SD Muhammadiyah 4", "SD Ciputra"];
export const CABANG = ["Surabaya Timur", "Surabaya Barat", "Sidoarjo"];

export const DAILY_FREE_PER_DAY = 2;
export const DAILY_COIN_COST = 10;
export const DAILY_QUESTIONS = 5;
export const DAILY_MINUTES = 10;

/** Seed values only; the live list is packages where kind = "coin". */
export const COIN_PACKS = [
  { coin: 100, price: 25000, note: "Untuk 2 tryout" },
  { coin: 300, price: 68000, note: "Hemat 10%" },
  { coin: 600, price: 128000, note: "Hemat 15%" },
  { coin: 1200, price: 240000, note: "Hemat 20%" },
];

export const PERIODS = [
  { key: "bulanan", label: "Bulanan", months: 1, discount: 0 },
  { key: "semester", label: "Semester", months: 6, discount: 0.1 },
  { key: "tahunan", label: "Tahunan −20%", months: 12, discount: 0.2 },
] as const;
