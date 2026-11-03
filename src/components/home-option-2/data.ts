// Copy for Home Option 2. Texts come from the Penpot design; items marked "(lanjutan)" fill
// carousel slides / tabs / FAQ answers the design only sketched one state for.
import type { ProgramPalette } from "./icons";

export const programMenu = ["Pra SD", "SD", "SMP", "SMA"];

export const whatsappUrl = "https://wa.me/6281234567890";

export const navItems = [
  { label: "Program", href: "/#program", hasMenu: true },
  { label: "Fasilitas", href: "/#fasilitas" },
  { label: "Biaya", href: "/pricing" },
  { label: "Cabang", href: "/#kontak" },
  { label: "Alumni", href: "/alumni/rizky" },
  { label: "FAQ", href: "/#faq" },
];

export const jenjangColumns = [
  {
    icon: "clipboard",
    title: "FONDASI KUAT SEJAK KELAS 4 SD",
    body: "Rumbasha menguatkan dasar matematika, literasi, dan sains supaya nilai rapor naik dan anak siap melangkah ke SMP pilihannya.",
    cta: "LIHAT PROGRAM SD",
  },
  {
    icon: "graduation",
    title: "PERSIAPAN TKA DAN SELEKSI SMA FAVORIT",
    body: "Tes penempatan gratis menentukan titik mulai yang tepat. Murid SMP berlatih bertahap lewat modul, tryout TKA berkala, dan pembahasan soal sampai benar-benar paham.",
    cta: "LIHAT PROGRAM SMP",
  },
  {
    icon: "book",
    title: "KONSULTASI PILIH SMA DAN JALUR SPMB",
    body: "Konselor membantu memilih SMA dan jalur pendaftaran yang paling sesuai, lalu mendampingi orang tua sampai pengumuman hasil seleksi.",
    cta: "JADWALKAN KONSULTASI",
  },
] as const;

export const schoolLogos = [
  { name: "SMAN 2 Bogor", src: "/images/logos/sman-2-bogor.webp", w: 78 },
  { name: "SMAN 13 Bekasi", src: "/images/logos/sman-13-bekasi.webp", w: 72 },
  { name: "SMAN 1 Cikarang Utara", src: "/images/logos/sman-1-cikarang-utara.webp", w: 72 },
  { name: "SMAN 7 Bogor", src: "/images/logos/sman-7-bogor.webp", w: 68 },
  { name: "SMAN 8 Bogor", src: "/images/logos/sman-8-bogor.webp", w: 65 },
  { name: "SMA Korpri Bekasi", src: "/images/logos/sma-korpri-bekasi.webp", w: 72 },
  { name: "SMPN 44 Bekasi", src: "/images/logos/smpn-44-bekasi.webp", w: 72 },
  { name: "SD Negeri", src: "/images/logos/sd-negeri.webp", w: 72 },
  { name: "Al Azhar 8 Bekasi", src: "/images/logos/al-azhar-8-bekasi.webp", w: 72 },
];

export type Program = {
  id: string;
  tab: string;
  title: string;
  description: string;
  chips: string[];
  photo: { src: string; alt: string; width: number; height: number; className: string };
  palette: ProgramPalette;
  wash: string;
};

export const programs: Program[] = [
  {
    id: "sd",
    tab: "Pra SD & SD",
    title: "Kelas 4-5-6 SD",
    description:
      "Program khusus untuk meningkatkan kemampuan dasar literasi dan numerasi serta bimbingan tugas sekolah siswa secara tuntas, menyenangkan, dan memotivasi.",
    chips: ["Literasi dasar", "Numerasi", "Bimbingan tugas sekolah"],
    photo: {
      src: "/images/siswa-sd.webp",
      alt: "Siswa SD berseragam merah putih tersenyum",
      width: 298,
      height: 370,
      className: "right-[52px] -top-[10px] w-[298px]",
    },
    palette: { from: "#ff4f7b", mid: "#f2234f", to: "#d9143a", bubble: "#ff8fa8", bubbleSoft: "#ffc2cf", accent: "#ff6a8c" },
    wash: "rgb(176 11 44 / 0.16)",
  },
  {
    // (lanjutan) — copy dari board "Paket & Harga — Tab SMP"
    id: "smp",
    tab: "SMP",
    title: "Kelas 7-8-9 SMP",
    description:
      "Kuatkan nilai sekolah sejak kelas 7, lalu siapkan TKA dan seleksi masuk SMA favorit lewat modul bertahap, tryout berkala, dan pembahasan soal sampai paham.",
    chips: ["Kelas Reguler", "Persiapan TKA", "Kelas Privat 1-on-1"],
    photo: {
      src: "/images/aktivitas/r2-6.webp",
      alt: "Dua siswa SMP memegang map hasil tes",
      width: 520,
      height: 259,
      className: "-right-[40px] bottom-0 w-[520px]",
    },
    palette: { from: "#6f78ff", mid: "#4349d7", to: "#2b2fa8", bubble: "#9ea4ff", bubbleSoft: "#c9ccff", accent: "#7c83ff" },
    wash: "rgb(43 47 168 / 0.14)",
  },
  {
    // (lanjutan) — copy dari board "Paket & Harga — Tab SMA"
    id: "sma",
    tab: "SMA",
    title: "Kelas 10-11-12 SMA",
    description:
      "Jaga nilai rapor sejak kelas 10, lalu siapkan TKA dan seleksi masuk PTN bersama pengajar berpengalaman dan simulasi ujian yang rutin.",
    chips: ["Kelas Reguler", "Intensif PTN", "Kelas Privat 1-on-1"],
    photo: {
      src: "/images/aktivitas/r2-4.webp",
      alt: "Empat siswa SMA belajar bersama di depan laptop",
      width: 560,
      height: 279,
      className: "-right-[30px] bottom-0 w-[560px]",
    },
    palette: { from: "#ffb347", mid: "#f78433", to: "#e05f05", bubble: "#ffc58f", bubbleSoft: "#ffe1c2", accent: "#ff9d4d" },
    wash: "rgb(224 95 5 / 0.14)",
  },
];

