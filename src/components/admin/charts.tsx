"use client";

import { useRef, useState } from "react";

// Chart marks use the validated steps of the brand ramps (brand #3F4197 / #F78433 fail the
// lightness/contrast checks as data marks): series 1 indigo, series 2 orange.
export const SERIES = ["#5558C9", "#E36A20"] as const;
const GRID = "#ECEEF5";
const INK_MUTED = "#6B6E94";

type Series = { name: string; values: (number | null)[] };

function niceMax(v: number) {
  if (v <= 10) return 10;
  const step = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / step) * step;
}

/** Line chart with a ~10% area wash, crosshair + tooltip on hover, legend, sr-only table. */
export function LineChart({ labels, series, height = 240, max: maxProp, unit = "" }: { labels: string[]; series: Series[]; height?: number; max?: number; unit?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<SVGSVGElement>(null);
  const W = 760;
  const H = height;
  const pad = { l: 36, r: 12, t: 10, b: 26 };
  const all = series.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const max = maxProp ?? niceMax(Math.max(1, ...all));
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, labels.length - 1);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const ticks = [0, max / 4, max / 2, (3 * max) / 4, max];
  const path = (vals: (number | null)[]) => vals.map((v, i) => (v === null ? "" : `${i && vals[i - 1] !== null ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)).join(" ");
  const onMove = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (labels.length - 1));
    setHover(Math.max(0, Math.min(labels.length - 1, i)));
  };

  return (
    <div className="relative">
      {series.length > 1 && (
        <div className="mb-2 flex gap-4 text-xs text-ink-2">
          {series.map((s, k) => (
            <span key={s.name} className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded-full" style={{ background: SERIES[k] }} /> {s.name}
            </span>
          ))}
        </div>
      )}
      <svg ref={box} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none select-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label={`Grafik ${series.map((s) => s.name).join(" dan ")}`}>
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={pad.l} x2={W - pad.r} y1={y(tk)} y2={y(tk)} stroke={GRID} strokeWidth={1} />
            <text x={pad.l - 8} y={y(tk) + 4} textAnchor="end" fontSize={11} fill={INK_MUTED}>
              {Math.round(tk)}
            </text>
          </g>
        ))}
        {labels.map((l, i) =>
          i % Math.ceil(labels.length / 7) === 0 || i === labels.length - 1 ? (
            <text key={l + i} x={x(i)} y={H - 6} textAnchor="middle" fontSize={11} fill={INK_MUTED}>
              {l}
            </text>
          ) : null,
        )}
        {series.map((s, k) => {
          const d = path(s.values);
          const first = s.values.findIndex((v) => v !== null);
          const last = s.values.length - 1 - [...s.values].reverse().findIndex((v) => v !== null);
          return (
            <g key={s.name}>
              {/* one wash only: two overlapping washes muddy into a third colour */}
              {k === 0 && first >= 0 && <path d={`${d} L${x(last)},${y(0)} L${x(first)},${y(0)} Z`} fill={SERIES[k]} opacity={0.1} />}
              <path d={d} fill="none" stroke={SERIES[k]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {s.values.map((v, i) =>
                v !== null && (s.values[i - 1] ?? null) === null && (s.values[i + 1] ?? null) === null ? <circle key={i} cx={x(i)} cy={y(v)} r={4} fill={SERIES[k]} stroke="#fff" strokeWidth={2} /> : null,
              )}
            </g>
          );
        })}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#C9CBE0" strokeWidth={1} />
            {series.map((s, k) =>
              s.values[hover] === null ? null : <circle key={s.name} cx={x(hover)} cy={y(s.values[hover]!)} r={5} fill={SERIES[k]} stroke="#fff" strokeWidth={2} />,
            )}
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-6 z-10 min-w-[120px] -translate-x-1/2 rounded-xl border border-border bg-white px-3 py-2 text-xs shadow-pop" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <p className="mb-1 font-semibold text-ink">{labels[hover]}</p>
          {series.map((s, k) => (
            <p key={s.name} className="flex items-center justify-between gap-3 text-ink-2">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: SERIES[k] }} /> {s.name}
              </span>
              <span className="font-semibold text-ink">{s.values[hover] === null ? "–" : `${s.values[hover]!.toLocaleString("id-ID", { maximumFractionDigits: 1 })}${unit}`}</span>
            </p>
          ))}
        </div>
      )}
      <table className="sr-only">
        <thead>
          <tr>
            <th>Periode</th>
            {series.map((s) => (
              <th key={s.name}>{s.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((l, i) => (
            <tr key={l + i}>
              <td>{l}</td>
              {series.map((s) => (
                <td key={s.name}>{s.values[i] ?? "–"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Column chart: ≤24px bars, 4px rounded tops, value on hover; `highlight` marks one column. */
export function ColumnChart({ data, height = 220, highlight, unit = "" }: { data: { label: string; value: number }[]; height?: number; highlight?: number; unit?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = height;
  const pad = { l: 36, r: 8, t: 18, b: 28 };
  const max = niceMax(Math.max(1, ...data.map((d) => d.value)));
  const band = (W - pad.l - pad.r) / data.length;
  const bw = Math.min(24, band * 0.5);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const ticks = [0, max / 2, max];
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" role="img" aria-label="Grafik batang">
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={pad.l} x2={W - pad.r} y1={y(tk)} y2={y(tk)} stroke={GRID} strokeWidth={1} />
            <text x={pad.l - 8} y={y(tk) + 4} textAnchor="end" fontSize={11} fill={INK_MUTED}>
              {tk >= 1000 ? `${Math.round(tk / 100) / 10}K` : Math.round(tk)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = pad.l + band * i + band / 2;
          const top = y(d.value);
          const h = Math.max(0, y(0) - top);
          const r = Math.min(4, h);
          const fill = i === highlight ? SERIES[1] : SERIES[0];
          return (
            <g key={d.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <rect x={cx - band / 2} y={pad.t} width={band} height={H - pad.t - pad.b} fill="transparent" />
              <path d={`M${cx - bw / 2},${y(0)} V${top + r} Q${cx - bw / 2},${top} ${cx - bw / 2 + r},${top} H${cx + bw / 2 - r} Q${cx + bw / 2},${top} ${cx + bw / 2},${top + r} V${y(0)} Z`} fill={fill} opacity={hover === null || hover === i ? 1 : 0.55} />
              {(i === highlight || hover === i) && (
                <text x={cx} y={top - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="#0E1168">
                  {d.value.toLocaleString("id-ID", { maximumFractionDigits: 1 })}
                  {unit}
                </text>
              )}
              <text x={cx} y={H - 8} textAnchor="middle" fontSize={11} fill={INK_MUTED}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
