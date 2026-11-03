"use client";

import { ArrowLeft, Check, ChevronRight, Delete, Flag, LayoutGrid, Lightbulb, Timer, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { checkIsian, saveAnswer, submitAttempt, toggleFlag } from "@/app/actions/quiz";
import { MathText } from "@/components/app/math-text";
import { Logo, Rumbi } from "@/components/app/visuals";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export type SessionQuestion = { id: number; type: "pg" | "isian"; prompt: string; options: string[]; hint: string | null };

type Props = {
  attemptId: number;
  title: string;
  exitHref: string;
  questions: SessionQuestion[];
  initialAnswers: Record<string, string>;
  initialFlagged: number[];
  deadline: number;
};

const LETTERS = "ABCDE";

function useCountdown(deadline: number) {
  // null until mounted so the server and first client render agree
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  const left = now === null ? null : Math.max(0, Math.floor((deadline - now) / 1000));
  const label = left === null ? "--:--" : `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
  return { left, label };
}

function NumberGrid({ questions, answers, flagged, current, onPick }: { questions: SessionQuestion[]; answers: Record<string, string>; flagged: number[]; current: number; onPick: (i: number) => void }) {
  return (
    <>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, i) => {
          const isCur = i === current;
          const flag = flagged.includes(q.id);
          const done = answers[q.id] !== undefined;
          const cls = flag
            ? "border border-[#f59e0b] bg-[#fffbeb] text-warning-ink"
            : isCur
              ? "border-2 border-ink bg-white text-ink"
              : done
                ? "bg-primary text-white"
                : "border border-border-2 bg-white text-subtle";
          return (
            <button key={q.id} type="button" onClick={() => onPick(i)} className={`h-11 rounded-xl text-sm font-semibold transition hover:brightness-95 ${cls}`} aria-label={`Soal ${i + 1}`} aria-current={isCur || undefined}>
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-subtle">
        <span className="flex items-center gap-1.5"><i className="size-3 rounded bg-primary" /> Dijawab</span>
        <span className="flex items-center gap-1.5"><i className="size-3 rounded border-2 border-ink" /> Sekarang</span>
        <span className="flex items-center gap-1.5"><i className="size-3 rounded border border-[#f59e0b] bg-[#fffbeb]" /> Ragu-ragu</span>
        <span className="flex items-center gap-1.5"><i className="size-3 rounded border border-border-2" /> Belum</span>
      </div>
    </>
  );
}

export function QuizSession({ attemptId, title, exitHref, questions, initialAnswers, initialFlagged, deadline }: Props) {
  const [i, setI] = useState(() => Math.max(0, questions.findIndex((q) => initialAnswers[q.id] === undefined)));
  const [answers, setAnswers] = useState(initialAnswers);
  const [flagged, setFlagged] = useState(initialFlagged);
  const [gridOpen, setGridOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  // Isian input per soal, and the "Cek jawaban" result of the soal it belongs to.
  const [typedById, setTypedById] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<{ id: number; correct: boolean; expected: string } | null>(null);
  const [submitting, startSubmit] = useTransition();
  const [, startSave] = useTransition();
  const { left, label } = useCountdown(deadline);

  const q = questions[i];
  const typed = typedById[q.id] ?? answers[q.id] ?? "";
  const feedback = checked?.id === q.id ? checked : null;
  const answered = questions.filter((x) => answers[x.id] !== undefined).length;
  const stats = useMemo(() => ({ answered, ragu: flagged.length, empty: questions.length - answered }), [answered, flagged, questions.length]);

  const submit = useCallback(() => startSubmit(() => submitAttempt(attemptId, answers)), [attemptId, answers]);
  useEffect(() => {
    if (left === 0 && !submitting) submit();
  }, [left, submit, submitting]);

  const choose = (opt: string) => {
    setAnswers((a) => ({ ...a, [q.id]: opt }));
    startSave(() => saveAnswer(attemptId, q.id, opt));
  };
  const flag = () => {
    setFlagged((f) => (f.includes(q.id) ? f.filter((x) => x !== q.id) : [...f, q.id]));
    startSave(() => toggleFlag(attemptId, q.id));
  };
  const next = () => (i < questions.length - 1 ? setI(i + 1) : setConfirm(true));
  const check = () => {
    if (!typed || feedback) return;
    setAnswers((a) => ({ ...a, [q.id]: typed }));
    startSave(async () => {
      const r = await checkIsian(attemptId, q.id, typed);
      if (!r) return;
      setChecked({ id: q.id, correct: r.correct, expected: r.expected });
      setTimeout(() => (i < questions.length - 1 ? setI((x) => x + 1) : setConfirm(true)), 1300);
    });
  };
  const key = (k: string) => {
    if (feedback) return;
    const t = typed;
    const next = k === "del" ? t.slice(0, -1) : k === "-" ? (t.startsWith("-") ? t.slice(1) : `-${t}`) : t.length < 7 ? t + k : t;
    setTypedById((m) => ({ ...m, [q.id]: next }));
  };

  const minutesLeft = Math.ceil((left ?? 0) / 60);
  const timerTone = left !== null && left < 60 ? "bg-destructive-soft text-destructive-ink" : "bg-accent-soft text-accent-ink";
  const isFlagged = flagged.includes(q.id);

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center gap-3 px-3 sm:px-6 lg:h-[72px]">
          <Link href={exitHref} aria-label="Keluar (jawaban tersimpan)" className="grid size-10 place-items-center rounded-full text-ink hover:bg-surface lg:hidden">
            <X className="size-5" />
          </Link>
          <div className="hidden lg:block">
            <Logo href={exitHref} className="w-[96px]" />
          </div>
          <div className="min-w-0 flex-1 lg:ml-4 lg:border-l lg:border-border lg:pl-5">
            <p className="truncate text-xs text-subtle">{title}</p>
            <p className="text-[15px] font-semibold text-ink">
              Soal {i + 1} dari {questions.length}
            </p>
          </div>
          <span className={`inline-flex h-8 items-center gap-1.5 rounded-2xl px-3 text-[13px] font-semibold tabular-nums ${timerTone}`} aria-live="off">
            <Timer className="size-4" /> {label}
          </span>
          <button type="button" onClick={() => setConfirm(true)} className="hidden px-3 text-sm font-semibold text-ink hover:text-primary lg:block">
            Kumpulkan
          </button>
        </div>
        <div className="mx-auto h-1 max-w-[1100px] px-3 sm:px-6">
          <div className="h-1 rounded-full bg-surface">
            <div className="h-1 rounded-full bg-primary transition-[width]" style={{ width: `${((i + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1100px] gap-8 px-4 pb-32 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:pb-12 lg:pt-8">
        <section className="relative min-w-0">
          <Rumbi pose="intip" className="absolute -top-2 right-0 h-14" />
          <div className="flex gap-2">
            <span className="rounded-xl bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink-2">Soal {i + 1}</span>
            <span className="rounded-xl bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink-2">{q.type === "isian" ? "Isian angka" : "Pilihan ganda"}</span>
          </div>

          {q.type === "pg" ? (
            <>
              <h1 className="mt-3 pr-16 text-[19px] font-semibold leading-relaxed text-ink">
                <MathText text={q.prompt} />
              </h1>
              <div className="mt-5 flex flex-col gap-2.5" role="radiogroup">
                {q.options.map((opt, k) => {
                  const on = answers[q.id] === String(k);
                  return (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => choose(String(k))}
                      className={`flex min-h-[60px] items-center gap-4 rounded-2xl px-3 py-2.5 text-left text-base text-ink transition ${
                        on ? "border-2 border-primary bg-primary-soft" : "border border-transparent hover:bg-surface"
                      }`}
                    >
                      <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${on ? "bg-primary text-white" : "bg-surface text-ink-2"}`}>{LETTERS[k]}</span>
                      <MathText text={opt} />
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-[420px] pt-6 text-center lg:mx-0 lg:text-left">
              <p className="text-[34px] font-bold leading-tight text-ink sm:text-[40px]">
                <MathText text={q.prompt} />
              </p>
              <p className={`mt-4 h-12 text-[34px] font-bold tabular-nums ${feedback ? (feedback.correct ? "text-success" : "text-destructive") : "text-ink"}`}>{typed || <span className="text-faint">…</span>}</p>
              {feedback ? (
                <p className={`mt-2 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold ${feedback.correct ? "bg-success-soft text-success-ink" : "bg-destructive-soft text-destructive-ink"}`}>
                  {feedback.correct ? <Check className="size-4" /> : <X className="size-4" />}
                  {feedback.correct ? "Benar!" : `Belum tepat, jawabannya ${feedback.expected}`}
                </p>
              ) : (
                q.hint && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-subtle">
                    <Lightbulb className="size-4" /> {q.hint}
                  </p>
                )
              )}
              <div className="mt-8">
                <Button size="lg" className="w-full" onClick={check} disabled={!typed || !!feedback}>
                  Cek jawaban
                </Button>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "0", "del"].map((k) => (
                    <button key={k} type="button" onClick={() => key(k)} className="grid h-12 place-items-center rounded-xl bg-white text-xl font-semibold text-ink shadow-[0_1px_0_#e3e5f0,0_0_0_1px_#eceef5] active:bg-surface" aria-label={k === "del" ? "Hapus" : k}>
                      {k === "del" ? <Delete className="size-5" /> : k === "-" ? "−" : k}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 hidden items-center gap-2 lg:flex">
            {q.type === "pg" && (
              <Button variant="ghost" onClick={flag} className={isFlagged ? "!bg-warning-soft !text-warning-ink" : ""}>
                <Flag /> Ragu-ragu
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
                <ArrowLeft /> Sebelumnya
              </Button>
              {q.type === "pg" && (
                <Button onClick={next}>
                  {i === questions.length - 1 ? "Selesai" : "Selanjutnya"} <ChevronRight />
                </Button>
              )}
            </div>
          </div>
        </section>

        <aside className="hidden lg:block">
          <div className="rounded-[20px] border border-border-2 p-5 shadow-panel">
            <p className="font-semibold text-ink">Daftar soal</p>
            <p className="mb-4 mt-0.5 text-xs text-subtle">
              {stats.answered} dijawab · {stats.ragu} ragu-ragu · {stats.empty} belum
            </p>
            <NumberGrid questions={questions} answers={answers} flagged={flagged} current={i} onPick={setI} />
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Rumbi pose="mikir" className="h-14" />
            <p className="text-xs text-ink">Belum yakin? Tandai ragu-ragu, lanjut dulu, nanti balik lagi.</p>
          </div>
        </aside>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t border-border bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <button type="button" onClick={() => setGridOpen(true)} className="grid size-11 place-items-center rounded-full text-ink hover:bg-surface" aria-label="Daftar soal">
          <LayoutGrid className="size-5" />
        </button>
        {q.type === "pg" ? (
          <>
            <Button variant="ghost" onClick={flag} className={isFlagged ? "!bg-warning-soft !text-warning-ink" : ""}>
              <Flag /> Ragu-ragu
            </Button>
            <Button onClick={next} className="ml-auto">
              {i === questions.length - 1 ? "Selesai" : "Selanjutnya"} <ChevronRight />
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => setConfirm(true)} className="ml-auto">
            Kumpulkan
          </Button>
        )}
      </div>

      <Dialog open={gridOpen} onClose={() => setGridOpen(false)} side title="Daftar soal" description={`${stats.answered} dijawab · ${stats.ragu} ragu-ragu · ${stats.empty} belum`}>
        <NumberGrid questions={questions} answers={answers} flagged={flagged} current={i} onPick={(n) => (setI(n), setGridOpen(false))} />
        <Button variant="ghost" className="mt-5 w-full" onClick={() => (setGridOpen(false), setConfirm(true))}>
          Kumpulkan jawaban
        </Button>
      </Dialog>

      <Dialog open={confirm} onClose={() => setConfirm(false)} side size="sm">
        <div className="flex items-start gap-4">
          <Rumbi pose="mikir" className="h-20 shrink-0" />
          <div>
            <p className="text-lg font-semibold text-ink">Kumpulkan sekarang?</p>
            <p className="mt-1 text-sm text-subtle">Waktumu masih {minutesLeft} menit. Setelah dikumpulkan, jawaban tidak bisa diubah.</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border-2 py-3 text-center">
          {[
            ["Dijawab", stats.answered],
            ["Ragu-ragu", stats.ragu],
            ["Kosong", stats.empty],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-subtle">{k}</p>
              <p className="text-lg font-semibold text-ink">{v}</p>
            </div>
          ))}
        </div>
        <Button variant="accent" size="lg" className="mt-5 w-full" onClick={submit} disabled={submitting}>
          {submitting ? "Menilai…" : "Kumpulkan"}
        </Button>
        <Button variant="ghost" className="mt-2 w-full" onClick={() => setConfirm(false)}>
          Cek lagi
        </Button>
      </Dialog>
    </div>
  );
}
