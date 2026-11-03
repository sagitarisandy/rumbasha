"use client";

import { useActionState, useRef, useState } from "react";
import { startRumath, type ActionResult } from "@/app/actions/quiz";
import { Rumbi } from "@/components/app/visuals";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { RUMATH_COIN, RUMATH_JENIS, RUMATH_LEVELS, RUMATH_MINUTES, RUMATH_QUESTIONS } from "@/lib/rumath";

export function RumathForm({ coin, free, initialJenis }: { coin: number; free: boolean; initialJenis?: string }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(startRumath, {});
  const [jenis, setJenis] = useState(RUMATH_JENIS.some((j) => j.name === initialJenis) ? initialJenis! : "Penjumlahan");
  const [level, setLevel] = useState(1);
  const [rules, setRules] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const lv = RUMATH_LEVELS[level - 1];
  const cost = free ? 0 : RUMATH_COIN;

  return (
    <form ref={form} action={action}>
      <input type="hidden" name="jenis" value={jenis} />
      <input type="hidden" name="level" value={level} />
      <p className="font-semibold text-ink">Buat latihan</p>
      <p className="text-[13px] text-subtle">
        {RUMATH_QUESTIONS} soal isian · {RUMATH_MINUTES} menit · {free ? "gratis di paketmu" : `${RUMATH_COIN} coin`}
      </p>
      <p className="mb-2 mt-4 text-sm font-semibold text-ink">Jenis soal</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {RUMATH_JENIS.map((j) => {
          const on = j.name === jenis;
          return (
            <button key={j.name} type="button" onClick={() => setJenis(j.name)} aria-pressed={on} className={`relative flex min-h-[76px] flex-col justify-between rounded-2xl p-3 text-left transition ${on ? "bg-primary-soft" : "hover:bg-surface"}`}>
              <span className="text-xl font-semibold leading-none text-ink">{j.symbol}</span>
              <span className="text-xs text-ink-2">{j.name}</span>
              {on && <span className="absolute right-3 top-3 size-2 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
      <p className="mb-2 mt-4 text-sm font-semibold text-ink">Level</p>
      <div className="grid grid-cols-3 gap-2">
        {RUMATH_LEVELS.map((l) => {
          const on = l.level === level;
          return (
            <button key={l.level} type="button" onClick={() => setLevel(l.level)} aria-pressed={on} className={`relative rounded-2xl p-3 text-left transition ${on ? "bg-primary-soft" : "hover:bg-surface"}`}>
              <span className="block text-sm font-semibold text-ink">Level {l.level}</span>
              <span className="text-xs text-subtle">{l.range}</span>
              {on && <span className="absolute right-3 top-3 size-2 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
      {state.error && <p className="mt-4 rounded-xl bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive-ink">{state.error}</p>}
      <Button variant="accent" size="lg" className="mt-5 w-full" onClick={() => setRules(true)}>
        Mulai latihan
      </Button>

      <Dialog open={rules} onClose={() => setRules(false)} side size="sm">
        <div className="flex items-center gap-4">
          <Rumbi pose="koin" className="h-20 shrink-0" />
          <div>
            <p className="text-lg font-semibold text-ink">Latihan {jenis}</p>
            <p className="text-sm text-subtle">
              Level {level} · angka {lv.range}
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 divide-x divide-border border-y border-border py-3">
          <div className="pr-3">
            <p className="text-xs text-subtle">Soal isian</p>
            <p className="font-semibold text-ink">{RUMATH_QUESTIONS}</p>
          </div>
          <div className="px-3">
            <p className="text-xs text-subtle">Kosong = salah</p>
            <p className="font-semibold text-ink">{RUMATH_MINUTES} menit</p>
          </div>
          <div className="pl-3">
            <p className="text-xs text-subtle">Sisa {coin}</p>
            <p className="font-semibold text-ink">{cost ? `${cost} coin` : "Gratis"}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-2">Nilainya masuk laporan RUMATH yang bisa dilihat orang tua.</p>
        {cost > coin && <p className="mt-2 text-sm font-semibold text-destructive">Coin kamu kurang. Isi coin dulu di Paket & Coin.</p>}
        <Button variant="accent" size="lg" className="mt-5 w-full" disabled={pending || cost > coin} onClick={() => (setRules(false), form.current?.requestSubmit())}>
          {pending ? "Menyiapkan soal…" : "Mulai latihan"}
        </Button>
        <Button variant="ghost" className="mt-2 w-full" onClick={() => setRules(false)}>
          Nanti dulu
        </Button>
      </Dialog>
    </form>
  );
}
