"use client";

import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

function Pick({ value, onChange, label, children }: { value: string; onChange: (v: string) => void; label: string; children: ReactNode }) {
  return (
    <span className="relative inline-flex items-center">
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className="h-9 cursor-pointer appearance-none bg-transparent pr-5 text-[13px] font-semibold text-ink outline-none">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-0 size-3.5 text-subtle" />
    </span>
  );
}

export function RankFilters({ board, periode, kelas, sekolah, grade }: { board: string; periode: string; kelas: string; sekolah: string; grade: number | null }) {
  const router = useRouter();
  const sp = useSearchParams();
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(sp.toString());
    if (v) next.set(k, v);
    else next.delete(k);
    next.set("papan", board);
    router.push(`/student/leaderboard?${next}`, { scroll: false });
  };
  return (
    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
      <Pick label="Periode" value={periode} onChange={(v) => set("periode", v)}>
        <option value="">{board === "daily" ? "Semua waktu" : "Semua sesi"}</option>
        <option value="minggu">Minggu ini</option>
        <option value="bulan">Bulan ini</option>
      </Pick>
      <Pick label="Kelas" value={kelas} onChange={(v) => set("kelas", v)}>
        <option value="">Semua kelas</option>
        <option value="saya">Kelas {grade}</option>
      </Pick>
      <Pick label="Sekolah" value={sekolah} onChange={(v) => set("sekolah", v)}>
        <option value="">Semua sekolah</option>
        <option value="saya">Sekolahku</option>
      </Pick>
    </div>
  );
}
