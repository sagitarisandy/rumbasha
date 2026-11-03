"use client";

import { Check, KeyRound } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { checkCode, startQuiz } from "@/app/actions/quiz";
import { Rumbi } from "@/components/app/visuals";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

const LEN = 6;
const COUNTDOWN = 15;

export function AccessCodeButton({ quizId, title, total, minutes }: { quizId: number; title: string; total: number; minutes: number }) {
  const [open, setOpen] = useState(false);
  const [chars, setChars] = useState<string[]>(Array(LEN).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [left, setLeft] = useState(COUNTDOWN);
  const [checking, startCheck] = useTransition();
  const [starting, startGo] = useTransition();
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const code = chars.join("");

  const go = () => startGo(async () => {
    const r = await startQuiz(quizId, code);
    if (r?.error) setError(r.error);
  });

  useEffect(() => {
    if (!ready) return;
    if (left <= 0) {
      go();
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [ready, left]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (i: number, v: string) => {
    const clean = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length > 1) {
      const next = [...chars];
      clean.slice(0, LEN - i).split("").forEach((c, k) => (next[i + k] = c));
      setChars(next);
      boxes.current[Math.min(LEN - 1, i + clean.length)]?.focus();
      return;
    }
    const next = [...chars];
    next[i] = clean;
    setChars(next);
    setError(null);
    if (clean && i < LEN - 1) boxes.current[i + 1]?.focus();
  };
  const check = () =>
    startCheck(async () => {
      const r = await checkCode(quizId, code);
      if (r.ok) {
        setReady(true);
        setLeft(COUNTDOWN);
      } else setError(r.error ?? "Kode salah.");
    });
  const close = () => {
    setOpen(false);
    setReady(false);
    setError(null);
  };

  return (
    <>
      <Button size="lg" className="mt-4 w-full" onClick={() => setOpen(true)}>
        <KeyRound /> Masukkan kode akses
      </Button>
      <Dialog open={open} onClose={close} side size="sm">
        {!ready ? (
          <>
            <p className="text-lg font-semibold text-ink">Masukkan kode akses</p>
            <p className="text-sm text-subtle">{title}</p>
            <div className="mt-5 flex justify-center gap-2" onPaste={(e) => (e.preventDefault(), set(0, e.clipboardData.getData("text")))}>
              {chars.map((c, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    boxes.current[i] = el;
                  }}
                  value={c}
                  onChange={(e) => set(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !c && i > 0) boxes.current[i - 1]?.focus();
                    if (e.key === "Enter" && code.length === LEN) check();
                  }}
                  maxLength={LEN}
                  inputMode="text"
                  autoCapitalize="characters"
                  autoFocus={i === 0}
                  aria-label={`Karakter ${i + 1}`}
                  className={`h-14 w-12 rounded-xl border text-center text-xl font-semibold uppercase text-ink outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgb(63_65_151/0.14)] ${error ? "border-destructive bg-destructive-soft" : "border-border"}`}
                />
              ))}
            </div>
            {error ? <p className="mt-3 text-center text-sm font-semibold text-destructive">{error}</p> : <p className="mt-3 text-center text-xs text-subtle">6 karakter dari tutor, dibagikan sebelum sesi mulai.</p>}
            <Button size="lg" className="mt-5 w-full" disabled={code.length < LEN || checking} onClick={check}>
              {checking ? "Mengecek…" : "Cek kode"}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-start gap-4">
              <Rumbi pose="tunjuk" className="h-20 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 rounded-xl bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success-ink">
                  <Check className="size-3" /> Kode benar
                </span>
                <p className="mt-1.5 text-lg font-semibold text-ink">Quiz mulai dalam {left} detik</p>
                <p className="text-sm text-subtle">Ketuk mulai kalau mau langsung mulai.</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-surface">
              <div className="h-1.5 rounded-full bg-primary transition-[width] duration-1000 ease-linear" style={{ width: `${((COUNTDOWN - left) / COUNTDOWN) * 100}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-3 divide-x divide-border border-y border-border py-3">
              <div className="pr-3">
                <p className="text-xs text-subtle">Soal, diacak</p>
                <p className="font-semibold text-ink">{total}</p>
              </div>
              <div className="px-3">
                <p className="text-xs text-subtle">Tetap jalan</p>
                <p className="font-semibold text-ink">{minutes} menit</p>
              </div>
              <div className="pl-3">
                <p className="text-xs text-subtle">Tandai dulu</p>
                <p className="font-semibold text-ink">Ragu?</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-2">Kerjakan sendiri ya. Nilai dan peringkat muncul setelah kamu mengumpulkan.</p>
            {error && <p className="mt-2 text-sm font-semibold text-destructive">{error}</p>}
            <Button variant="accent" size="lg" className="mt-5 w-full" onClick={go} disabled={starting}>
              {starting ? "Membuka soal…" : "Mulai sekarang"}
            </Button>
          </>
        )}
      </Dialog>
    </>
  );
}
