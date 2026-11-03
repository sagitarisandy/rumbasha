"use client";

import { useRouter } from "next/navigation";

export function MonthPicker({ value }: { value: string }) {
  const router = useRouter();
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleDateString("id-ID", { month: "long", year: "numeric" }) };
  });
  return (
    <select
      value={value}
      onChange={(e) => router.push(`/student/profile/history?bulan=${e.target.value}`, { scroll: false })}
      className="cursor-pointer appearance-none bg-transparent pr-2 text-[15px] font-semibold text-ink outline-none"
      aria-label="Bulan"
    >
      {months.map((m) => (
        <option key={m.key} value={m.key}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
