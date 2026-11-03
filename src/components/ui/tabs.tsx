"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Item<T extends string> = { value: T; label: ReactNode; href?: string };

/** Pill tabs on a soft track ("Daily Quiz | Uji Kom | Tryout"). Links when items have href. */
export function Segmented<T extends string>({
  items, value, onChange, className = "", size = "md",
}: { items: Item<T>[]; value: T; onChange?: (v: T) => void; className?: string; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-8 text-[13px]" : "h-[34px] text-sm";
  return (
    <div role="tablist" className={`flex rounded-[21px] bg-surface p-1 ${className}`}>
      {items.map((it) => {
        const on = it.value === value;
        const cls = `flex flex-1 items-center justify-center whitespace-nowrap rounded-[17px] px-3 transition ${h} ${
          on ? "bg-white font-semibold text-ink shadow-tab" : "text-subtle hover:text-ink"
        }`;
        return it.href ? (
          <Link key={it.value} href={it.href} role="tab" aria-selected={on} className={cls} scroll={false}>
            {it.label}
          </Link>
        ) : (
          <button key={it.value} type="button" role="tab" aria-selected={on} className={cls} onClick={() => onChange?.(it.value)}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/** Text tabs with an underline ("Semua  Siswa  Tutor"). */
export function UnderlineTabs<T extends string>({
  items, value, onChange, className = "",
}: { items: (Item<T> & { count?: number })[]; value: T; onChange?: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={`flex gap-6 overflow-x-auto border-b border-border ${className}`}>
      {items.map((it) => {
        const on = it.value === value;
        const cls = `-mb-px flex h-10 items-center gap-1.5 whitespace-nowrap border-b-2 text-sm font-semibold transition ${
          on ? "border-primary text-primary" : "border-transparent text-subtle hover:text-ink"
        }`;
        const body = (
          <>
            {it.label}
            {it.count !== undefined && <span className={`rounded-lg px-1.5 text-xs ${on ? "bg-primary-soft" : "bg-surface"}`}>{it.count}</span>}
          </>
        );
        return it.href ? (
          <Link key={it.value} href={it.href} role="tab" aria-selected={on} className={cls} scroll={false}>
            {body}
          </Link>
        ) : (
          <button key={it.value} type="button" role="tab" aria-selected={on} className={cls} onClick={() => onChange?.(it.value)}>
            {body}
          </button>
        );
      })}
    </div>
  );
}

/** Rounded chips ("Semua  Bilangan  Aljabar …"). */
export function Chips<T extends string>({
  items, value, onChange, className = "",
}: { items: Item<T>[]; value: T; onChange?: (v: T) => void; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((it) => {
        const on = it.value === value;
        const cls = `inline-flex h-9 items-center rounded-[18px] px-4 text-sm font-semibold transition ${
          on ? "bg-primary text-white shadow-btn" : "text-ink hover:bg-surface"
        }`;
        return it.href ? (
          <Link key={it.value} href={it.href} className={cls} scroll={false} aria-current={on || undefined}>
            {it.label}
          </Link>
        ) : (
          <button key={it.value} type="button" className={cls} onClick={() => onChange?.(it.value)} aria-pressed={on}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