export const keunggulanSlides = [
  {
    title: "RUMBASHA MEMBANGUN KEBIASAAN BELAJAR YANG KONSISTEN",
    body: "Latihan rutin sedikit demi sedikit membuat anak terbiasa belajar mandiri. Nilai di sekolah naik, dan peluang diterima di SMA favorit makin terbuka.",
    image: "/images/fasilitas-kelas.webp",
  },
  {
    // (lanjutan)
    title: "TES PENEMPATAN GRATIS UNTUK TITIK MULAI YANG TEPAT",
    body: "Setiap murid memulai dari level yang sesuai kemampuannya, jadi tidak ada yang tertinggal atau bosan karena materinya terlalu mudah.",
    image: "/images/aktivitas/r1-2.webp",
  },
  {
    // (lanjutan)
    title: "TRYOUT TKA BERKALA DENGAN PEMBAHASAN TUNTAS",
    body: "Simulasi ujian rutin melatih ketenangan dan kecepatan mengerjakan soal. Setiap soal dibahas sampai anak benar-benar paham.",
    image: "/images/aktivitas/r1-5.webp",
  },
  {
    // (lanjutan) — sesuai jawaban FAQ "Apa bedanya Rumbasha..."
    title: "LAPORAN PERKEMBANGAN RUTIN UNTUK ORANG TUA",
    body: "Perkembangan murid dilaporkan otomatis ke orang tua setiap minggu, sehingga orang tua tahu kapan anak perlu dukungan tambahan.",
    image: "/images/aktivitas/r2-3.webp",
  },
];

export const stats = [
  { icon: "graduation", value: 2130, format: "thousands", suffix: "", label: "Masuk SMA favorit 2026", highlight: true },
  { icon: "chart", value: 87, format: "plain", suffix: "%", label: "Diterima di pilihan pertama" },
  { icon: "alumni", value: 12, format: "plain", suffix: "rb+", label: "Alumni Rumbasha" },
  { icon: "location", value: 18, format: "plain", suffix: "", label: "Cabang di 6 kota" },
] as const;

export type Alumni = { name: string; school: string; branch: string; photo: string };

export const alumniRowOne: Alumni[] = [
  { name: "Abdi D.", school: "SMAN 1 Depok", branch: "Rumbasha Bandung", photo: "/images/alumni/abdi-d-1.webp" },
  { name: "Abdi D.", school: "SMAN 8 Bandung", branch: "Rumbasha Bandung", photo: "/images/alumni/abdi-d-2.webp" },
  { name: "Eryana L.", school: "SMAN 81 Jakarta", branch: "Rumbasha Jakarta", photo: "/images/alumni/eryana-l.webp" },
  { name: "Farrel H.", school: "SMAN 3 Bandung", branch: "Rumbasha Bandung", photo: "/images/alumni/farrel-h.webp" },
  { name: "Dominiko A.", school: "SMAN 70 Jakarta", branch: "Rumbasha Jakarta", photo: "/images/alumni/dominiko-a.webp" },
  { name: "Nisrina D.", school: "SMAN 24 Bandung", branch: "Rumbasha Bandung", photo: "/images/alumni/nisrina-d.webp" },
];

export const alumniRowTwo: Alumni[] = [
  { name: "Razka A.", school: "SMAN 68 Jakarta", branch: "Rumbasha Jakarta", photo: "/images/alumni/razka-a.webp" },
  { name: "Zamzama F.", school: "SMAN 3 Bandung", branch: "Rumbasha Bandung", photo: "/images/alumni/zamzama-f.webp" },
  { name: "Nada A.", school: "SMAN 8 Jakarta", branch: "Rumbasha Jakarta", photo: "/images/alumni/nada-a.webp" },
  { name: "Rian P.", school: "SMAN 5 Bandung", branch: "Rumbasha Bandung", photo: "/images/alumni/rian-p.webp" },
  { name: "Bunga P.", school: "SMAN 28 Jakarta", branch: "Rumbasha Jakarta", photo: "/images/alumni/bunga-p.webp" },
  { name: "Fathur Q.", school: "SMAN 2 Bandung", branch: "Rumbasha Bandung", photo: "/images/alumni/fathur-q.webp" },
];

