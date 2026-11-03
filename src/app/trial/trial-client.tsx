"use client";

import { ArrowLeft, ChevronRight, Info, Lock, Timer } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { gradeTrial, type TrialResult } from "@/app/actions/trial";
import { MathText } from "@/components/app/math-text";
import { Logo, Rumbi } from "@/components/app/visuals";
import { Button, LinkButton } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/misc";
import { rupiahShort } from "@/lib/format";

type Q = { id: number; prompt: string; options: string[] };
const LETTERS = "ABCDE";

function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 sm:px-6">
        <Logo className="w-[96px]" />
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link href="/pricing" className="hidden px-3 text-sm font-semibold text-ink hover:text-primary sm:block">
            Paket & Biaya
          </Link>
          <Link href="/login" className="px-3 text-sm font-semibold text-ink hover:text-primary">
            Masuk
          </Link>
          <LinkButton href="/pricing" variant="accent" size="sm" className="hidden sm:inline-flex">
            Daftar
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}

export function TrialQuiz({ questions, deadline, suggestion }: { questions: Q[]; deadline: number; suggestion: { name: string; price: number } | null }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TrialResult | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => (clearTimeout(first), clearInterval(t));
  }, []);
  const left = now === null ? null : Math.max(0, Math.floor((deadline - now) / 1000));
  const submit = () => start(async () => setResult(await gradeTrial(questions.map((q) => q.id), answers)));
  useEffect(() => {
    if (left === 0 && !result && !pending) submit();
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  if (result) {
    const ratio = result.correct / Math.max(1, result.total);
    return (
      <div className="min-h-dvh bg-white">
        <Header />
        <main className="mx-auto max-w-[440px] px-5 pb-10 pt-8 text-center">
          <Rumbi pose="yey" className="mx-auto h-[150px]" />
          <p className="mt-4 text-sm text-subtle">Jawaban benar</p>
          <p className="text-ink">
            <span className="text-[64px] font-bold leading-none">{result.correct}</span>
            <span className="text-xl text-subtle">/{result.total}</span>
          </p>
          <p className="mt-2 text-lg font-semibold text-ink">{ratio >= 0.8 ? "Hebat!" : ratio >= 0.5 ? "Lumayan!" : "Ayo mulai dari dasar!"}</p>
          <p className="mt-1 text-sm text-subtle">
            {result.strong ? `Kuat di ${result.strong.toLowerCase()}` : "Masih perlu banyak latihan"}
            {result.weak ? `, masih sering keliru di ${result.weak.toLowerCase()}.` : "."}
          </p>
          <Card className="mt-6 p-5 text-left">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-ink">Pembahasan {result.total} soal</p>
                <p className="mt-0.5 text-sm text-subtle">Daftar untuk membuka pembahasan dan ikut peringkat.</p>
              </div>
              <Lock className="size-4 text-subtle" />
            </div>
            <div className="mt-4 flex flex-col gap-2.5" aria-hidden>
              {[90, 70, 84, 58].map((w) => (
                <span key={w} className="h-2 rounded-full bg-surface" style={{ width: `${w}%` }} />
              ))}
            </div>
          </Card>
          {suggestion && (
            <Link href="/pricing" className="mt-5 flex items-center gap-3 rounded-2xl px-1 py-2 text-left hover:bg-sidebar">
              <div className="flex-1">
                <p className="text-xs text-subtle">Paket yang cocok</p>
                <p className="font-semibold text-ink">{suggestion.name}</p>
                <p className="text-xs text-subtle">{rupiahShort(suggestion.price)} / bulan · tryout mingguan</p>
              </div>
              <ChevronRight className="size-4 text-faint" />
            </Link>
          )}
          <LinkButton href="/pricing" variant="accent" size="lg" className="mt-5 w-full">
            Daftar sekarang
          </LinkButton>
          <Button variant="ghost" size="lg" className="mt-2 w-full" onClick={() => window.location.reload()}>
            Ulangi quiz trial
          </Button>
        </main>
      </div>
    );
  }

  const q = questions[i];
  const label = left === null ? "--:--" : `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
  const last = i === questions.length - 1;
  return (
    <div className="min-h-dvh bg-white">
      <Header />
      <main className="mx-auto grid max-w-[1100px] gap-8 px-4 pb-28 pt-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:pb-12">
        <section className="relative min-w-0">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-subtle">Quiz trial · tanpa daftar</p>
              <p className="font-semibold text-ink">
                Soal {i + 1} dari {questions.length}
              </p>
              <div className="mt-2 h-1 rounded-full bg-surface">
                <div className="h-1 rounded-full bg-primary transition-[width]" style={{ width: `${((i + 1) / questions.length) * 100}%` }} />
              </div>
            </div>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-2xl bg-accent-soft px-3 text-[13px] font-semibold tabular-nums text-accent-ink">
              <Timer className="size-4" /> {label}
            </span>
          </div>
          <Rumbi pose="intip" className="absolute right-0 top-16 h-14" />
          <div className="mt-8 flex gap-2">
            <Badge>Soal {i + 1}</Badge>
            <Badge>Pilihan ganda</Badge>
          </div>
          <h1 className="mt-3 pr-16 text-[19px] font-semibold leading-relaxed text-ink">
            <MathText text={q.prompt} />
          </h1>
          <div className="mt-5 flex flex-col gap-2.5">
            {q.options.map((opt, k) => {
              const on = answers[q.id] === String(k);
              return (
                <button key={k} type="button" onClick={() => setAnswers((a) => ({ ...a, [q.id]: String(k) }))} className={`flex min-h-[60px] items-center gap-4 rounded-2xl px-3 py-2.5 text-left text-base text-ink transition ${on ? "border-2 border-primary bg-primary-soft" : "border border-transparent hover:bg-surface"}`}>
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${on ? "bg-primary text-white" : "bg-surface text-ink-2"}`}>{LETTERS[k]}</span>
                  <MathText text={opt} />
                </button>
              );
            })}
          </div>
          <div className="fixed inset-x-0 bottom-0 flex items-center gap-2 border-t border-border bg-white px-4 py-3 lg:static lg:mt-8 lg:border-0 lg:p-0">
            <Button variant="ghost" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
              <ArrowLeft /> <span className="hidden sm:inline">Sebelumnya</span>
            </Button>
            <Button className="ml-auto flex-1 sm:flex-none" onClick={() => (last ? submit() : setI(i + 1))} disabled={pending}>
              {last ? (pending ? "Menilai…" : "Lihat hasil") : "Selanjutnya"} <ChevronRight />
            </Button>
          </div>
        </section>
        <aside className="hidden flex-col gap-4 lg:flex">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <p className="font-semibold text-ink">Quiz trial</p>
              <Badge>Gratis</Badge>
            </div>
            <p className="mt-1 text-sm text-subtle">10 soal acak untuk lihat posisimu sekarang. Hasilnya langsung keluar.</p>
          </Card>
          <div className="flex gap-3 rounded-[20px] bg-accent-soft p-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-accent">
              <Info className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Mau simpan skor?</p>
              <p className="text-xs text-ink-2">Daftar untuk menyimpan skor dan membuka pembahasan tiap soal.</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
