"use client";

import { Maximize, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { saveVideo } from "@/app/actions/quiz";
import { MathText } from "@/components/app/math-text";
import { Rumbi } from "@/components/app/visuals";
import { duration } from "@/lib/format";

/** Preview stand-in for a lesson video: a chalkboard scene with a working timeline that records progress. */
export function VideoPlayer({ id, total, start, board }: { id: number; total: number; start: number; board: string[] }) {
  const [t, setT] = useState(Math.min(start, total));
  const [playing, setPlaying] = useState(false);
  const [, startSave] = useTransition();
  const box = useRef<HTMLDivElement>(null);
  const lastSaved = useRef(start);

  const running = playing && t < total;
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => setT((x) => Math.min(total, x + 1)), 1000);
    return () => clearInterval(iv);
  }, [running, total]);

  useEffect(() => {
    const done = t >= total;
    if (done || Math.abs(t - lastSaved.current) >= 10) {
      lastSaved.current = t;
      startSave(() => saveVideo(id, t, done));
    }
  }, [t, total, id]);

  const toggle = () => {
    if (running) startSave(() => saveVideo(id, t, t >= total));
    if (!running && t >= total) setT(0);
    setPlaying(!running);
  };
  const step = Math.min(board.length, 1 + Math.floor((t / total) * board.length * 1.5));

  return (
    <div ref={box} className="relative aspect-video w-full overflow-hidden rounded-[20px] bg-[#e9ecff] lg:rounded-[24px]">
      <div className="absolute left-[7%] top-[10%] flex h-[70%] w-[52%] flex-col items-end justify-center gap-1 rounded-xl border-[6px] border-[#b07a4a] bg-[#2f5d4a] px-[6%] font-math text-[clamp(18px,4vw,40px)] text-white shadow-lg">
        {board.slice(0, step).map((line, i) => (
          <p key={i} className={i === board.length - 1 ? "border-t-2 border-white/80 pt-1 text-[#ffd479]" : ""}>
            <MathText text={line} />
          </p>
        ))}
      </div>
      <Rumbi pose="tunjuk" className="absolute bottom-0 right-[6%] h-[82%]" />
      <button type="button" onClick={toggle} className="absolute inset-0 grid place-items-center" aria-label={running ? "Jeda" : "Putar"}>
        {!running && (
          <span className="grid size-16 place-items-center rounded-full bg-white/90 text-primary shadow-lg">
            <Play className="ml-1 size-7 fill-current" />
          </span>
        )}
      </button>
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-linear-to-t from-black/45 to-transparent px-4 pb-3 pt-8 text-xs font-semibold tabular-nums text-white">
        <button type="button" onClick={toggle} aria-label={running ? "Jeda" : "Putar"}>
          {running ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
        </button>
        <span>{duration(t)}</span>
        <input
          type="range"
          min={0}
          max={total}
          value={t}
          onChange={(e) => setT(Number(e.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/40 accent-white"
          aria-label="Posisi video"
        />
        <span>{duration(total)}</span>
        <button type="button" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : box.current?.requestFullscreen())} aria-label="Layar penuh">
          <Maximize className="size-4" />
        </button>
      </div>
    </div>
  );
}