export const videoStories = [
  { name: "Rizky", subtitle: "Kisah Sukses Murid Rumbasha", image: "/images/kisah-rizky.webp" },
  { name: "Dinda", subtitle: "Kisah Sukses Murid Rumbasha", image: "/images/kisah-dinda.webp" },
];

// Collage positions are the Penpot coordinates relative to the 1440×540 "Kolase foto" board.
export const aktivitasPhotos = [
  { src: "/images/aktivitas/r1-1.webp", x: -116, y: 30, w: 290, h: 196, rot: -4, row: 1 },
  { src: "/images/aktivitas/r1-2.webp", x: 205, y: 16, w: 300, h: 206, rot: 3, row: 1 },
  { src: "/images/fasilitas-kelas.webp", x: 556, y: 14, w: 340, h: 230, rot: -2, row: 1 },
  { src: "/images/aktivitas/r1-4.webp", x: 935, y: 22, w: 300, h: 206, rot: -3, row: 1 },
  { src: "/images/aktivitas/r1-5.webp", x: 1262, y: 38, w: 230, h: 230, rot: 4, row: 1, tint: true },
  { src: "/images/aktivitas/r2-1.webp", x: -74, y: 290, w: 236, h: 166, rot: -3, row: 2, tint: true },
  { src: "/images/aktivitas/r2-2.webp", x: 184, y: 304, w: 236, h: 166, rot: 3, row: 2 },
  { src: "/images/aktivitas/r2-3.webp", x: 442, y: 290, w: 236, h: 166, rot: -3, row: 2 },
  { src: "/images/aktivitas/r2-4.webp", x: 700, y: 304, w: 236, h: 166, rot: 3, row: 2, tint: true },
  { src: "/images/aktivitas/r2-5.webp", x: 958, y: 290, w: 236, h: 166, rot: -3, row: 2 },
  { src: "/images/aktivitas/r2-6.webp", x: 1216, y: 304, w: 236, h: 166, rot: 3, row: 2, tint: true },
];

export const appFeatures = [
  { icon: "books", title: "Modul pembelajaran", body: "Materi per bab, bisa diulang" },
  { icon: "bolt", title: "Daily Quiz", body: "Latihan singkat setiap hari" },
  { icon: "clipboard", title: "Uji Kom & Tryout", body: "Simulasi ujian secara online" },
  { icon: "trophy", title: "Peringkat & poin", body: "Pantau progres belajar murid" },
] as const;

export const faqs = [
  {
    q: "Apa bedanya Rumbasha dengan bimbel lain?",
    a: "Kelas kami maksimal 15 murid, ada klinik PR tanpa biaya tambahan, dan perkembangan murid dilaporkan otomatis ke orang tua setiap minggu.",
  },
  {
    q: "Berapa biaya belajar di Rumbasha?",
    // (lanjutan)
    a: "Biaya mengikuti jenjang dan jenis paket (Reguler, Persiapan TKA, atau Privat). Pilih jenjang di bagian Program, lalu tanyakan rincian biaya dan jadwal ke admin lewat WhatsApp.",
  },
  {
    q: "Apakah biaya bisa dicicil?",
    // (lanjutan)
    a: "Bisa. Paket semesteran dan tahunan dapat dibayar bertahap setiap bulan. Admin akan membantu menyusun jadwal cicilan saat pendaftaran.",
  },
  {
    q: "Apakah ada kelas uji coba sebelum mendaftar?",
    // (lanjutan)
    a: "Ada. Calon murid bisa ikut kelas trial gratis dan tes penempatan dulu, jadi orang tua bisa melihat cara belajarnya sebelum memutuskan.",
  },
  {
    q: "Untuk jenjang apa saja kelas tersedia?",
    // (lanjutan)
    a: "Kelas tersedia untuk Pra SD dan SD (kelas 4–6), SMP (kelas 7–9), serta SMA (kelas 10–12), termasuk persiapan TKA dan seleksi masuk SMA/PTN.",
  },
  {
    q: "Bagaimana latar belakang pengajar Rumbasha?",
    // (lanjutan)
    a: "Pengajar Rumbasha lulusan perguruan tinggi negeri dengan pengalaman mengajar minimal dua tahun, dan rutin mengikuti pelatihan metode belajar dari tim akademik.",
  },
];

export const footerColumns = [
  { title: "Program", links: ["Kelas Reguler", "Persiapan TKA SMP", "Kelas Privat", "Quiz Trial Gratis"] },
  { title: "Rumbasha", links: ["Tentang Kami", "Fasilitas", "Cabang & Lokasi", "Kisah Alumni"] },
  { title: "Bantuan", links: ["FAQ", "Hubungi Kami", "Syarat & Ketentuan", "Kebijakan Privasi"] },
];
