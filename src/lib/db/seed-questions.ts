// Bank soal for the preview: Matematika is generated (so every bab and level has enough soal),
// the other mapel use hand-written soal.
import type { Jenjang } from "./schema";

export type SeedQuestion = {
  subject: string;
  bidang: string;
  bab: string;
  jenjang: Jenjang;
  grade: number;
  level: "Mudah" | "Sedang" | "Sulit";
  type: "pg" | "isian";
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  tag?: string;
};

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rand = ReturnType<typeof rng>;
const int = (r: Rand, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);
const frac = (n: number, d: number) => {
  const g = gcd(n, d);
  const [nn, dd] = [n / g, d / g];
  return dd === 1 ? `${nn}` : `\\f{${nn}}{${dd}}`;
};
const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");
const signed = (n: number, v: string) => (n === 0 ? "" : `${n < 0 ? " - " : " + "}${Math.abs(n) === 1 ? "" : Math.abs(n)}${v}`);

/** Five options with the right one at a random spot; returns [options, answerIndex]. */
function pick(r: Rand, correct: string, wrong: string[]): [string[], string] {
  const pool = [...new Set(wrong.filter((w) => w !== correct))].slice(0, 4);
  let filler = 1;
  while (pool.length < 4) pool.push(`${correct} ${"'".repeat(filler++)}`);
  const at = int(r, 0, 4);
  const opts = [...pool];
  opts.splice(at, 0, correct);
  return [opts, String(at)];
}

const LEVELS = ["Mudah", "Sedang", "Sulit"] as const;

