import { Fragment, type ReactNode } from "react";

// Renders text with $…$ math segments, using the notation from the design system:
// \f{a}{b} stacked fraction, \sqrt{x}, \bar{x}, x^2 / x^{10}, v_0, \times ×, \div ÷, \pi π, \Sigma Σ, \pm ±, "-" → "−".
const SYMBOLS: Record<string, string> = {
  "\\times": "×", "\\div": "÷", "\\pi": "π", "\\Sigma": "Σ", "\\%": "%", "\\cdot": "·", "\\le": "≤", "\\ge": "≥", "\\pm": "±", "\\Rightarrow": "⇒",
};

function group(s: string, i: number): [string, number] {
  if (s[i] !== "{") return [s[i] ?? "", i + 1];
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === "{") depth++;
    else if (s[j] === "}" && --depth === 0) return [s.slice(i + 1, j), j + 1];
  }
  return [s.slice(i + 1), s.length];
}

function styled(text: string, key: string): ReactNode[] {
  // letters are variables (italic), everything else upright
  return text.split(/([A-Za-z]+)/).filter(Boolean).map((part, i) => (/^[A-Za-z]+$/.test(part) ? <i key={`${key}${i}`}>{part}</i> : <Fragment key={`${key}${i}`}>{part}</Fragment>));
}

function math(s: string, key = "m"): ReactNode[] {
  const out: ReactNode[] = [];
  let buf = "";
  let i = 0;
  const flush = () => {
    if (buf) out.push(...styled(buf, `${key}-${out.length}-`));
    buf = "";
  };
  while (i < s.length) {
    if (s.startsWith("\\f{", i)) {
      flush();
      const [a, j] = group(s, i + 2);
      const [b, k] = group(s, j);
      out.push(
        <span key={`${key}f${i}`} className="frac">
          <span>{math(a, `${key}a${i}`)}</span>
          <span>{math(b, `${key}b${i}`)}</span>
        </span>,
      );
      i = k;
      continue;
    }
    if (s.startsWith("\\bar{", i)) {
      flush();
      const [a, j] = group(s, i + 4);
      out.push(
        <span key={`${key}o${i}`} className="sqrt">
          {math(a, `${key}v${i}`)}
        </span>,
      );
      i = j;
      continue;
    }
    if (s.startsWith("\\sqrt{", i)) {
      flush();
      const [a, j] = group(s, i + 5);
      out.push(
        <Fragment key={`${key}s${i}`}>
          √<span className="sqrt">{math(a, `${key}r${i}`)}</span>
        </Fragment>,
      );
      i = j;
      continue;
    }
    const sym = Object.keys(SYMBOLS).find((c) => s.startsWith(c, i));
    if (sym) {
      buf += SYMBOLS[sym];
      i += sym.length;
      continue;
    }
    if (s[i] === "^" || s[i] === "_") {
      flush();
      const [a, j] = group(s, i + 1);
      const Tag = s[i] === "^" ? "sup" : "sub";
      out.push(<Tag key={`${key}p${i}`}>{math(a, `${key}q${i}`)}</Tag>);
      i = j;
      continue;
    }
    buf += s[i] === "-" ? "−" : s[i];
    i++;
  }
  flush();
  return out;
}

export function MathText({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split("$");
  return (
    <span className={className}>
      {parts.map((p, i) =>
        i % 2 ? (
          <span key={i} className="math">
            {math(p, `p${i}`)}
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </span>
  );
}
