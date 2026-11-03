import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Kostum } from "@/components/app/visuals";
import { mapelStyle } from "@/lib/catalog";
import { ago } from "@/lib/format";

export function scoreTone(score: number) {
  return score >= 75 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";
}

export function HistoryRow({ id, title, subject, sub, score }: { id: number; title: string; subject: string; sub: string; score: number | null }) {
  return (
    <Link href={`/student/results/${id}`} className="flex items-center gap-3 py-3 transition hover:bg-sidebar">
      <span className="grid size-12 shrink-0 place-items-end overflow-hidden rounded-xl" style={{ background: mapelStyle(subject).color }}>
        <Kostum mapel={subject} className="h-11" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-ink">{title}</p>
        <p className="text-xs text-subtle">{sub}</p>
      </div>
      <span className={`text-lg font-semibold ${scoreTone(score ?? 0)}`}>{score ?? "–"}</span>
      <ChevronRight className="size-4 text-faint" />
    </Link>
  );
}

export const historySub = (at: Date | null, points: number) => `${ago(at)}${points ? ` · +${points} poin` : ""}`;