function mathQuestions(r: Rand): SeedQuestion[] {
  const out: SeedQuestion[] = [];
  const base = { subject: "Matematika", jenjang: "SMP" as Jenjang, type: "pg" as const };

  for (let i = 0; i < 12; i++) {
    const level = LEVELS[i % 3];
    const b = int(r, 2, level === "Mudah" ? 6 : 9);
    let d = int(r, 2, level === "Mudah" ? 6 : 9);
    if (d === b) d = b + 1;
    const a = int(r, 1, b - 1);
    const c = int(r, 1, d - 1);
    const L = lcm(b, d);
    const n = a * (L / b) + c * (L / d);
    const right = `$${frac(n, L)}$`;
    const [options, answer] = pick(r, right, [`$${frac(a + c, b + d)}$`, `$${frac(a * c, b * d)}$`, `$${frac(n + 1, L)}$`, `$${frac(n, b * d + 1)}$`]);
    const story = level === "Sulit";
    out.push({
      ...base, bidang: "Bilangan", bab: "Pecahan", grade: 7, level, options, answer,
      prompt: story
        ? `Ibu memakai $${frac(a, b)}$ kg tepung untuk kue dan $${frac(c, d)}$ kg untuk roti. Berapa kg tepung yang dipakai seluruhnya?`
        : `Hasil dari $\\f{${a}}{${b}} + \\f{${c}}{${d}}$ adalah …`,
      explanation: `Samakan penyebut dulu. KPK dari ${b} dan ${d} adalah ${L}, jadi $\\f{${a}}{${b}} = \\f{${a * (L / b)}}{${L}}$ dan $\\f{${c}}{${d}} = \\f{${c * (L / d)}}{${L}}$. Jumlahnya $\\f{${n}}{${L}}$${gcd(n, L) > 1 ? `, disederhanakan menjadi ${right}` : ""}.`,
    });
  }

  for (let i = 0; i < 10; i++) {
    const level = LEVELS[i % 3];
    const p = int(r, 2, 5);
    let q = int(r, 3, 8);
    if (q === p) q++;
    const unit = int(r, 2, 9) * 5000;
    const total = q * unit;
    const right = rp(p * unit);
    const [options, answer] = pick(r, right, [rp(q * unit - p * unit), rp((p + 1) * unit), rp(p * unit + 5000), rp(total)]);
    out.push({
      ...base, bidang: "Bilangan", bab: "Perbandingan", grade: 7, level, options, answer,
      prompt: `Perbandingan uang Andi dan Budi adalah $${p} : ${q}$. Jika uang Budi ${rp(total)}, uang Andi adalah …`,
      explanation: `Satu bagian = ${rp(total)} : ${q} = ${rp(unit)}. Uang Andi = ${p} bagian = ${right}.`,
    });
  }

  for (let i = 0; i < 12; i++) {
    const level = LEVELS[i % 3];
    const [a, b, c, d, e, f] = [int(r, 2, 4), int(r, 2, 6), int(r, 1, 4), int(r, 2, 6), int(r, 1, 3), int(r, 1, 3)];
    const x = a * b - d * e;
    const y = -a * c - d * f;
    const fmt = (cx: number, cy: number) => {
      const xs = cx === 0 ? "" : `${cx === 1 ? "" : cx === -1 ? "-" : cx}x`;
      const ys = signed(cy, "y");
      return `$${(xs + ys).replace(/^ \+ /, "").replace(/^ - /, "-") || "0"}$`;
    };
    const right = fmt(x, y);
    const [options, answer] = pick(r, right, [fmt(x, -y), fmt(-x, y), fmt(a * b + d * e, y), fmt(x, -a * c + d * f)]);
    out.push({
      ...base, bidang: "Aljabar", bab: "Aljabar", grade: 7, level, options, answer,
      prompt: `Bentuk sederhana dari $${a}(${b}x - ${c}y) - ${d}(${e}x + ${f}y)$ adalah …`,
      explanation: `Kalikan masuk: $${a * b}x - ${a * c}y - ${d * e}x - ${d * f}y$. Kumpulkan suku sejenis: ${right}.`,
    });
  }

  for (let i = 0; i < 12; i++) {
    const level = LEVELS[i % 3];
    const a = int(r, 2, 6);
    const x = int(r, 2, 12);
    const b = int(r, 1, 15);
    const c = a * x + b;
    const right = `$x = ${x}$`;
    const [options, answer] = pick(r, right, [`$x = ${x + 1}$`, `$x = ${x - 1}$`, `$x = ${c - b}$`, `$x = ${x + 2}$`]);
    out.push({
      ...base, bidang: "Aljabar", bab: "Persamaan Linear", grade: 7, level, options, answer,
      prompt: level === "Sulit"
        ? `Harga ${a} buku ditambah ongkos kirim Rp${b}.000 adalah Rp${c}.000. Jika harga satu buku $x$ ribu rupiah, nilai $x$ adalah …`
        : `Nilai $x$ yang memenuhi $${a}x + ${b} = ${c}$ adalah …`,
      explanation: `Pindahkan ${b} ke ruas kanan: $${a}x = ${c - b}$. Bagi dengan ${a}: ${right}.`,
    });
  }

  for (let i = 0; i < 10; i++) {
    const level = LEVELS[i % 3];
    const p = int(r, 1, 6);
    let q = int(r, 1, 7);
    if (q === p) q++;
    const s = p + q;
    const m = p * q;
    const right = `$x = -${p}$ atau $x = -${q}$`;
    const [options, answer] = pick(r, right, [`$x = ${p}$ atau $x = ${q}$`, `$x = -${p}$ atau $x = ${q}$`, `$x = ${p}$ atau $x = -${q}$`, `$x = -${s}$ atau $x = -${m}$`]);
    out.push({
      ...base, bidang: "Aljabar", bab: "Persamaan Kuadrat", grade: 9, level, options, answer,
      prompt: `Akar-akar persamaan $x^2 + ${s}x + ${m} = 0$ adalah …`,
      explanation: `Cari dua bilangan yang dijumlah ${s} dan dikali ${m}, yaitu ${p} dan ${q}. Jadi $(x + ${p})(x + ${q}) = 0$, sehingga ${right}.`,
    });
  }

  for (let i = 0; i < 12; i++) {
    const level = LEVELS[i % 3];
    if (i % 2 === 0) {
      const rr = [7, 14, 21, 28, 35][int(r, 0, 4)];
      const area = (22 / 7) * rr * rr;
      const right = `${area.toLocaleString("id-ID")} cm²`;
      const [options, answer] = pick(r, right, [`${((22 / 7) * 2 * rr).toLocaleString("id-ID")} cm²`, `${(area / 2).toLocaleString("id-ID")} cm²`, `${(area * 2).toLocaleString("id-ID")} cm²`, `${(rr * rr * 3).toLocaleString("id-ID")} cm²`]);
      out.push({
        ...base, bidang: "Geometri", bab: "Bangun Datar", grade: 8, level, options, answer,
        prompt: `Luas lingkaran dengan jari-jari ${rr} cm adalah … (gunakan $\\pi = \\f{22}{7}$)`,
        explanation: `$L = \\pi r^2 = \\f{22}{7} \\times ${rr} \\times ${rr} = ${area}$ cm².`,
      });
    } else {
      const p = int(r, 6, 20);
      const l = int(r, 3, p - 1);
      const right = `${2 * (p + l)} cm`;
      const [options, answer] = pick(r, right, [`${p * l} cm`, `${p + l} cm`, `${2 * p + l} cm`, `${2 * (p + l) + 2} cm`]);
      out.push({
        ...base, bidang: "Geometri", bab: "Bangun Datar", grade: 7, level, options, answer,
        prompt: `Sebuah persegi panjang berukuran ${p} cm × ${l} cm. Kelilingnya adalah …`,
        explanation: `$K = 2(p + l) = 2(${p} + ${l}) = ${2 * (p + l)}$ cm.`,
      });
    }
  }

  const triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]];
  triples.forEach(([a, b, c], i) => {
    const right = `${c} cm`;
    const [options, answer] = pick(r, right, [`${a + b} cm`, `${c + 1} cm`, `${c - 1} cm`, `${b + 1} cm`]);
    out.push({
      ...base, bidang: "Geometri", bab: "Teorema Pythagoras", grade: 8, level: LEVELS[i % 3], options, answer,
      prompt: `Segitiga siku-siku memiliki sisi tegak ${a} cm dan ${b} cm. Panjang sisi miringnya adalah …`,
      explanation: `$c^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}$, jadi $c = \\sqrt{${c * c}} = ${c}$ cm.`,
    });
  });

  for (let i = 0; i < 9; i++) {
    const level = LEVELS[i % 3];
    const n = level === "Mudah" ? 5 : 6;
    const data = Array.from({ length: n }, () => int(r, 60, 95));
    const sum = data.reduce((s, x) => s + x, 0);
    const extra = n - (sum % n === 0 ? n : sum % n);
    data[0] += extra % n;
    const total = data.reduce((s, x) => s + x, 0);
    const mean = total / n;
    const right = `${mean}`;
    const [options, answer] = pick(r, right, [`${mean + 1}`, `${mean - 2}`, `${Math.max(...data)}`, `${[...data].sort((a, b) => a - b)[Math.floor(n / 2)]}`]);
    out.push({
      ...base, bidang: "Statistika", bab: "Statistika", grade: 8, level, options, answer,
      prompt: `Nilai ulangan ${n} siswa: ${data.join(", ")}. Rata-ratanya adalah …`,
      explanation: `Jumlah semua nilai ${total}, dibagi banyak data ${n}: $\\f{${total}}{${n}} = ${mean}$.`,
    });
  }
  return out;
}

