import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Table({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto rounded-[20px] border border-border-2 bg-white ${className}`}>
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = "", ...props }: ComponentProps<"th">) {
  return (
    <th className={`whitespace-nowrap bg-sidebar px-4 py-3 text-xs font-semibold text-ink-2 first:pl-5 last:pr-5 ${className}`} {...props}>
      {children}
    </th>
  );
}

export function Td({ children, className = "", ...props }: ComponentProps<"td">) {
  return (
    <td className={`border-t border-border-2 px-4 py-3 align-middle text-ink first:pl-5 last:pr-5 ${className}`} {...props}>
      {children}
    </td>
  );
}

const DOT: Record<string, string> = {
  green: "bg-success text-success-ink",
  grey: "bg-faint text-subtle",
  blue: "bg-primary text-primary",
  orange: "bg-warning text-warning-ink",
  red: "bg-destructive text-destructive-ink",
};

export function StatusDot({ tone, children }: { tone: keyof typeof DOT; children: ReactNode }) {
  const [dot, text] = DOT[tone].split(" ");
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${text}`}>
      <span className={`size-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  );
}

export function TypePill({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-lg bg-surface px-2 py-0.5 text-xs font-semibold text-ink-2">{children}</span>;
}

/** Footer: "x dari N baris" + page links. `href(page)` builds the URL for a page. */
export function Pager({ total, page, perPage, href, selected = 0 }: { total: number; page: number; perPage: number; href: (p: number) => string; selected?: number }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const btn = "grid size-8 place-items-center rounded-full text-ink hover:bg-surface aria-disabled:pointer-events-none aria-disabled:opacity-30";
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-subtle">
      <span>
        {selected} dari {total.toLocaleString("id-ID")} baris dipilih.
      </span>
      <div className="flex items-center gap-4">
        <span>
          {perPage} baris per halaman · <span className="font-semibold text-ink">Halaman {page} dari {pages}</span>
        </span>
        <div className="flex items-center gap-1">
          <Link href={href(1)} className={btn} aria-disabled={page <= 1} aria-label="Halaman pertama">
            <ChevronsLeft className="size-4" />
          </Link>
          <Link href={href(page - 1)} className={btn} aria-disabled={page <= 1} aria-label="Halaman sebelumnya">
            <ChevronLeft className="size-4" />
          </Link>
          <Link href={href(page + 1)} className={btn} aria-disabled={page >= pages} aria-label="Halaman berikutnya">
            <ChevronRight className="size-4" />
          </Link>
          <Link href={href(pages)} className={btn} aria-disabled={page >= pages} aria-label="Halaman terakhir">
            <ChevronsRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Builds URLs that keep the current filters and replace some of them. */
export function urlWith(base: string, current: Record<string, string | undefined>, patch: Record<string, string | number | undefined>) {
  const next: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...current, ...patch })) if (v !== undefined && v !== "" && v !== "semua") next[k] = String(v);
  const qs = new URLSearchParams(next).toString();
  return qs ? `${base}?${qs}` : base;
}

export const PER_PAGE = 10;
export const pageOf = (v?: string) => Math.max(1, Number(v) || 1);
