"use client";

import { ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/actions/auth";
import { Avatar } from "./visuals";

export function UserMenu({ name, sub, avatar, links }: { name: string; sub: string; avatar: number; links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 hover:bg-surface" aria-expanded={open}>
        <Avatar n={avatar} className="size-11 ring-4 ring-accent-soft" />
        <span className="max-w-[170px] text-left">
          <span className="block truncate text-[15px] font-semibold text-ink">{name}</span>
          <span className="block truncate text-xs text-subtle">{sub}</span>
        </span>
        <ChevronDown className={`size-4 text-subtle transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border bg-white p-1.5 shadow-pop">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-ink hover:bg-surface">
              {l.label}
            </Link>
          ))}
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-destructive hover:bg-destructive-soft">
              <LogOut className="size-4" />
              Keluar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
