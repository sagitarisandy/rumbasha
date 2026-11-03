"use client";

import { ChevronLeft, ChevronRight, Maximize, Minimize, ZoomIn, ZoomOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { saveProgress } from "@/app/actions/siswa";
import { MathText } from "@/components/app/math-text";
import type { PdfBlock } from "@/lib/pdf-content";

function Page({ blocks }: { blocks: PdfBlock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "label":
            return <p key={i} className="text-[11px] font-medium tracking-[0.08em] text-subtle">{b.text}</p>;
          case "h":
            return <h2 key={i} className="-mt-2 text-lg font-semibold text-ink">{b.text}</h2>;
          case "p":
            return <p key={i} className="text-sm leading-6 text-ink-2"><MathText text={b.text} /></p>;
          case "lines":
            return (
              <div key={i} className="flex flex-col gap-2.5" aria-hidden>
                {Array.from({ length: b.n }, (_, j) => (
                  <span key={j} className="h-2 rounded-full bg-surface" style={{ width: `${[92, 85, 97, 66, 88][(i + j) % 5]}%` }} />
                ))}
              </div>
            );
          case "math":
            return (
              <p key={i} className="py-2 text-center text-[22px] text-ink">
                <MathText text={b.text} />
              </p>
            );
          case "note":
            return <p key={i} className="rounded-xl bg-surface px-3 py-2.5 text-[13px] text-ink">{b.text}</p>;
          case "list":
            return (
              <ul key={i} className="list-disc space-y-1 pl-5 text-sm text-ink-2">
                {b.items.map((t) => (
                  <li key={t}>
                    <MathText text={t} />
                  </li>
                ))}
              </ul>
            );
        }
      })}
    </div>
  );
}

export function PdfViewer({ id, pages, start, content }: { id: number; pages: number; start: number; content: Record<number, PdfBlock[]> }) {
  const router = useRouter();
  const [page, setPage] = useState(Math.min(Math.max(1, start), pages));
  const [zoom, setZoom] = useState(1);
  const [full, setFull] = useState(false);
  const [, startTransition] = useTransition();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => startTransition(() => saveProgress(id, page)), 400);
    return () => clearTimeout(t);
  }, [id, page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setPage((p) => Math.min(pages, p + 1));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(1, p - 1));
    };
    const onFs = () => setFull(!!document.fullscreenElement);
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [pages]);

  const go = (p: number) => {
    setPage(p);
    router.replace(`/student/modules/${id}?hal=${p}`, { scroll: false });
  };
  const blocks = content[page] ?? content[((page - 2) % 4) + 2] ?? content[1];
  const btn = "grid size-9 place-items-center rounded-full bg-white text-ink shadow-tab transition hover:bg-primary-soft disabled:opacity-40";

  return (
    <div ref={box} className={`flex flex-col items-center rounded-[24px] bg-surface px-3 py-4 sm:px-6 sm:py-5 ${full ? "justify-center overflow-auto" : ""}`}>
      <div className="w-full overflow-auto">
        <div
          className="mx-auto aspect-[1/1.12] w-full max-w-[560px] origin-top rounded-md bg-white p-6 shadow-[0_6px_24px_rgb(14_17_104/0.08)] transition-transform sm:p-7"
          style={{ transform: `scale(${zoom})`, marginBottom: zoom > 1 ? `${(zoom - 1) * 100}%` : 0 }}
        >
          <Page blocks={blocks} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button type="button" className={btn} onClick={() => go(Math.max(1, page - 1))} disabled={page <= 1} aria-label="Halaman sebelumnya">
          <ChevronLeft className="size-4" />
        </button>
        <span className="flex h-9 items-center rounded-[18px] bg-white px-4 text-sm text-ink shadow-tab">
          Hal. {page} / {pages}
        </span>
        <button type="button" className={btn} onClick={() => go(Math.min(pages, page + 1))} disabled={page >= pages} aria-label="Halaman berikutnya">
          <ChevronRight className="size-4" />
        </button>
        <span className="mx-1 h-6 w-px bg-border" />
        <button type="button" className={btn} onClick={() => setZoom((z) => (z >= 1.5 ? 1 : z + 0.25))} aria-label="Perbesar">
          {zoom >= 1.5 ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => (document.fullscreenElement ? document.exitFullscreen() : box.current?.requestFullscreen())}
          aria-label="Layar penuh"
        >
          {full ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
        </button>
      </div>
    </div>
  );
}
