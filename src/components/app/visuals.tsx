/* eslint-disable @next/next/no-img-element -- small local SVG illustrations, no optimisation needed */
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BAB_MOTIF, mapelStyle } from "@/lib/catalog";
import { MathText } from "./math-text";

export type RumbiPose = "hai" | "yey" | "juara" | "mikir" | "baca" | "waktu" | "koin" | "tunjuk" | "sedih" | "tidur" | "intip";

export function Rumbi({ pose, className = "", alt = "" }: { pose: RumbiPose; className?: string; alt?: string }) {
  return <img src={`/illustrations/rumbi/${pose}.svg`} alt={alt} className={`select-none ${className}`} draggable={false} />;
}

export function Kostum({ mapel, className = "" }: { mapel: string; className?: string }) {
  return <img src={`/illustrations/kostum/${mapelStyle(mapel).slug}.svg`} alt="" className={`select-none ${className}`} draggable={false} />;
}

export function Avatar({ n, className = "size-10", alt = "" }: { n: number; className?: string; alt?: string }) {
  return <img src={`/illustrations/avatar/av-${((n % 10) + 10) % 10}.svg`} alt={alt} className={`shrink-0 rounded-full ${className}`} draggable={false} />;
}

export function Logo({ href = "/", className = "w-[110px]" }: { href?: string; className?: string }) {
  return (
    <Link href={href} aria-label="Rumbasha Learning Center" className="inline-block shrink-0">
      <Image src="/images/logo-rumbasha.webp" alt="Rumbasha Learning Center" width={560} height={174} className={`h-auto ${className}`} />
    </Link>
  );
}

function Motif({ mapel, bab }: { mapel: string; bab?: string }) {
  const m = (bab && BAB_MOTIF[bab]) || mapelStyle(mapel).motif;
  if (!m) return null;
  if (m === "atom")
    return (
      <svg viewBox="0 0 48 48" className="size-10 stroke-white/80" fill="none" strokeWidth="2.4">
        <ellipse cx="24" cy="24" rx="20" ry="8" />
        <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(60 24 24)" />
        <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(120 24 24)" />
        <circle cx="24" cy="24" r="3" className="fill-white/80" />
      </svg>
    );
  if (m === "globe")
    return (
      <svg viewBox="0 0 48 48" className="size-10 stroke-white/80" fill="none" strokeWidth="2.4">
        <circle cx="24" cy="24" r="18" />
        <path d="M6 24h36M24 6c6 6 6 30 0 36M24 6c-6 6-6 30 0 36" />
      </svg>
    );
  if (m === "Aa") return <span className="font-math text-[32px] font-bold leading-none text-white/55">Aa</span>;
  if (m === "Hello!") return <span className="inline-flex h-7 items-center rounded-full bg-white/25 px-3 text-sm font-bold text-white">Hello!</span>;
  return <MathText text={m} className="text-[17px] leading-tight text-white/85" />;
}

/** Materi cover: mapel colour, motif of the bab, Rumbi in the mapel costume. */
export function SubjectCover({
  mapel, title, label, bab, className = "h-[132px]", size = "md",
}: { mapel: string; title: ReactNode; label?: ReactNode; bab?: string; className?: string; size?: "sm" | "md" }) {
  const style = mapelStyle(mapel);
  return (
    <div className={`relative isolate overflow-hidden rounded-2xl text-white ${className}`} style={{ background: style.color }}>
      <div className="absolute -right-8 -top-14 -z-10 size-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-14 -left-10 -z-10 size-32 rounded-full bg-black/10" />
      <Kostum mapel={mapel} className={`absolute -bottom-1 right-1 -z-10 max-w-[48%] ${size === "sm" ? "h-[90%]" : "h-[88%]"}`} />
      <div className={`flex h-full flex-col ${size === "sm" ? "p-2.5" : "p-3.5"}`}>
        {label && <span className="mb-1.5 inline-flex w-fit rounded-[10px] bg-white/22 px-2 py-0.5 text-[11px] font-semibold">{label}</span>}
        <p className={`max-w-[56%] font-bold leading-tight ${size === "sm" ? "text-[13px]" : "text-[16px]"}`}>{title}</p>
        {size === "md" && (
          <div className="mt-auto">
            <Motif mapel={mapel} bab={bab} />
          </div>
        )}
      </div>
    </div>
  );
}

/** "Pilih mapel" card with Rumbi in costume; selected = 2px mapel-coloured border + check. */
export function MapelCard({ mapel, active, href, onClick, compact }: { mapel: string; active: boolean; href?: string; onClick?: () => void; compact?: boolean }) {
  const style = mapelStyle(mapel);
  const body = (
    <>
      <span className="relative grid w-full place-items-center rounded-xl pt-1" style={{ background: style.tint }}>
        <Kostum mapel={mapel} className={compact ? "h-[64px]" : "h-[78px]"} />
        {active && (
          <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full text-white" style={{ background: style.color }}>
            <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        )}
      </span>
      <span className="text-center text-[13px] font-semibold leading-tight" style={{ color: active ? style.color : "var(--color-ink)" }}>
        {mapel}
      </span>
    </>
  );
  const cls = `flex w-[96px] shrink-0 flex-col items-center gap-2 rounded-2xl border-2 p-1.5 pb-2 transition sm:w-[104px] ${active ? "bg-white" : "border-transparent hover:bg-surface"}`;
  const border = active ? { borderColor: style.color } : undefined;
  return href ? (
    <Link href={href} className={cls} style={border} scroll={false} aria-current={active || undefined}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls} style={border} aria-pressed={active}>
      {body}
    </button>
  );
}

export function EmptyState({ title, body, action, pose = "tidur" }: { title: string; body?: string; action?: ReactNode; pose?: RumbiPose }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <Rumbi pose={pose} className="h-28" />
      <p className="mt-3 font-semibold text-ink">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-subtle">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Round soft icon tile used on stat cards and list rows. */
export function IconTile({ children, className = "bg-white text-primary", size = "size-10" }: { children: ReactNode; className?: string; size?: string }) {
  return <span className={`grid shrink-0 place-items-center rounded-full [&_svg]:size-[18px] ${size} ${className}`}>{children}</span>;
}
