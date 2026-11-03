"use client";

import { ArrowDown, ArrowRight, ArrowUp, Check, Plus, RefreshCw, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { saveQuiz } from "@/app/actions/admin";
import { MathText } from "@/components/app/math-text";
import { Button, buttonClass } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import { MAPEL } from "@/lib/catalog";
import { randomCode } from "./code-dialog";

export type BankItem = { id: number; prompt: string; subject: string; bab: string; level: string; type: string; jenjang: string; used: number };
type Initial = { id: number; title: string; kind: string; subject: string; jenjang: string; grade: number | null; durationMin: number; questionIds: number[]; startsAt: Date | null; endsAt: Date | null; accessCode: string | null; coinCost: number; status: string };

const local = (d: Date | null) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16) : "");
const STEPS = ["Info quiz", "Pilih soal", "Jadwal & kode"];

export function QuizBuilder({ bank, initial }: { bank: BankItem[]; initial?: Initial }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({
    title: initial?.title ?? "",
    kind: initial?.kind ?? "ujikom",
    subject: initial?.subject ?? "Matematika",
    jenjang: initial?.jenjang ?? "SMP",
    grade: initial?.grade ?? 9,
    durationMin: initial?.durationMin ?? 60,
    coinCost: initial?.coinCost ?? 0,
  });
  const [picked, setPicked] = useState<number[]>(initial?.questionIds ?? []);
  const [checked, setChecked] = useState<number[]>([]);
  const [q, setQ] = useState("");
  const [bab, setBab] = useState("");
  const [level, setLevel] = useState("");
  const [schedule, setSchedule] = useState({ startsAt: local(initial?.startsAt ?? null), endsAt: local(initial?.endsAt ?? null), accessCode: initial?.accessCode ?? "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const byId = useMemo(() => new Map(bank.map((b) => [b.id, b])), [bank]);
  const needsCode = info.kind === "ujikom" || info.kind === "tryout";

  const pool = bank.filter(
    (b) =>
      !picked.includes(b.id) &&
      (info.subject === "Semua" || b.subject === info.subject) &&
      (info.kind === "rumath" ? b.type === "isian" : b.type === "pg") &&
      (!bab || b.bab === bab) &&
      (!level || b.level === level) &&
      (!q || b.prompt.toLowerCase().includes(q.toLowerCase())),
  );
  const babs = [...new Set(bank.filter((b) => info.subject === "Semua" || b.subject === info.subject).map((b) => b.bab))];
  const levelCount = (l: string) => picked.filter((id) => byId.get(id)?.level === l).length;
  const move = (i: number, d: number) => {
    const next = [...picked];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setPicked(next);
  };
  const save = (publish: boolean) =>
    start(async () => {
      setError(null);
      const iso = (v: string) => (v ? new Date(v).toISOString() : "");
      const r = await saveQuiz(initial?.id ?? null, { ...info, questionIds: picked, ...schedule, startsAt: iso(schedule.startsAt), endsAt: iso(schedule.endsAt), publish });
      if (r.error) setError(r.error);
      else router.push("/admin/quiz");
    });
  const canNext = step === 0 ? info.title.trim().length > 2 : step === 1 ? picked.length > 0 : true;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="mr-auto flex flex-wrap items-center gap-6">
          {STEPS.map((s, i) => (
            <button key={s} type="button" onClick={() => (i < step || canNext) && setStep(i)} className="flex items-center gap-2.5 text-left">
              <span className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${i < step ? "bg-primary text-white" : i === step ? "border-2 border-primary text-primary" : "border border-border text-subtle"}`}>{i < step ? <Check className="size-3.5" /> : i + 1}</span>
              <span>
                <span className={`block text-sm font-semibold ${i === step ? "text-ink" : "text-ink-2"}`}>{s}</span>
                <span className="text-xs text-subtle">{i === 0 ? "nama, tipe, jenjang" : i === 1 ? `${picked.length} soal dipilih` : needsCode ? "kode dibuka" : "langsung tersedia"}</span>
              </span>
            </button>
          ))}
        </div>
        <Link href="/admin/quiz" className={buttonClass({ variant: "ghost" })}>
          Batal
        </Link>
        <Button variant="secondary" onClick={() => save(false)} disabled={pending || !info.title || !picked.length}>
          Simpan draf
        </Button>
        {step < 2 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext}>
            Lanjut <ArrowRight />
          </Button>
        ) : (
          <Button onClick={() => save(true)} disabled={pending}>
            {pending ? "Menyimpan…" : "Publish quiz"}
          </Button>
        )}
      </div>
      {error && <p className="mb-4 rounded-xl bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive-ink">{error}</p>}

      {step === 0 && (
        <Card className="grid max-w-[760px] gap-4 p-6 sm:grid-cols-2">
          <Field label="Nama quiz" htmlFor="title" className="sm:col-span-2">
            <Input id="title" value={info.title} onChange={(e) => setInfo({ ...info, title: e.target.value })} placeholder="Uji Kompetensi Matematika — Pecahan" />
          </Field>
          <Field label="Tipe" htmlFor="kind">
            <Select id="kind" value={info.kind} onChange={(e) => setInfo({ ...info, kind: e.target.value, durationMin: e.target.value === "tryout" ? 120 : e.target.value === "daily" ? 10 : e.target.value === "rumath" ? 15 : 60, coinCost: e.target.value === "rumath" ? 50 : 0 })}>
              <option value="ujikom">Uji Kom</option>
              <option value="tryout">Tryout</option>
              <option value="daily">Daily Quiz (template)</option>
              <option value="rumath">RUMATH</option>
            </Select>
          </Field>
          <Field label="Mapel" htmlFor="subject">
            <Select id="subject" value={info.subject} onChange={(e) => (setInfo({ ...info, subject: e.target.value }), setBab(""))}>
              {["Semua", ...MAPEL].map((m) => (
                <option key={m} value={m}>
                  {m === "Semua" ? "Semua mapel (tryout)" : m}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Jenjang" htmlFor="jenjang">
            <Select id="jenjang" value={info.jenjang} onChange={(e) => setInfo({ ...info, jenjang: e.target.value, grade: e.target.value === "SD" ? 6 : 9 })}>
              <option>SD</option>
              <option>SMP</option>
            </Select>
          </Field>
          <Field label="Kelas" htmlFor="grade">
            <Select id="grade" value={info.grade ?? ""} onChange={(e) => setInfo({ ...info, grade: Number(e.target.value) || 9 })}>
              {(info.jenjang === "SD" ? [4, 5, 6] : [7, 8, 9]).map((g) => (
                <option key={g} value={g}>
                  Kelas {g}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Durasi (menit)" htmlFor="dur">
            <Input id="dur" type="number" min={1} value={info.durationMin} onChange={(e) => setInfo({ ...info, durationMin: Number(e.target.value) })} />
          </Field>
          <Field label="Biaya coin" htmlFor="coin" hint="0 = gratis untuk siswa berpaket.">
            <Input id="coin" type="number" min={0} value={info.coinCost} onChange={(e) => setInfo({ ...info, coinCost: Number(e.target.value) })} />
          </Field>
        </Card>
      )}

      {step === 1 && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Card className="p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-ink">Soal terpilih</p>
                <p className="text-[13px] text-subtle">{picked.length} soal · urutan diacak per siswa</p>
              </div>
              <p className="text-xs text-ink-2">
                Mudah {levelCount("Mudah")} · Sedang {levelCount("Sedang")} · Sulit {levelCount("Sulit")}
              </p>
            </div>
            {picked.length === 0 && <p className="py-10 text-center text-sm text-subtle">Belum ada soal. Pilih dari bank soal di samping.</p>}
            <ol className="divide-y divide-border-2">
              {picked.map((id, i) => {
                const b = byId.get(id);
                return (
                  <li key={id} className="flex items-center gap-3 py-2.5">
                    <span className="w-5 text-xs text-subtle">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-ink">{b ? <MathText text={b.prompt} /> : `Soal #${id}`}</p>
                      <p className="text-xs text-subtle">
                        Q-{1000 + id} · {b?.bab} · {b?.level}
                      </p>
                    </div>
                    <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid size-7 place-items-center rounded-full text-subtle hover:bg-surface disabled:opacity-30" aria-label="Naikkan">
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button type="button" disabled={i === picked.length - 1} onClick={() => move(i, 1)} className="grid size-7 place-items-center rounded-full text-subtle hover:bg-surface disabled:opacity-30" aria-label="Turunkan">
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => setPicked(picked.filter((x) => x !== id))} className="grid size-7 place-items-center rounded-full text-ink hover:bg-surface" aria-label="Hapus dari quiz">
                      <X className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ol>
          </Card>
          <Card className="flex max-h-[640px] flex-col p-5">
            <p className="font-semibold text-ink">Bank soal</p>
            <p className="text-[13px] text-subtle">Centang untuk menambahkan</p>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari soal…" className="h-10 w-full rounded-xl bg-surface pl-9 pr-3 text-sm outline-none" />
            </div>
            <div className="mt-2 flex gap-2">
              <select value={bab} onChange={(e) => setBab(e.target.value)} className="h-8 flex-1 rounded-xl border border-dashed border-[#c9cbe0] bg-transparent px-2 text-xs font-semibold text-ink">
                <option value="">Semua bab</option>
                {babs.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="h-8 rounded-xl border border-dashed border-[#c9cbe0] bg-transparent px-2 text-xs font-semibold text-ink">
                <option value="">Semua level</option>
                <option>Mudah</option>
                <option>Sedang</option>
                <option>Sulit</option>
              </select>
            </div>
            <div className="mt-2 min-h-0 flex-1 divide-y divide-border-2 overflow-y-auto">
              {pool.slice(0, 60).map((b) => (
                <label key={b.id} className="flex cursor-pointer items-start gap-3 py-2.5">
                  <Checkbox checked={checked.includes(b.id)} onChange={(e) => setChecked(e.target.checked ? [...checked, b.id] : checked.filter((x) => x !== b.id))} />
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm font-semibold text-ink">
                      <MathText text={b.prompt} />
                    </span>
                    <span className="text-xs text-subtle">
                      Q-{1000 + b.id} · {b.level} · dipakai {b.used}×
                    </span>
                  </span>
                </label>
              ))}
              {pool.length === 0 && <p className="py-6 text-center text-sm text-subtle">Tidak ada soal yang cocok.</p>}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border-2 pt-3">
              <span className="text-xs text-subtle">{checked.length} soal dicentang</span>
              <Button size="sm" variant="secondary" disabled={!checked.length} onClick={() => (setPicked([...picked, ...checked]), setChecked([]))}>
                <Plus /> Tambahkan
              </Button>
            </div>
          </Card>
        </div>
      )}

      {step === 2 && (
        <Card className="grid max-w-[760px] gap-4 p-6 sm:grid-cols-2">
          <Field label="Dibuka" htmlFor="start" hint={needsCode ? "Siswa bisa memasukkan kode mulai jam ini." : "Kosongkan untuk langsung tersedia."}>
            <Input id="start" type="datetime-local" value={schedule.startsAt} onChange={(e) => setSchedule({ ...schedule, startsAt: e.target.value })} />
          </Field>
          <Field label="Ditutup" htmlFor="end">
            <Input id="end" type="datetime-local" value={schedule.endsAt} onChange={(e) => setSchedule({ ...schedule, endsAt: e.target.value })} />
          </Field>
          {needsCode && (
            <Field label="Kode akses" htmlFor="code" hint="6 huruf/angka, dibagikan tutor sebelum sesi." className="sm:col-span-2">
              <div className="flex gap-2">
                <Input id="code" value={schedule.accessCode} onChange={(e) => setSchedule({ ...schedule, accessCode: e.target.value.toUpperCase().slice(0, 6) })} className="max-w-[220px] text-center font-mono text-lg tracking-[0.3em]" />
                <Button variant="ghost" onClick={() => setSchedule({ ...schedule, accessCode: randomCode() })}>
                  <RefreshCw /> Acak
                </Button>
              </div>
            </Field>
          )}
          <div className="rounded-2xl bg-sidebar p-4 text-sm text-ink-2 sm:col-span-2">
            <p className="font-semibold text-ink">{info.title || "Tanpa nama"}</p>
            <p>
              {picked.length} soal · {info.durationMin} menit · {info.subject === "Semua" ? "semua mapel" : info.subject} · {info.jenjang} kelas {info.grade}
              {info.coinCost ? ` · ${info.coinCost} coin` : ""}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
