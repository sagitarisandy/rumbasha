// RUMATH (Rumbasha Math): mental-arithmetic practice. Soal are generated per jenis + level.

export const RUMATH_JENIS = [
  { name: "Penjumlahan", symbol: "+" },
  { name: "Pengurangan", symbol: "−" },
  { name: "Perkalian", symbol: "×" },
  { name: "Pembagian", symbol: "÷" },
  { name: "Soal cerita", symbol: "?" },
] as const;
export type RumathJenis = (typeof RUMATH_JENIS)[number]["name"];

export const RUMATH_LEVELS = [
  { level: 1, range: "1–10", max: 10 },
  { level: 2, range: "10–100", max: 100 },
  { level: 3, range: "100–1.000", max: 1000 },
] as const;

export const RUMATH_QUESTIONS = 10;
export const RUMATH_MINUTES = 15;
export const RUMATH_COIN = 50;

export type GeneratedSoal = { prompt: string; answer: string; explanation: string; hint: string };

const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

const NAMES = ["Rara", "Bima", "Dinda", "Fajar", "Sinta", "Raka"];
const THINGS = ["kelereng", "buku", "permen", "stiker", "pensil"];

export function rumathSoal(jenis: RumathJenis, level: number, r: () => number = Math.random): GeneratedSoal {
  const max = RUMATH_LEVELS[Math.max(0, Math.min(2, level - 1))].max;
  const lo = level === 1 ? 1 : Math.ceil(max / 10);
  switch (jenis) {
    case "Penjumlahan": {
      const a = int(r, lo, max - 1);
      const b = int(r, lo, max - 1);
      return { prompt: `$${a} + ${b} = ?$`, answer: String(a + b), hint: `Hitung satuannya dulu: ${a % 10} + ${b % 10}.`, explanation: `Jumlahkan per nilai tempat, simpan puluhan kalau lebih dari 9: ${a} + ${b} = ${a + b}.` };
    }
    case "Pengurangan": {
      const a = int(r, lo + 1, max);
      const b = int(r, lo, a);
      return { prompt: `$${a} - ${b} = ?$`, answer: String(a - b), hint: `Kalau satuannya kurang, pinjam 1 puluhan.`, explanation: `${a} − ${b} = ${a - b}. Cek dengan penjumlahan: ${a - b} + ${b} = ${a}.` };
    }
    case "Perkalian": {
      const a = int(r, 2, level === 1 ? 10 : level === 2 ? 25 : 99);
      const b = int(r, 2, level === 3 ? 12 : 10);
      return { prompt: `$${a} \\times ${b} = ?$`, answer: String(a * b), hint: b === 9 ? `Kali 10 lalu kurangi ${a}.` : `Pecah ${a} jadi puluhan dan satuan.`, explanation: `${a} × ${b} = ${a * b}.` };
    }
    case "Pembagian": {
      const b = int(r, 2, level === 1 ? 5 : 12);
      const q = int(r, 2, level === 1 ? 10 : level === 2 ? 20 : 80);
      return { prompt: `$${b * q} \\div ${b} = ?$`, answer: String(q), hint: `Bilangan berapa dikali ${b} hasilnya ${b * q}?`, explanation: `${b} × ${q} = ${b * q}, jadi ${b * q} ÷ ${b} = ${q}.` };
    }
    default: {
      const n = NAMES[int(r, 0, NAMES.length - 1)];
      const t = THINGS[int(r, 0, THINGS.length - 1)];
      const a = int(r, lo + 2, max);
      const b = int(r, 1, Math.max(2, Math.floor(a / 2)));
      return { prompt: `${n} punya ${a} ${t}, lalu memberi ${b} ${t} ke temannya. Sisa ${t} ${n}?`, answer: String(a - b), hint: "Memberi berarti berkurang.", explanation: `${a} − ${b} = ${a - b} ${t}.` };
    }
  }
}

/** Video lessons per jenis (title, minutes:seconds). */
export const RUMATH_VIDEOS: Record<RumathJenis, [string, number, string][]> = {
  Penjumlahan: [
    ["Mengenal nilai tempat", 310, "Satuan, puluhan, ratusan: dasar semua hitungan cepat."],
    ["Penjumlahan bersusun", 504, "Menjumlahkan dua angka puluhan dengan menyimpan dari satuan ke puluhan."],
    ["Menyimpan angka", 432, "Kapan dan bagaimana menyimpan angka saat menjumlah."],
    ["Latihan cepat tanpa menyimpan", 390, "Pola penjumlahan yang bisa dihitung langsung di kepala."],
  ],
  Pengurangan: [
    ["Pengurangan tanpa meminjam", 284, "Kurangi per nilai tempat dari kanan."],
    ["Meminjam satu puluhan", 362, "Kalau satuan atas lebih kecil, pinjam 1 puluhan."],
    ["Pengurangan dari 100 dan 1.000", 298, "Trik melengkapi ke 9 dan 10."],
    ["Cek jawaban dengan penjumlahan", 240, "Cara memastikan hasil pengurangan benar."],
  ],
  Perkalian: [
    ["Trik kali 11 dalam 5 detik", 312, "Kalikan bilangan dua angka dengan 11 tanpa coret-coretan."],
    ["Kali 9 pakai pengurangan", 228, "Kali 10 dulu, lalu kurangi bilangannya sendiri."],
    ["Perkalian dengan 25", 254, "Ubah kali 25 menjadi kali 100 lalu bagi 4."],
  ],
  Pembagian: [
    ["Pembagian sebagai kebalikan perkalian", 276, "Cari bilangan yang dikali pembagi."],
    ["Pembagian bersusun pendek", 344, "Bagi dari angka paling kiri."],
    ["Soal cerita pembagian", 318, "Membagi rata ke beberapa orang."],
  ],
  "Soal cerita": [
    ["Membaca soal cerita", 296, "Cari yang diketahui dan ditanya."],
    ["Kata kunci operasi hitung", 262, "Bertambah, berkurang, dibagi rata, dan seterusnya."],
    ["Soal cerita dua langkah", 386, "Selesaikan bertahap, tulis kalimat matematikanya."],
  ],
};
