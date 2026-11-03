import type { ComponentProps, ReactNode } from "react";

export type BadgeVariant = "default" | "secondary" | "outline" | "success" | "danger" | "warning" | "info" | "accent";

const BADGE: Record<BadgeVariant, string> = {
  default: "bg-primary text-white",
  secondary: "bg-surface text-ink-2",
  outline: "border border-border bg-white text-ink",
  success: "bg-success-soft text-success-ink",
  danger: "bg-destructive-soft text-destructive-ink",
  warning: "bg-warning-soft text-warning-ink",
  info: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-accent-ink",
};

export function Badge({ variant = "secondary", className = "", ...props }: ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-xl px-2.5 text-xs font-semibold [&_svg]:size-3 ${BADGE[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`rounded-[20px] border border-border-2 bg-white shadow-panel ${className}`} {...props} />;
}

export function Progress({ value, className = "", color = "var(--color-primary)", track = "var(--color-surface)" }: { value: number; className?: string; color?: string; track?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2 overflow-hidden rounded-full ${className}`} style={{ background: track }} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${v}%`, background: color }} />
    </div>
  );
}

export function SectionTitle({ title, sub, action, className = "" }: { title: ReactNode; sub?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={`mb-3 flex items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-subtle">{sub}</p>}
      </div>
      {action && <div className="shrink-0 text-[13px] font-semibold text-primary">{action}</div>}
    </div>
  );
}

export function PageTitle({ title, sub, action }: { title: ReactNode; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.02em] text-ink lg:text-[26px]">{title}</h1>
        {sub && <p className="mt-1 text-sm text-subtle">{sub}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

export function Stars({ n, of = 3 }: { n: number; of?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} dari ${of} bintang`}>
      {Array.from({ length: of }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={`size-3.5 ${i < n ? "fill-[#fbbf24] stroke-[#f59e0b]" : "fill-none stroke-[#c9cbe0]"}`} strokeWidth="2">
          <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
        </svg>
      ))}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded-md border border-border bg-white px-1.5 py-0.5 font-sans text-[11px] text-subtle">{children}</kbd>;
}
