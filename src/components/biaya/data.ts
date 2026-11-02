// Copy for the "Paket & Harga" boards in Penpot (one board per tab).
// Each feature is [label, included]; compare values are text, or true/false for check / dash.

export type Paket = { name: string; desc: string; meta: string; cta: string; price?: string; features: [string, boolean][] };
export type CompareRow = { label: string; values: (string | boolean)[] };
export type JenjangTab = {
  id: string;
  tab: string;
  eyebrow: string;
  title: string;
  desc: string;
  note: string;
  compareIntro: string;
  pakets: [Paket, Paket, Paket];
  compare: CompareRow[];
};

const NOTE_TATAP_MUKA =
  "Biaya tidak dicantumkan karena menyesuaikan cabang, jadwal, dan jumlah pertemuan. Admin akan mengirim rincian biaya setelah Anda memilih paket.";

export const biayaTabs: JenjangTab[] = [
  {
    id: "sd",
    tab: "Pra SD & SD",
    eyebrow: "Paket bimbel Pra SD & SD",
    title: "Paket belajar Pra SD & SD di Rumbasha",
    desc: "Belajar tatap muka di cabang Rumbasha dengan kelas kecil dan pengajar tetap. Lihat isi tiap paket, lalu tanyakan biaya dan jadwal ke admin.",
    note: NOTE_TATAP_MUKA,
    compareIntro: "Lihat perbedaan isi tiap paket Pra SD & SD sebelum memilih.",
    pakets: [
      {
        name: "Calistung",
        desc: "Fondasi baca, tulis, dan hitung untuk anak yang baru mulai sekolah.",
        meta: "Tatap muka di cabang · Pra SD – kelas 3 SD",
        cta: "Pilih Paket Calistung",
        features: [
          ["Membaca & menulis permulaan", true],
          ["Berhitung dasar", true],
          ["Kelas kecil, pengajar sabar", true],
          ["Lembar kerja & latihan rutin", true],
          ["Laporan bulanan ke orang tua", true],
          ["Bimbingan tugas sekolah", false],
          ["Persiapan ujian sekolah", false],
        ],
      },
      {
        name: "Reguler SD",
        desc: "Penguatan literasi, numerasi, dan mapel sekolah untuk kelas atas SD.",
        meta: "Tatap muka di cabang · Kelas 4–6 SD",
        cta: "Pilih Paket Reguler SD",
        features: [
          ["Literasi & numerasi", true],
          ["Mapel inti sekolah", true],
          ["Bimbingan tugas sekolah", true],
          ["Latihan & evaluasi rutin", true],
          ["Persiapan ujian sekolah", true],
          ["Pengajar tetap tiap kelas", true],
          ["Laporan mingguan ke orang tua", true],
        ],
      },
      {
        name: "Privat SD",
        desc: "Belajar 1-on-1 dengan materi dan ritme yang disesuaikan untuk anak.",
        meta: "Tatap muka 1-on-1 · Pra SD – kelas 6 SD",
        cta: "Pilih Paket Privat SD",
        features: [
          ["Belajar 1-on-1 dengan pengajar", true],
          ["Jadwal fleksibel", true],
          ["Materi sesuai kebutuhan anak", true],
          ["Bimbingan tugas & ujian sekolah", true],
          ["Laporan setiap pertemuan", true],
          ["Prioritas respons admin", true],
        ],
      },
    ],
    compare: [
      { label: "Jenjang", values: ["Pra SD – kelas 3", "Kelas 4–6 SD", "Pra SD – kelas 6"] },
      { label: "Format kelas", values: ["Kelompok kecil", "Kelompok kecil", "1-on-1"] },
      { label: "Pengajar tetap", values: [true, true, true] },
      { label: "Latihan & evaluasi rutin", values: [true, true, true] },
      { label: "Bimbingan tugas sekolah", values: [false, true, true] },
      { label: "Persiapan ujian sekolah", values: [false, true, true] },
      { label: "Laporan ke orang tua", values: ["Bulanan", "Mingguan", "Tiap pertemuan"] },
      { label: "Jadwal", values: ["Tetap", "Tetap", "Fleksibel"] },
    ],
  },
  {
    id: "smp",
    tab: "SMP",
    eyebrow: "Paket bimbel SMP",
    title: "Paket belajar SMP & persiapan TKA",
    desc: "Kuatkan nilai sekolah sejak kelas 7, lalu siapkan TKA dan seleksi masuk SMA favorit. Lihat isi tiap paket, lalu tanyakan biaya dan jadwal ke admin.",
    note: NOTE_TATAP_MUKA,
    compareIntro: "Lihat perbedaan isi tiap paket SMP sebelum memilih.",
    pakets: [
      {
        name: "Reguler SMP",
        desc: "Pendampingan mapel sekolah dan tugas harian untuk murid SMP.",
        meta: "Tatap muka di cabang · Kelas 7–9 SMP",
        cta: "Pilih Paket Reguler SMP",
        features: [
          ["Mapel inti sekolah", true],
          ["Bimbingan tugas sekolah", true],
          ["Persiapan ujian sekolah", true],
          ["Kelas kecil, pengajar tetap", true],
          ["Laporan bulanan ke orang tua", true],
          ["Tryout TKA + pembahasan", false],
          ["Konsultasi pilih SMA", false],
        ],
      },
      {
        name: "Persiapan TKA SMP",
        desc: "Program terarah untuk TKA dan seleksi masuk SMA favorit.",
        meta: "Tatap muka di cabang · Kelas 9 SMP",
        cta: "Pilih Paket Persiapan TKA",
        features: [
          ["Semua isi paket Reguler SMP", true],
          ["Tes penempatan gratis", true],
          ["Modul TKA bertahap", true],
          ["Tryout TKA rutin + pembahasan", true],
          ["Ikut Tryout Bersama Rumbasha", true],
          ["Laporan mingguan ke orang tua", true],
          ["Konsultasi pilih SMA & jalur SPMB", true],
        ],
      },
      {
        name: "Privat SMP",
        desc: "Belajar 1-on-1, bisa fokus ke ujian sekolah atau persiapan TKA.",
        meta: "Tatap muka 1-on-1 · Kelas 7–9 SMP",
        cta: "Pilih Paket Privat SMP",
        features: [
          ["Belajar 1-on-1 dengan pengajar", true],
          ["Jadwal fleksibel", true],
          ["Target belajar personal", true],
          ["Fokus ujian sekolah atau TKA", true],
          ["Laporan setiap pertemuan", true],
          ["Prioritas respons admin", true],
        ],
      },
    ],
    compare: [
      { label: "Jenjang", values: ["Kelas 7–9", "Kelas 9", "Kelas 7–9"] },
      { label: "Format kelas", values: ["Kelompok kecil", "Kelompok kecil", "1-on-1"] },
      { label: "Pengajar tetap", values: [true, true, true] },
      { label: "Persiapan ujian sekolah", values: [true, true, true] },
      { label: "Tryout TKA + pembahasan", values: [false, true, true] },
      { label: "Konsultasi pilih SMA & SPMB", values: [false, true, true] },
      { label: "Laporan ke orang tua", values: ["Bulanan", "Mingguan", "Tiap pertemuan"] },
      { label: "Jadwal", values: ["Tetap", "Tetap", "Fleksibel"] },
    ],
  },
  {
    id: "sma",
    tab: "SMA",
    eyebrow: "Paket bimbel SMA",
    title: "Paket belajar SMA & persiapan PTN",
    desc: "Jaga nilai rapor sejak kelas 10, lalu siapkan TKA dan seleksi masuk PTN. Lihat isi tiap paket, lalu tanyakan biaya dan jadwal ke admin.",
    note: NOTE_TATAP_MUKA,
    compareIntro: "Lihat perbedaan isi tiap paket SMA sebelum memilih.",
    pakets: [
      {
        name: "Reguler SMA",
        desc: "Pendampingan mapel sekolah dan tugas harian untuk murid SMA.",
        meta: "Tatap muka di cabang · Kelas 10–12 SMA",
        cta: "Pilih Paket Reguler SMA",
        features: [
          ["Mapel inti sesuai kurikulum", true],
          ["Bimbingan tugas sekolah", true],
          ["Persiapan ujian sekolah", true],
          ["Kelas kecil, pengajar tetap", true],
          ["Laporan bulanan ke orang tua", true],
          ["Tryout TKA & SNBT", false],
          ["Konsultasi jurusan & PTN", false],
        ],
      },
      {
        name: "Persiapan TKA & PTN",
        desc: "Program terarah untuk TKA, SNBT, dan seleksi masuk PTN.",
        meta: "Tatap muka di cabang · Kelas 12 SMA",
        cta: "Pilih Paket Persiapan PTN",
        features: [
          ["Semua isi paket Reguler SMA", true],
          ["Tes penempatan gratis", true],
          ["Modul TKA & SNBT bertahap", true],
          ["Tryout rutin + pembahasan", true],
          ["Ikut Tryout Bersama Rumbasha", true],
          ["Laporan mingguan ke orang tua", true],
          ["Konsultasi jurusan & PTN", true],
        ],
      },
      {
        name: "Privat SMA",
        desc: "Belajar 1-on-1, bisa fokus ke mapel tertentu atau persiapan PTN.",
        meta: "Tatap muka 1-on-1 · Kelas 10–12 SMA",
        cta: "Pilih Paket Privat SMA",
        features: [
          ["Belajar 1-on-1 dengan pengajar", true],
          ["Jadwal fleksibel", true],
          ["Target belajar personal", true],
          ["Fokus mapel atau persiapan PTN", true],
          ["Laporan setiap pertemuan", true],
          ["Prioritas respons admin", true],
        ],
      },
    ],
    compare: [
      { label: "Jenjang", values: ["Kelas 10–12", "Kelas 12", "Kelas 10–12"] },
      { label: "Format kelas", values: ["Kelompok kecil", "Kelompok kecil", "1-on-1"] },
      { label: "Pengajar tetap", values: [true, true, true] },
      { label: "Persiapan ujian sekolah", values: [true, true, true] },
      { label: "Tryout TKA & SNBT", values: [false, true, true] },
      { label: "Konsultasi jurusan & PTN", values: [false, true, true] },
      { label: "Laporan ke orang tua", values: ["Bulanan", "Mingguan", "Tiap pertemuan"] },
      { label: "Jadwal", values: ["Tetap", "Tetap", "Fleksibel"] },
    ],
  },
  {
    id: "elearning",
    tab: "E-Learning",
    eyebrow: "Paket langganan E-Learning",
    title: "Belajar fleksibel lewat E-Learning Rumbasha",
    desc: "Akses modul, Daily Quiz, dan tryout dari aplikasi kapan saja. Lihat isi tiap paket di bawah, lalu coba trial E-Learning gratis sebelum berlangganan.",
    note: "Harga per bulan untuk satu murid, sudah termasuk akses web & aplikasi. Promo yang berlaku akan dikonfirmasi admin. Trial E-Learning gratis tanpa perlu bayar di awal.",
    compareIntro: "Lihat perbedaan isi tiap paket E-Learning sebelum memilih.",
    pakets: [
      {
        name: "Basic",
        desc: "Belajar mandiri lewat aplikasi dengan modul dan latihan harian.",
        meta: "Akses web & aplikasi · SD, SMP, SMA",
        price: "Rp49.000",
        cta: "Pilih Paket Basic",
        features: [
          ["Modul pembelajaran mapel inti", true],
          ["Daily Quiz setiap hari", true],
          ["Report Quiz & grafik nilai", true],
          ["Akses web & aplikasi mobile", true],
          ["Laporan bulanan ke orang tua", true],
          ["Uji Kompetensi & Tryout online", false],
          ["Konsultasi dengan pengajar", false],
        ],
      },
      {
        name: "Plus",
        desc: "Paling pas untuk persiapan ujian sekolah dan seleksi masuk jenjang berikutnya.",
        meta: "Akses web & aplikasi · SD, SMP, SMA",
        price: "Rp99.000",
        cta: "Pilih Paket Plus",
        features: [
          ["Semua isi paket Basic", true],
          ["Modul semua mata pelajaran", true],
          ["Uji Kompetensi online", true],
          ["Tryout bulanan + pembahasan", true],
          ["Ikut Tryout Bersama Rumbasha", true],
          ["Laporan mingguan ke orang tua", true],
          ["Konsultasi pengajar 1x sebulan", true],
        ],
      },
      {
        name: "Premium",
        desc: "Pendampingan paling lengkap dengan konsultasi rutin bersama pengajar.",
        meta: "Akses web & aplikasi · SD, SMP, SMA",
        price: "Rp199.000",
        cta: "Pilih Paket Premium",
        features: [
          ["Semua isi paket Plus", true],
          ["Daily Quiz tanpa batas", true],
          ["Konsultasi pengajar 4x sebulan", true],
          ["Rencana belajar personal", true],
          ["Konsultasi pilih sekolah & jalur masuk", true],
          ["Prioritas respons admin", true],
        ],
      },
    ],
    compare: [
      { label: "Mata pelajaran", values: ["Mapel inti", "Semua mapel", "Semua mapel"] },
      { label: "Daily Quiz", values: ["1 set / hari", "1 set / hari", "Tanpa batas"] },
      { label: "Modul pembelajaran", values: [true, true, true] },
      { label: "Report Quiz & grafik nilai", values: [true, true, true] },
      { label: "Tryout bulanan + pembahasan", values: [false, true, true] },
      { label: "Uji Kompetensi online", values: [false, true, true] },
      { label: "Laporan ke orang tua", values: ["Bulanan", "Mingguan", "Mingguan"] },
      { label: "Konsultasi dengan pengajar", values: ["—", "1x / bulan", "4x / bulan"] },
    ],
  },
];