const pg = (
  subject: string, bidang: string, bab: string, level: SeedQuestion["level"], prompt: string,
  options: string[], answer: number, explanation: string, grade = 8,
): SeedQuestion => ({ subject, bidang, bab, jenjang: "SMP", grade, level, type: "pg", prompt, options, answer: String(answer), explanation });

const WRITTEN: SeedQuestion[] = [
  pg("IPA", "Fisika", "Gaya dan Hukum Newton", "Mudah", "Benda yang diam akan tetap diam jika resultan gaya padanya nol. Pernyataan ini adalah …", ["Hukum Newton I", "Hukum Newton II", "Hukum Newton III", "Hukum Archimedes", "Hukum Pascal"], 0, "Hukum Newton I (hukum kelembaman): benda mempertahankan keadaannya jika resultan gaya nol."),
  pg("IPA", "Fisika", "Gaya dan Hukum Newton", "Sedang", "Sebuah troli bermassa 4 kg didorong dengan gaya 20 N. Percepatannya adalah …", ["5 m/s²", "80 m/s²", "16 m/s²", "0,2 m/s²", "24 m/s²"], 0, "$a = \\f{F}{m} = \\f{20}{4} = 5$ m/s²."),
  pg("IPA", "Fisika", "Gaya dan Hukum Newton", "Sedang", "Saat kita mendayung, air terdorong ke belakang dan perahu bergerak maju. Ini contoh …", ["Hukum Newton III", "Hukum Newton I", "Hukum Newton II", "Gaya gesek", "Gaya pegas"], 0, "Aksi (dayung mendorong air) memunculkan reaksi (air mendorong perahu) yang sama besar dan berlawanan arah."),
  pg("IPA", "Fisika", "Gaya dan Hukum Newton", "Sulit", "Gaya 30 N bekerja ke kanan dan 12 N ke kiri pada balok 6 kg. Percepatan balok adalah …", ["3 m/s² ke kanan", "7 m/s² ke kanan", "2 m/s² ke kiri", "3 m/s² ke kiri", "5 m/s² ke kanan"], 0, "Resultan $30 - 12 = 18$ N ke kanan, $a = \\f{18}{6} = 3$ m/s² ke kanan."),
  pg("IPA", "Fisika", "Gaya dan Hukum Newton", "Mudah", "Satuan gaya dalam SI adalah …", ["newton", "joule", "watt", "pascal", "kilogram"], 0, "Gaya diukur dalam newton (N)."),
  pg("IPA", "Fisika", "Gerak Lurus", "Mudah", "Mobil menempuh 120 km dalam 2 jam dengan kecepatan tetap. Kecepatannya adalah …", ["60 km/jam", "240 km/jam", "30 km/jam", "120 km/jam", "40 km/jam"], 0, "$v = \\f{s}{t} = \\f{120}{2} = 60$ km/jam."),
  pg("IPA", "Fisika", "Gerak Lurus", "Sedang", "Gerak benda jatuh bebas termasuk …", ["GLBB dipercepat", "GLB", "GLBB diperlambat", "gerak melingkar", "gerak parabola"], 0, "Kecepatan benda jatuh bertambah karena percepatan gravitasi."),
  pg("IPA", "Fisika", "Listrik", "Sedang", "Hambatan 6 Ω dialiri arus 2 A. Tegangannya adalah …", ["12 V", "3 V", "8 V", "4 V", "0,33 V"], 0, "$V = I \\times R = 2 \\times 6 = 12$ V."),
  pg("IPA", "Kimia", "Zat dan Wujudnya", "Mudah", "Perubahan wujud dari padat menjadi gas disebut …", ["menyublim", "mencair", "membeku", "menguap", "mengembun"], 0, "Padat langsung ke gas disebut menyublim, contohnya kapur barus."),
  pg("IPA", "Kimia", "Zat dan Wujudnya", "Mudah", "Embun di pagi hari terjadi karena peristiwa …", ["mengembun", "menguap", "membeku", "menyublim", "mencair"], 0, "Uap air mendingin menjadi titik air (gas → cair)."),
  pg("IPA", "Kimia", "Zat dan Wujudnya", "Sedang", "Benda bermassa 200 g dengan volume 50 cm³ memiliki massa jenis …", ["4 g/cm³", "250 g/cm³", "0,25 g/cm³", "150 g/cm³", "10 g/cm³"], 0, "$\\rho = \\f{m}{V} = \\f{200}{50} = 4$ g/cm³."),
  pg("IPA", "Kimia", "Zat dan Wujudnya", "Sedang", "Partikel zat padat memiliki ciri …", ["susunan rapat dan teratur", "bergerak sangat bebas", "jarak antarpartikel sangat jauh", "bentuk mengikuti wadah", "mudah dimampatkan"], 0, "Partikel zat padat tersusun rapat, teratur, dan hanya bergetar di tempat."),
  pg("IPA", "Kimia", "Zat dan Wujudnya", "Sulit", "Es batu 50 g dibiarkan mencair seluruhnya. Massa air yang terbentuk adalah …", ["50 g", "lebih dari 50 g", "kurang dari 50 g", "0 g", "tergantung suhu ruang"], 0, "Perubahan wujud tidak mengubah massa zat."),
  pg("IPA", "Biologi", "Sistem Pencernaan", "Mudah", "Enzim di mulut yang mengubah amilum menjadi maltosa adalah …", ["ptialin", "pepsin", "renin", "lipase", "tripsin"], 0, "Ptialin (amilase ludah) memecah amilum menjadi maltosa."),
  pg("IPA", "Biologi", "Sistem Pencernaan", "Sedang", "Penyerapan sari makanan terutama terjadi di …", ["usus halus", "lambung", "kerongkongan", "usus besar", "mulut"], 0, "Vili di usus halus memperluas bidang penyerapan."),
  pg("IPA", "Biologi", "Sel dan Jaringan", "Mudah", "Bagian sel yang mengatur seluruh kegiatan sel adalah …", ["inti sel", "membran sel", "sitoplasma", "dinding sel", "vakuola"], 0, "Inti sel (nukleus) berisi materi genetik dan mengatur kegiatan sel."),
  pg("B. Indonesia", "Teks", "Teks Narasi", "Mudah", "Bagian teks narasi yang memperkenalkan tokoh dan latar disebut …", ["orientasi", "komplikasi", "resolusi", "koda", "evaluasi"], 0, "Orientasi berisi pengenalan tokoh, latar waktu, dan tempat."),
  pg("B. Indonesia", "Teks", "Teks Narasi", "Sedang", "Bagian cerita saat masalah mulai muncul dan memuncak disebut …", ["komplikasi", "orientasi", "resolusi", "koda", "abstrak"], 0, "Komplikasi memuat konflik yang memuncak."),
  pg("B. Indonesia", "Teks", "Teks Narasi", "Sedang", "Kata yang paling banyak dipakai untuk urutan waktu dalam narasi adalah …", ["kemudian, lalu, setelah itu", "karena, sebab, akibat", "tetapi, namun, sedangkan", "jika, apabila, seandainya", "dan, serta, juga"], 0, "Konjungsi temporal menunjukkan urutan peristiwa."),
  pg("B. Indonesia", "Teks", "Teks Eksposisi", "Mudah", "Teks eksposisi bertujuan untuk …", ["menjelaskan pendapat disertai fakta", "menghibur pembaca", "menceritakan pengalaman", "melukiskan objek", "memberi petunjuk langkah"], 0, "Eksposisi memaparkan gagasan dengan argumen dan fakta."),
  pg("B. Indonesia", "Kebahasaan", "Kalimat Efektif", "Sedang", "Kalimat yang efektif adalah …", ["Para siswa mengikuti upacara.", "Para siswa-siswa mengikuti upacara.", "Para siswa mereka mengikuti upacara.", "Siswa-siswa para mengikuti upacara.", "Para para siswa mengikuti upacara."], 0, "\"Para\" sudah bermakna jamak, jadi tidak perlu kata ulang."),
  pg("B. Indonesia", "Kebahasaan", "Kalimat Efektif", "Mudah", "Penulisan kata baku yang benar adalah …", ["apotek", "apotik", "apothek", "apoteik", "apotec"], 0, "Bentuk baku menurut KBBI adalah \"apotek\"."),
  pg("B. Inggris", "Grammar", "Simple Present Tense", "Mudah", "She ___ to school by bus every day.", ["goes", "go", "going", "went", "gone"], 0, "Subject \"she\" (orang ketiga tunggal) memakai verb + s/es."),
  pg("B. Inggris", "Grammar", "Simple Present Tense", "Mudah", "They ___ football on Sundays.", ["play", "plays", "playing", "played", "is play"], 0, "Subject jamak memakai verb bentuk dasar."),
  pg("B. Inggris", "Grammar", "Simple Present Tense", "Sedang", "___ your brother like durian?", ["Does", "Do", "Is", "Are", "Did"], 0, "\"Your brother\" orang ketiga tunggal, jadi pakai \"does\"."),
  pg("B. Inggris", "Grammar", "Simple Past Tense", "Sedang", "Yesterday I ___ my grandmother.", ["visited", "visit", "visits", "visiting", "am visiting"], 0, "Keterangan waktu lampau memakai verb 2."),
  pg("B. Inggris", "Reading", "Descriptive Text", "Mudah", "The purpose of a descriptive text is to …", ["describe a particular person, place, or thing", "tell past events", "persuade readers", "explain how to make something", "report news"], 0, "Descriptive text menggambarkan ciri suatu objek tertentu."),
  pg("B. Inggris", "Reading", "Descriptive Text", "Sedang", "\"My cat has soft white fur and blue eyes.\" This sentence is part of …", ["description", "identification", "orientation", "resolution", "conclusion"], 0, "Kalimat yang merinci ciri objek termasuk bagian description."),
  pg("IPS", "Geografi", "Peta dan Letak Indonesia", "Mudah", "Secara astronomis Indonesia terletak di antara …", ["6° LU – 11° LS dan 95° BT – 141° BT", "6° LS – 11° LU dan 95° BB – 141° BB", "11° LU – 6° LS dan 141° BT – 95° BB", "0° – 11° LS", "95° BT – 141° BT saja"], 0, "Letak astronomis Indonesia: 6° LU–11° LS dan 95° BT–141° BT."),
  pg("IPS", "Geografi", "Peta dan Letak Indonesia", "Sedang", "Akibat letak Indonesia di sekitar garis khatulistiwa adalah …", ["beriklim tropis", "memiliki empat musim", "bersalju sepanjang tahun", "siang dan malam sangat berbeda panjang", "tidak ada hujan"], 0, "Daerah khatulistiwa menerima sinar matahari sepanjang tahun sehingga beriklim tropis."),
  pg("IPS", "Geografi", "Peta dan Letak Indonesia", "Mudah", "Komponen peta yang menunjukkan arah adalah …", ["mata angin", "legenda", "skala", "inset", "garis astronomis"], 0, "Mata angin (orientasi) menunjukkan arah utara."),
  pg("IPS", "Sejarah", "Kerajaan Hindu-Buddha", "Sedang", "Kerajaan Hindu tertua di Indonesia adalah …", ["Kutai", "Majapahit", "Sriwijaya", "Mataram Kuno", "Singasari"], 0, "Kutai di Kalimantan Timur dikenal lewat prasasti Yupa (abad ke-4)."),
  pg("IPS", "Ekonomi", "Kegiatan Ekonomi", "Mudah", "Kegiatan menyalurkan barang dari produsen ke konsumen disebut …", ["distribusi", "produksi", "konsumsi", "investasi", "promosi"], 0, "Distribusi menghubungkan produsen dan konsumen."),
];

