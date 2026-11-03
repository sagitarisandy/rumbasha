"use client";

import { Clock, GripVertical, Send } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { publishLanding, saveHero, updateLanding, type FormState, type Landing, type LandingSection } from "@/app/actions/admin";
import { StatusDot } from "@/components/admin/table";
import { RowActions } from "@/components/admin/toolbar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import { TZ } from "@/lib/format";

export function PublishButton({ disabled }: { disabled: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button disabled={disabled || pending} onClick={() => start(async () => void (await publishLanding()))}>
      <Send /> {pending ? "Mempublish…" : "Publish"}
    </Button>
  );
}

export function LandingEditor({ initial, hero }: { initial: Landing; hero: { title: string; subtitle: string; cta: string; ctaHref: string } }) {
  const [sections, setSections] = useState<LandingSection[]>(initial.sections);
  const [drag, setDrag] = useState<number | null>(null);
  const [heroOpen, setHeroOpen] = useState(false);
  const [, start] = useTransition();
  const [heroState, heroAction, heroPending] = useActionState<FormState, FormData>(async (p, f) => {
    const r = await saveHero(p, f);
    if (r.ok) setHeroOpen(false);
    return r;
  }, {});

  const commit = (next: LandingSection[], change: string) => {
    setSections(next);
    start(async () => void (await updateLanding(next, change)));
  };
  const toggle = (i: number) => {
    const next = sections.map((s, j) => (j === i ? { ...s, visible: !s.visible } : s));
    commit(next, `${sections[i].name} · ${next[i].visible ? "ditampilkan" : "disembunyikan"}`);
  };
  const drop = (to: number) => {
    if (drag === null || drag === to) return;
    const next = [...sections];
    const [moved] = next.splice(drag, 1);
    next.splice(to, 0, moved);
    setDrag(null);
    commit(next, "Urutan section diubah");
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="divide-y divide-border-2 rounded-[20px] border border-border-2">
        {sections.map((s, i) => (
          <div
            key={s.key}
            draggable
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drop(i)}
            className={`flex items-center gap-3 px-4 py-3.5 ${drag === i ? "opacity-50" : ""}`}
          >
            <GripVertical className="size-4 cursor-grab text-faint" aria-hidden />
            <span className="w-5 text-sm text-subtle">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{s.name}</p>
              <p className="text-xs text-subtle">{s.desc}</p>
            </div>
            {s.visible ? <StatusDot tone="green">Tampil</StatusDot> : <StatusDot tone="grey">Disembunyikan</StatusDot>}
            <label className="inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                role="switch"
                checked={s.visible}
                onChange={() => toggle(i)}
                aria-label={`Tampilkan ${s.name}`}
                className="relative h-[22px] w-[38px] cursor-pointer appearance-none rounded-full bg-[#d6d8e8] transition before:absolute before:left-[3px] before:top-[3px] before:size-4 before:rounded-full before:bg-white before:shadow before:transition checked:bg-primary checked:before:translate-x-4"
              />
            </label>
            {s.key === "hero" ? <RowActions what="Hero" onEdit={() => setHeroOpen(true)} /> : <span className="w-[72px]" />}
          </div>
        ))}
      </div>
      <Card className="h-fit p-5">
        <p className="font-semibold text-ink">{initial.changes.length ? "Belum dipublish" : "Sudah dipublish"}</p>
        {initial.changes.length > 0 ? (
          <>
            <p className="text-[13px] text-subtle">Perubahan menunggu publish</p>
            <ul className="mt-3 space-y-1 rounded-xl bg-sidebar p-3 text-[13px] text-ink">
              {initial.changes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-[13px] text-subtle">Tidak ada perubahan baru.</p>
        )}
        <p className="mt-3 flex items-center gap-1.5 text-xs text-subtle">
          <Clock className="size-3.5" /> Terakhir publish {new Date(initial.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: TZ })} oleh {initial.publishedBy}
        </p>
      </Card>

      <Dialog open={heroOpen} onClose={() => setHeroOpen(false)} title="Edit Hero" description="Bagian paling atas Beranda.">
        <form action={heroAction} className="flex flex-col gap-4">
          <Field label="Judul" htmlFor="h-title">
            <Input id="h-title" name="title" defaultValue={hero.title} required />
          </Field>
          <Field label="Subjudul" htmlFor="h-sub">
            <Textarea id="h-sub" name="subtitle" defaultValue={hero.subtitle} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Teks tombol" htmlFor="h-cta">
              <Input id="h-cta" name="cta" defaultValue={hero.cta} />
            </Field>
            <Field label="Link tombol" htmlFor="h-href">
              <Input id="h-href" name="ctaHref" defaultValue={hero.ctaHref} />
            </Field>
          </div>
          {heroState.error && <p className="text-sm font-semibold text-destructive">{heroState.error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setHeroOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={heroPending}>
              Simpan
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
