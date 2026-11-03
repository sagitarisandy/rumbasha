"use client";

import { Check, Plus, X } from "lucide-react";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { saveSoal, type FormState } from "@/app/actions/admin";
import { CurriculumFields } from "@/components/admin/curriculum-fields";
import { MathText } from "@/components/app/math-text";
import { Button, buttonClass } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";

type Initial = { id: number; type: "pg" | "isian"; prompt: string; options: string[]; answer: string; explanation: string | null; level: string; jenjang: string; grade: number; subject: string; bidang: string; bab: string; tag: string | null };

const INSERTS: [string, string][] = [
  ["a/b", "$\\f{a}{b}$"],
  ["x²", "$x^2$"],
  ["√", "$\\sqrt{x}$"],
  ["π", "$\\pi$"],
  ["×", "$\\times$"],
  ["÷", "$\\div$"],
];

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-b border-border-2 py-6 lg:grid-cols-[200px_1fr]">
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-[13px] text-subtle">{hint}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function SoalForm({ initial, defaultType = "pg" }: { initial?: Initial; defaultType?: "pg" | "isian" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSoal.bind(null, initial?.id ?? null), {});
  const [type, setType] = useState<"pg" | "isian">(initial?.type ?? defaultType);
  const [prompt, setPrompt] = useState(initial?.prompt ?? (defaultType === "isian" ? "$48 + 37 = ?$" : "Hasil dari $\\f{2}{3} + \\f{1}{4}$ adalah …"));
  const [options, setOptions] = useState<string[]>(initial?.type === "pg" ? initial.options : ["$\\f{11}{12}$", "$\\f{5}{12}$", "$\\f{3}{7}$", "$\\f{8}{12}$", "1"]);
  const [answer, setAnswer] = useState(initial?.type === "pg" ? initial.answer : "0");
  const area = useRef<HTMLTextAreaElement>(null);
  const usage = (initial?.tag ?? (defaultType === "isian" ? "RUMATH" : "Daily Quiz,Uji Kom")).split(",");

  const insert = (snippet: string) => {
    const el = area.current;
    if (!el) return;
    const [a, b] = [el.selectionStart, el.selectionEnd];
    const next = prompt.slice(0, a) + snippet + prompt.slice(b);
    setPrompt(next);
    requestAnimationFrame(() => el.focus());
  };

  return (
    <form action={action}>
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="answer" value={answer} />
      <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
        <Link href="/admin/questions" className={buttonClass({ variant: "ghost" })}>
          Batal
        </Link>
        {!initial && (
          <Button type="submit" name="intent" value="lagi" variant="secondary" disabled={pending}>
            Simpan & tambah lagi
          </Button>
        )}
        <Button type="submit" name="intent" value="simpan" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan soal"}
        </Button>
      </div>
      {state.error && <p className="rounded-xl bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive-ink">{state.error}</p>}
      {state.ok && <p className="rounded-xl bg-success-soft px-3 py-2 text-sm font-semibold text-success-ink">{state.message}</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <Section title="Tipe soal" hint="Tampilan opsi jawaban mengikuti tipe.">
            <div className="grid max-w-[420px] grid-cols-2 gap-2">
              {(
                [
                  ["pg", "Pilihan ganda"],
                  ["isian", "Isian angka"],
                ] as const
              ).map(([v, l]) => (
                <button key={v} type="button" onClick={() => setType(v)} className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold ${type === v ? "bg-primary-soft text-ink" : "text-ink-2 hover:bg-surface"}`}>
                  <span className={`size-2 rounded-full ${type === v ? "bg-primary" : "bg-transparent"}`} /> {l}
                </button>
              ))}
            </div>
          </Section>
          <Section title="Letak soal" hint="Dipakai untuk generate Daily Quiz otomatis.">
            <CurriculumFields initial={initial} />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Level" htmlFor="level">
                <Select id="level" name="level" defaultValue={initial?.level ?? "Mudah"}>
                  <option>Mudah</option>
                  <option>Sedang</option>
                  <option>Sulit</option>
                </Select>
              </Field>
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">Dipakai untuk</p>
                <div className="flex flex-wrap gap-4">
                  {["Daily Quiz", "Uji Kom", "Tryout", "RUMATH"].map((u) => (
                    <Checkbox key={u} name="usage" value={u} defaultChecked={usage.includes(u)} label={u} />
                  ))}
                </div>
              </div>
            </div>
          </Section>
          <Section title="Pertanyaan" hint="Rumus ditulis di antara tanda $ … $.">
            <div className="rounded-xl border border-border focus-within:border-primary">
              <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
                {INSERTS.map(([l, s]) => (
                  <button key={l} type="button" onClick={() => insert(s)} className="h-8 rounded-lg px-2 font-math text-sm hover:bg-surface">
                    {l}
                  </button>
                ))}
                <span className="ml-auto pr-1 text-xs text-subtle">Rumus</span>
              </div>
              <textarea ref={area} name="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className="w-full resize-y rounded-b-xl px-3.5 py-2.5 font-mono text-[13px] text-ink outline-none" required />
            </div>
            <p className="mt-2 text-sm text-ink">
              <MathText text={prompt} />
            </p>
          </Section>
          <Section title={type === "pg" ? "Opsi jawaban" : "Kunci jawaban"} hint={type === "pg" ? "Klik huruf untuk jadikan kunci." : "Angka yang harus diketik siswa."}>
            {type === "pg" ? (
              <div className="flex flex-col gap-2">
                {options.map((o, k) => (
                  <div key={k} className="flex items-center gap-2">
                    <button type="button" onClick={() => setAnswer(String(k))} className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${answer === String(k) ? "bg-success text-white" : "bg-surface text-ink-2"}`} aria-label={`Jadikan ${"ABCDE"[k]} kunci`}>
                      {"ABCDE"[k]}
                    </button>
                    <Input name="option" value={o} onChange={(e) => setOptions(options.map((x, j) => (j === k ? e.target.value : x)))} className="font-mono text-[13px]" />
                    {answer === String(k) && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-success-soft px-2 py-1 text-xs font-semibold text-success-ink">
                        <Check className="size-3" /> Kunci
                      </span>
                    )}
                    {options.length > 2 && (
                      <button type="button" onClick={() => (setOptions(options.filter((_, j) => j !== k)), setAnswer("0"))} className="grid size-8 shrink-0 place-items-center rounded-full text-subtle hover:bg-surface" aria-label="Hapus opsi">
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
                {options.length < 5 && (
                  <Button variant="ghost" size="sm" className="w-fit" onClick={() => setOptions([...options, ""])}>
                    <Plus /> Tambah opsi
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid max-w-[420px] gap-4 sm:grid-cols-2">
                <Field label="Kunci" htmlFor="answerValue">
                  <Input id="answerValue" name="answerValue" inputMode="numeric" defaultValue={initial?.type === "isian" ? initial.answer : ""} />
                </Field>
                <Field label="Petunjuk (opsional)" htmlFor="hint">
                  <Input id="hint" name="hint" defaultValue={initial?.type === "isian" ? initial.options[0] : ""} placeholder="Hitung satuannya dulu" />
                </Field>
              </div>
            )}
          </Section>
          <Section title="Pembahasan" hint="Tampil setelah siswa mengumpulkan.">
            <Textarea name="explanation" defaultValue={initial?.explanation ?? ""} placeholder="Samakan penyebut. KPK dari 3 dan 4 adalah 12. …" />
          </Section>
        </div>

        <aside className="xl:pt-6">
          <div className="sticky top-28 rounded-[24px] border border-border-2 p-4 shadow-panel">
            <p className="font-semibold text-ink">Pratinjau</p>
            <p className="text-xs text-subtle">Tampilan di HP siswa</p>
            <div className="mt-3 rounded-2xl bg-sidebar p-4">
              <p className="text-[15px] font-semibold leading-relaxed text-ink">
                <MathText text={prompt} />
              </p>
              {type === "pg" ? (
                <div className="mt-3 flex flex-col gap-1.5">
                  {options.map((o, k) => (
                    <div key={k} className={`flex min-h-11 items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm ${answer === String(k) ? "bg-white ring-1 ring-success" : "bg-white"}`}>
                      <span className="grid size-7 place-items-center rounded-lg bg-surface text-xs font-bold text-ink-2">{"ABCDE"[k]}</span>
                      <MathText text={o || "…"} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-center text-2xl font-bold text-faint">…</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