export const caraBergabung = [
  { title: "Pilih jenjang & paket", body: "Tentukan jenjang dan paket yang sesuai. Admin siap bantu lewat WhatsApp." },
  { title: "Ikut kelas trial gratis", body: "Rasakan cara belajar di Rumbasha dulu sebelum mendaftar." },
  { title: "Daftar & mulai belajar", body: "Admin mengirim rincian biaya, jadwal, dan cabang. Murid langsung masuk kelas." },
];

export const biayaFaqs = [
  {
    q: "Bisakah pindah paket di tengah periode belajar?",
    a: "Bisa. Paket baru berlaku mulai periode berikutnya, dan admin akan membantu penyesuaian jadwalnya.",
  },
  // (lanjutan) — jawaban berikut belum ada di desain
  { q: "Apakah biaya bisa dicicil?", a: "Bisa. Paket semesteran dan tahunan dapat dibayar bertahap setiap bulan sesuai kesepakatan dengan admin." },
  { q: "Apa saja metode pembayaran yang tersedia?", a: "Transfer bank, virtual account, dan e-wallet. Rincian rekening dikirim admin bersama tagihan." },
  { q: "Apakah ada kelas trial sebelum mendaftar?", a: "Ada. Calon murid bisa ikut kelas trial gratis dan tes penempatan sebelum memilih paket." },
  { q: "Berapa jumlah murid dalam satu kelas?", a: "Kelas kelompok maksimal 15 murid supaya pengajar tetap bisa memperhatikan tiap anak." },
  {
    q: "Kenapa biaya paket tidak dicantumkan di sini?",
    a: "Biaya tatap muka menyesuaikan cabang, jadwal, dan jumlah pertemuan, jadi admin akan mengirim rincian yang paling sesuai setelah Anda memilih paket.",
  },
];
