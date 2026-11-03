import { Play } from "lucide-react";
import { Kostum } from "@/components/app/visuals";
import { MathText } from "@/components/app/math-text";
import { duration } from "@/lib/format";

const MOTIF: Record<string, string> = {
  Penjumlahan: "$\\f{2}{3} + \\f{1}{4}$",
  Pengurangan: "$85 - 37$",
  Perkalian: "$12 \\times 11$",
  Pembagian: "$144 \\div 12$",
  "Soal cerita": "$? + 7 = 15$",
};

export function VideoThumb({ jenis, seconds, progress, className = "h-[104px]", label = "RUMATH" }: { jenis: string; seconds: number; progress?: number; className?: string; label?: string }) {
  return (
    <div className={`relative isolate overflow-hidden rounded-2xl bg-primary text-white ${className}`}>
      <div className="absolute -right-6 -top-10 -z-10 size-28 rounded-full bg-white/10" />
      <Kostum mapel="Matematika" className="absolute -bottom-1 right-1 -z-10 h-[88%]" />
      <span className="absolute left-2.5 top-2.5 rounded-[9px] bg-white/22 px-2 py-0.5 text-[10px] font-semibold">{label}</span>
      <span className="absolute bottom-2.5 left-3 text-[13px] text-white/85">
        <MathText text={MOTIF[jenis] ?? MOTIF.Penjumlahan} />
      </span>
      <span className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-primary shadow">
        <Play className="ml-0.5 size-4 fill-current" />
      </span>
      <span className="absolute bottom-2 right-2 rounded-md bg-ink/80 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums">{duration(seconds)}</span>
      {progress !== undefined && progress > 0 && (
        <span className="absolute inset-x-0 bottom-0 h-1 bg-white/30">
          <span className="block h-1 bg-accent" style={{ width: `${Math.min(100, progress)}%` }} />
        </span>
      )}
    </div>
  );
}
