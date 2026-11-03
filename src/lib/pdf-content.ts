// Page content for the preview "PDF"s. Real tutor PDFs would be uploaded files; for the preview each
// materi gets deterministic pages (cover, explanation, worked example, practice, summary).
import { BAB_MOTIF } from "./catalog";

export type PdfBlock =
  | { kind: "label"; text: string }
  | { kind: "h"; text: string }
  | { kind: "p"; text: string }
  | { kind: "lines"; n: number }
  | { kind: "math"; text: string }
  | { kind: "note"; text: string }
  | { kind: "list"; items: string[] };

type Materi = { title: string; subject: string; bidang: string; bab: string; pages: number; summary: string | null; author: string | null };

const EXAMPLES: Record<string, string[]> = {
  Pecahan: ["$\\f{2}{3} + \\f{1}{4} = \\f{8}{12} + \\f{3}{12} = \\f{11}{12}$", "$\\f{a}{b} + \\f{c}{d} = \\f{ad + bc}{bd}$", "$\\f{5}{6} - \\f{1}{3} = \\f{5}{6} - \\f{2}{6} = \\f{1}{2}$"],
  Perbandingan: ["$\\f{a}{b} = \\f{c}{d} \\Rightarrow ad = bc$", "$3 : 5 = 12 : 20$"],
  Aljabar: ["$2(4x - 2y) - 5(2x + y) = -2x - 9y$", "$(x + 3)(x - 2) = x^2 + x - 6$"],
  "Persamaan Linear": ["$2x + 5 = 11 \\Rightarrow 2x = 6 \\Rightarrow x = 3$", "$3x - 4 = 2x + 1 \\Rightarrow x = 5$"],
  "Persamaan Kuadrat": ["$x^2 + 5x + 6 = (x + 2)(x + 3)$", "$x = \\f{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$"],
  "Bangun Datar": ["$L = \\pi r^2 = \\f{22}{7} \\times 7 \\times 7 = 154$", "$K = 2(p + l)$"],
  "Teorema Pythagoras": ["$c^2 = a^2 + b^2$", "$c = \\sqrt{6^2 + 8^2} = \\sqrt{100} = 10$"],
  Statistika: ["$\\bar{x} = \\f{\\Sigma x}{n}$", "$\\f{70 + 80 + 90}{3} = 80$"],
  "Gaya dan Hukum Newton": ["$\\Sigma F = m \\times a$", "$a = \\f{F}{m} = \\f{20}{4} = 5$ m/s²"],
  "Gerak Lurus": ["$v = \\f{s}{t}$", "$v_t = v_0 + at$"],
  Listrik: ["$V = I \\times R$", "$P = V \\times I$"],
  "Zat dan Wujudnya": ["$\\rho = \\f{m}{V}$", "$\\f{200}{50} = 4$ g/cm³"],
};

export function pdfPage(m: Materi, n: number): PdfBlock[] {
  const examples = EXAMPLES[m.bab] ?? (BAB_MOTIF[m.bab] ? [BAB_MOTIF[m.bab]] : []);
  const label = { kind: "label" as const, text: `${m.bab} · ${m.subject}`.toUpperCase() };
  if (n === 1) {
    return [
      label,
      { kind: "h", text: m.title },
      { kind: "p", text: m.summary ?? `Materi ${m.title.toLowerCase()} untuk siswa SMP.` },
      { kind: "list", items: ["Tujuan: memahami konsep dan menyelesaikan soal dasar sampai soal cerita.", `Jumlah halaman: ${m.pages}.`, `Disusun oleh ${m.author ?? "tim tutor Rumbasha"}.`] },
      { kind: "note", text: "Baca contoh soal dengan teliti, lalu coba latihan tanpa melihat pembahasan." },
    ];
  }
  if (n === m.pages) {
    return [
      label,
      { kind: "h", text: "Rangkuman" },
      { kind: "list", items: [`Pahami dulu konsep dasar ${m.bab.toLowerCase()}.`, "Tulis langkah satu per satu supaya mudah dicek.", "Cek kembali jawaban dengan cara lain bila sempat."] },
      ...(examples[0] ? [{ kind: "math" as const, text: examples[0] }] : []),
      { kind: "note", text: "Sudah paham? Lanjut kerjakan Daily Quiz untuk mengukur pemahamanmu." },
    ];
  }
  const sections = ["Pengertian", "Contoh soal", "Langkah penyelesaian", "Latihan mandiri"];
  const section = sections[(n - 2) % sections.length];
  const ex = examples[(n - 2) % Math.max(1, examples.length)];
  const blocks: PdfBlock[] = [label, { kind: "h", text: `${section}: ${m.title.toLowerCase()}` }, { kind: "lines", n: 4 }];
  if (ex) blocks.push({ kind: "math", text: ex });
  blocks.push({ kind: "lines", n: 3 });
  if (examples[1] && section !== "Latihan mandiri") blocks.push({ kind: "math", text: examples[(n - 1) % examples.length] });
  if (section === "Latihan mandiri") blocks.push({ kind: "list", items: ["Kerjakan soal 1–5 di buku latihan.", "Cocokkan jawaban dengan kunci di halaman terakhir."] });
  blocks.push({ kind: "note", text: section === "Contoh soal" ? `Ingat: ${m.bab === "Pecahan" ? "samakan penyebut dulu pakai KPK." : "tulis yang diketahui dan ditanya sebelum menghitung."}` : "Tandai bagian yang belum paham, lalu tanyakan ke tutor." });
  return blocks;
}

/** Plain-text version of a $…$ expression for the downloadable PDF. */
export function plainMath(s: string) {
  return s
    .replace(/\$/g, "")
    .replace(/\\f\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\\sqrt\{([^{}]*)\}/g, "akar($1)")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\pi/g, "pi")
    .replace(/\\Sigma/g, "Jumlah ")
    .replace(/\\pm/g, "±")
    .replace(/\\Rightarrow/g, "=>")
    .replace(/\\bar\{([^{}]*)\}/g, "rata-rata $1")
    .replace(/_(\w)/g, "$1")
    .replace(/\^(\w)/g, "^$1")
    .replace(/\\/g, "");
}
