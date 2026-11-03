"use client";

import { Zap } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { startDaily, type ActionResult } from "@/app/actions/quiz";
import { MapelCard, Rumbi } from "@/components/app/visuals";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Select } from "@/components/ui/form";
import { Stars } from "@/components/ui/misc";
import { DAILY_COIN_COST, DAILY_MINUTES, DAILY_QUESTIONS, KURIKULUM, LEVELS, MAPEL, type Mapel } from "@/lib/catalog";

type Props = {
  firstName: string;
  free: number;
  usedToday: number;
  coin: number;
  initial: { mapel?: string; bidang?: string; bab?: string; level?: string };
  subBab: Record<string, string[]>;
};

export function DailyForm({ firstName, free, usedToday, coin, initial, subBab }: Props) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(startDaily, {});
  const startMapel = (MAPEL as readonly string[]).includes(initial.mapel ?? "") ? (initial.mapel as Mapel) : "Matematika";
  const [mapel, setMapel] = useState<Mapel>(startMapel);
  const bidangs = KURIKULUM[mapel];
  const [bidang, setBidang] = useState(bidangs.some((b) => b.name === initial.bidang) ? initial.bidang! : bidangs[0].name);
  const babs = bidangs.find((b) => b.name === bidang)?.bab ?? bidangs[0].bab;
  const [bab, setBab] = useState(babs.some((b) => b.name === initial.bab) ? initial.bab! : babs[0].name);
  const [level, setLevel] = useState(LEVELS.some((l) => l.name === initial.level) ? initial.level! : "Mudah");
  const [rules, setRules] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  const pickMapel = (m: Mapel) => {
    setMapel(m);
    const b = KURIKULUM[m][0];
    setBidang(b.name);
    setBab(b.bab[0].name);
  };
  const pickBidang = (name: string) => {
    setBidang(name);
    setBab(KURIKULUM[mapel].find((b) => b.name === name)!.bab[0].name);
  };

  return (
    <form ref={form} action={action}>
      <input type="hidden" name="mapel" value={mapel} />
      <input type="hidden" name="level" value={level} />
      <p className="font-semibold text-ink">Pilih materi</p>
      <p className="text-[13px] text-subtle">
        {DAILY_QUESTIONS} soal · {DAILY_MINUTES} menit
      </p>
      <p className="mb-2 mt-4 text-sm font-semibold text-ink">Mapel</p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {MAPEL.map((m) => (
          <MapelCard key={m} mapel={m} active={m === mapel} onClick={() => pickMapel(m)} compact />
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Bidang materi" htmlFor="bidang">
          <Select id="bidang" name="bidang" value={bidang} onChange={(e) => pickBidang(e.target.value)}>
            {bidangs.map((b) => (
              <option key={b.name}>{b.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Bab" htmlFor="bab">
          <Select id="bab" name="bab" value={bab} onChange={(e) => setBab(e.target.value)}>
            {babs.map((b) => (
              <option key={b.name}>{b.name}</option>
            ))}
          </Select>
        </Field>
        <Field label={<span className="font-normal text-subtle">Sub bab (opsional)</span>} htmlFor="subbab">
          <Select id="subbab" name="subbab" defaultValue="">
            <option value="">Semua</option>
            {(subBab[bab] ?? []).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label={<span className="font-normal text-subtle">Topik (opsional)</span>} htmlFor="topik">
          <Select id="topik" name="topik" defaultValue="">
            <option value="">Semua</option>
            <option>Konsep dasar</option>
            <option>Soal hitungan</option>
            <option>Soal cerita</option>
          </Select>
        </Field>
      </div>

      <p className="mb-2 mt-5 text-sm font-semibold text-ink">Level</p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {LEVELS.map((l) => {
          const on = l.name === level;
          return (
            <button key={l.name} type="button" onClick={() => setLevel(l.name)} aria-pressed={on} className={`relative rounded-2xl p-3 text-left transition sm:p-4 ${on ? "border-2 border-primary bg-primary-soft" : "border border-border-2 hover:bg-surface"}`}>
              <Stars n={l.stars} />
              <p className="mt-1.5 font-semibold text-ink">{l.name}</p>
              <p className="text-xs text-subtle">{l.hint}</p>
              <span className={`absolute right-3 top-3 size-[18px] rounded-full ${on ? "border-[5px] border-primary bg-white" : "border border-[#c9cbe0]"}`} />
            </button>
          );
        })}
      </div>

      {state.error && <p className="mt-4 rounded-xl bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive-ink">{state.error}</p>}

      <Button variant="accent" size="lg" className="mt-6 w-full" onClick={() => setRules(true)}>
        <Zap /> Mulai Daily Quiz
      </Button>

      <Dialog open={rules} onClose={() => setRules(false)} side size="sm">
        <div className="flex items-center gap-4">
          <Rumbi pose="waktu" className="h-20 shrink-0" />
          <div>
            <p className="text-lg font-semibold text-ink">Siap mulai, {firstName}?</p>
            <p className="text-sm text-subtle">
              {bab} · level {level}
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 divide-x divide-border border-y border-border py-3">
          <div className="pr-3">
            <p className="text-xs text-subtle">Soal</p>
            <p className="font-semibold text-ink">{DAILY_QUESTIONS}</p>
          </div>
          <div className="px-3">
            <p className="text-xs text-subtle">Waktu</p>
            <p className="font-semibold text-ink">{DAILY_MINUTES} menit</p>
          </div>
          <div className="pl-3">
            <p className="text-xs text-subtle">Jatah ke-{usedToday + 1}</p>
            <p className="font-semibold text-ink">{free > 0 ? "Gratis" : `${DAILY_COIN_COST} coin`}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-2">Soal diambil acak dari bank soal. Setelah dikumpulkan, jawaban tidak bisa diubah. Poinnya masuk ke peringkat global.</p>
        {free <= 0 && coin < DAILY_COIN_COST && <p className="mt-3 text-sm font-semibold text-destructive">Coin kamu {coin}, kurang untuk quiz tambahan.</p>}
        <Button variant="accent" size="lg" className="mt-5 w-full" disabled={pending} onClick={() => (setRules(false), form.current?.requestSubmit())}>
          {pending ? "Menyiapkan soal…" : "Mulai quiz"}
        </Button>
        <Button variant="ghost" className="mt-2 w-full" onClick={() => setRules(false)}>
          Nanti dulu
        </Button>
      </Dialog>
    </form>
  );
}
