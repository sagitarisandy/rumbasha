"use client";

import { History, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "rb-recent-search";

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function RememberSearch({ q }: { q: string }) {
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify([q, ...read().filter((x) => x !== q)].slice(0, 8)));
    } catch {}
  }, [q]);
  return null;
}

export function RecentSearches() {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    const t = setTimeout(() => setItems(read()), 0);
    return () => clearTimeout(t);
  }, []);
  const remove = (q: string) => {
    const next = items.filter((x) => x !== q);
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };
  const list = items.length ? items : ["hukum newton", "kpk dan fpb", "teks narasi"];
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-[13px] font-semibold text-ink-2">{items.length ? "Pencarian terakhir" : "Coba cari"}</h2>
      <div className="flex flex-wrap gap-2">
        {list.map((q) => (
          <span key={q} className="inline-flex items-center gap-2 rounded-2xl bg-surface py-1.5 pl-3 pr-2 text-sm text-ink">
            <History className="size-4 text-subtle" />
            <Link href={`/siswa/cari?q=${encodeURIComponent(q)}`}>{q}</Link>
            {items.length > 0 && (
              <button type="button" onClick={() => remove(q)} aria-label={`Hapus ${q}`} className="grid size-5 place-items-center rounded-full text-subtle hover:bg-white">
                <X className="size-3" />
              </button>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
