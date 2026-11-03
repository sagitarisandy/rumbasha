// Minimal PDF writer (text only, Helvetica, A4) so "Unduh PDF" returns a real file without a dependency.

export type Line = { text: string; size?: number; bold?: boolean; color?: [number, number, number]; gap?: number };

const WIN_ANSI: Record<string, number> = { "–": 0x96, "—": 0x97, "…": 0x85, "“": 0x93, "”": 0x94, "‘": 0x91, "’": 0x92, "•": 0x95, "›": 0x9b, "−": 0x2d };

function encode(text: string) {
  const bytes: number[] = [];
  for (const ch of text) {
    const code = WIN_ANSI[ch] ?? ch.charCodeAt(0);
    const b = code > 255 ? 0x3f : code;
    if (b === 0x28 || b === 0x29 || b === 0x5c) bytes.push(0x5c);
    bytes.push(b);
  }
  return Buffer.from(bytes).toString("latin1");
}

function wrap(text: string, size: number, width: number) {
  const max = Math.floor(width / (size * 0.5));
  const out: string[] = [];
  let cur = "";
  for (const word of text.split(" ")) {
    if ((cur + " " + word).trim().length > max) {
      out.push(cur);
      cur = word;
    } else cur = (cur + " " + word).trim();
  }
  if (cur) out.push(cur);
  return out;
}

export function buildPdf(title: string, pages: Line[][]) {
  const W = 595;
  const H = 842;
  const M = 56;
  const objects: string[] = [];
  const add = (body: string) => objects.push(body) - 1 + 1; // 1-based object number
  add("<< /Type /Catalog /Pages 2 0 R >>");
  add("PAGES_PLACEHOLDER");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const kids: number[] = [];
  pages.forEach((lines, i) => {
    let y = H - M;
    const ops: string[] = [];
    for (const l of lines) {
      const size = l.size ?? 11;
      const [r, g, b] = l.color ?? [0.055, 0.067, 0.408];
      for (const piece of wrap(l.text, size, W - 2 * M)) {
        y -= size * 1.45;
        ops.push(`BT /${l.bold ? "F2" : "F1"} ${size} Tf ${r} ${g} ${b} rg ${M} ${y.toFixed(1)} Td (${encode(piece)}) Tj ET`);
      }
      y -= l.gap ?? 4;
    }
    ops.push(`BT /F1 9 Tf 0.42 0.43 0.58 rg ${M} 32 Td (${encode(`${title} · Rumbasha Learning Center`)}) Tj ET`);
    ops.push(`BT /F1 9 Tf 0.42 0.43 0.58 rg ${W - M - 40} 32 Td (${encode(`${i + 1} / ${pages.length}`)}) Tj ET`);
    ops.push(`0.89 0.9 0.94 RG 1 w ${M} 48 m ${W - M} 48 l S`);
    const stream = ops.join("\n");
    const contentNo = add(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
    kids.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentNo} 0 R >>`));
  });
  objects[1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`;

  let out = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(out, "latin1"));
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out, "latin1");
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info << /Title (${encode(title)}) /Producer (Rumbasha) >> >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(out, "latin1");
}