/** RUMATH: quick mental-math, answered with a number keypad. */
function rumathQuestions(r: Rand): SeedQuestion[] {
  const out: SeedQuestion[] = [];
  const base = { subject: "Matematika", bidang: "Bilangan", jenjang: "SMP" as Jenjang, grade: 7, type: "isian" as const, options: [] as string[], tag: "RUMATH" };
  for (let i = 0; i < 6; i++) {
    const a = int(r, 12, 99);
    out.push({ ...base, bab: "Kali 11", level: "Mudah", prompt: `$${a} \\times 11 = …$`, answer: String(a * 11), explanation: `Tulis ${Math.floor(a / 10)} … ${a % 10}, lalu sisipkan jumlahnya ${Math.floor(a / 10) + (a % 10)}: hasilnya ${a * 11}.` });
  }
  for (let i = 0; i < 6; i++) {
    const t = int(r, 2, 11);
    const n = t * 10 + 5;
    out.push({ ...base, bab: "Kuadrat Berakhiran 5", level: "Sedang", prompt: `$${n}^2 = …$`, answer: String(n * n), explanation: `${t} × ${t + 1} = ${t * (t + 1)}, lalu tambahkan 25 di belakang: ${n * n}.` });
  }
  for (let i = 0; i < 6; i++) {
    const a = int(r, 4, 48) * 2;
    out.push({ ...base, bab: "Kali 25", level: "Sedang", prompt: `$${a} \\times 25 = …$`, answer: String(a * 25), explanation: `Kali 25 sama dengan kali 100 lalu bagi 4: ${a * 100} : 4 = ${a * 25}.` });
  }
  for (let i = 0; i < 6; i++) {
    const a = int(r, 3, 9);
    const b = int(r, 12, 99);
    out.push({ ...base, bab: "Kali 9", level: "Mudah", prompt: `$${b} \\times 9 = …$`, answer: String(b * 9), explanation: `${b} × 10 − ${b} = ${b * 10} − ${b} = ${b * 9}.` });
    void a;
  }
  for (let i = 0; i < 6; i++) {
    const a = int(r, 3, 40) * 10;
    const p = [10, 20, 25, 50, 75][int(r, 0, 4)];
    out.push({ ...base, bab: "Persen Cepat", level: "Sulit", prompt: `$${p}\\%$ dari ${a} = …`, answer: String((a * p) / 100), explanation: `${p}% = $\\f{${p}}{100}$, jadi ${a} × ${p} : 100 = ${(a * p) / 100}.` });
  }
  return out;
}

function sdQuestions(r: Rand): SeedQuestion[] {
  const out: SeedQuestion[] = [];
  for (let i = 0; i < 10; i++) {
    const level = LEVELS[i % 3];
    const a = int(r, 12, 99);
    const b = int(r, 3, 9);
    const right = String(a * b);
    const [options, answer] = pick(r, right, [String(a * b + b), String(a * (b - 1)), String(a + b), String(a * b - 10)]);
    out.push({ subject: "Matematika", bidang: "Bilangan", bab: "Pecahan", jenjang: "SD", grade: 5, level, type: "pg", options, answer, prompt: `Hasil dari $${a} \\times ${b}$ adalah …`, explanation: `${a} × ${b} = ${right}.` });
  }
  return out;
}

export function buildQuestions(): SeedQuestion[] {
  const r = rng(20261103);
  return [...mathQuestions(r), ...WRITTEN, ...rumathQuestions(r), ...sdQuestions(r)];
}
