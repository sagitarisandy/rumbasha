import { and, eq } from "drizzle-orm";
import { ArrowLeft, ArrowRight, BookOpen, Check, Play, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MathText } from "@/components/app/math-text";
import { MobileBar, SiswaPage } from "@/components/siswa/shell";
import { Badge, Card } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { requireSiswa } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { materials } from "@/lib/db/schema";
import { loadResult } from "@/lib/queries/hasil";

const LETTERS = "ABCDE";

export default async function PembahasanPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ n?: string; f?: string }> }) {
  const user = await requireSiswa();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const r = await loadResult(Number(id), user.id);
  if (!r) notFound();
  const filter = sp.f === "salah" || sp.f === "benar" ? sp.f : "semua";
  const visible = r.items.map((it, idx) => ({ ...it, idx })).filter((it) => filter === "semua" || (filter === "salah" ? it.status !== "benar" : it.status === "benar"));
  const cur = visible.find((it) => it.idx === Number(sp.n ?? -1) - 1) ?? visible[0];
  const pos = cur ? visible.indexOf(cur) : -1;
  const href = (n: number, f = filter) => `/siswa/hasil/${id}/pembahasan?n=${n}${f !== "semua" ? `&f=${f}` : ""}`;

  const db = await getDb();
  const [mat] = cur ? await db.select({ id: materials.id }).from(materials).where(and(eq(materials.bab, cur.q.bab), eq(materials.status, "publish"))).limit(1) : [];
  const steps = (cur?.q.explanation ?? "").split(/(?<=\.)\s+(?=[A-Z$])/).filter(Boolean);
  const tone = { benar: "bg-success-soft text-success-ink", salah: "bg-destructive-soft text-destructive-ink", kosong: "bg-surface text-subtle" } as const;

  return (
    <SiswaPage header={<MobileBar title="Pembahasan" back={`/siswa/hasil/${id}`} />}>
      <div className="mx-auto max-w-[680px]">
        <h1 className="mb-3 hidden text-[24px] font-semibold text-ink lg:block">Pembahasan · {r.quiz.title}</h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">{r.benar} benar</Badge>
          <Badge variant="danger">{r.salah} salah</Badge>
          <Badge>{r.kosong} kosong</Badge>
        </div>
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {r.items.map((it, n) => (
            <Link key={it.q.id} href={href(n + 1, "semua")} scroll={false} className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-semibold ${tone[it.status]} ${cur?.idx === n ? "ring-2 ring-ink" : ""}`}>
              {n + 1}
            </Link>
          ))}
        </div>
        <Segmented
          className="mt-4"
          value={filter}
          items={[
            { value: "semua", label: "Semua", href: href(1, "semua") },
            { value: "salah", label: `Salah (${r.salah + r.kosong})`, href: `/siswa/hasil/${id}/pembahasan?f=salah` },
            { value: "benar", label: `Benar (${r.benar})`, href: `/siswa/hasil/${id}/pembahasan?f=benar` },
          ]}
        />

        {cur ? (
          <>
            <div className="mt-5 flex items-center gap-2">
              <Badge>Soal {cur.idx + 1}</Badge>
              <Badge variant={cur.status === "benar" ? "success" : cur.status === "salah" ? "danger" : "secondary"}>{cur.status === "benar" ? "Benar" : cur.status === "salah" ? "Salah" : "Kosong"}</Badge>
            </div>
            <p className="mt-3 text-[18px] font-semibold leading-relaxed text-ink">
              <MathText text={cur.q.prompt} />
            </p>
            {cur.q.type === "pg" ? (
              <div className="mt-4 flex flex-col gap-2">
                {cur.q.options.map((opt, k) => {
                  const key = String(k) === cur.q.answer;
                  const mine = String(k) === cur.given;
                  const cls = key ? "border-2 border-success bg-[#e9f7ef]" : mine ? "border-2 border-destructive bg-destructive-soft" : "border border-transparent";
                  return (
                    <div key={k} className={`flex min-h-[56px] items-center gap-3 rounded-2xl px-3 py-2 ${cls}`}>
                      <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${key ? "bg-success text-white" : mine ? "bg-destructive text-white" : "bg-surface text-ink-2"}`}>{LETTERS[k]}</span>
                      <span className="flex-1 text-ink">
                        <MathText text={opt} />
                      </span>
                      {key && <Badge variant="success"><Check /> Kunci</Badge>}
                      {mine && !key && <Badge variant="danger"><X /> Jawabanmu</Badge>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border-2 border-success bg-[#e9f7ef] p-3">
                  <p className="text-xs text-success-ink">Kunci</p>
                  <p className="text-xl font-bold text-ink">{cur.q.answer}</p>
                </div>
                <div className={`rounded-2xl border-2 p-3 ${cur.status === "benar" ? "border-success bg-[#e9f7ef]" : "border-destructive bg-destructive-soft"}`}>
                  <p className="text-xs text-subtle">Jawabanmu</p>
                  <p className="text-xl font-bold text-ink">{cur.given ?? "–"}</p>
                </div>
              </div>
            )}

            <Card className="mt-5 p-5">
              <p className="font-semibold text-ink">Pembahasan</p>
              <p className="text-xs text-subtle">Ditulis tutor Rumbasha</p>
              <ol className="mt-3 flex flex-col gap-3">
                {steps.map((s, n) => (
                  <li key={n} className="flex gap-3 text-sm text-ink">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface text-xs font-semibold text-ink-2">{n + 1}</span>
                    <span className="pt-0.5">
                      <MathText text={s} />
                    </span>
                  </li>
                ))}
              </ol>
              {r.quiz.kind !== "rumath" && (
                <Link href="/siswa/rumath" className="mt-4 flex items-center gap-3 rounded-2xl bg-surface p-3 hover:bg-primary-soft">
                  <span className="grid size-9 place-items-center rounded-xl bg-ink text-white">
                    <Play className="size-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-ink">Video pembahasan</span>
                    <span className="text-xs text-subtle">3 menit</span>
                  </span>
                  <ArrowRight className="size-4 text-subtle" />
                </Link>
              )}
            </Card>

            <div className="mt-6 flex items-center justify-between">
              {pos > 0 ? (
                <Link href={href(visible[pos - 1].idx + 1)} className="grid size-11 place-items-center rounded-full bg-surface text-ink" aria-label="Soal sebelumnya">
                  <ArrowLeft className="size-5" />
                </Link>
              ) : (
                <span className="size-11" />
              )}
              {mat && (
                <Link href={`/siswa/modul/${mat.id}`} className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-primary">
                  <BookOpen className="size-4" /> Baca materi
                </Link>
              )}
              {pos < visible.length - 1 ? (
                <Link href={href(visible[pos + 1].idx + 1)} className="grid size-11 place-items-center rounded-full bg-primary text-white shadow-btn" aria-label="Soal berikutnya">
                  <ArrowRight className="size-5" />
                </Link>
              ) : (
                <span className="size-11" />
              )}
            </div>
          </>
        ) : (
          <p className="mt-8 text-center text-sm text-subtle">Tidak ada soal di filter ini.</p>
        )}
      </div>
    </SiswaPage>
  );
}
