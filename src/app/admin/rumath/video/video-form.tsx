"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveVideo, type FormState } from "@/app/actions/admin";
import { Button, buttonClass } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import { duration } from "@/lib/format";
import { RUMATH_JENIS } from "@/lib/rumath";

type Initial = { id: number; title: string; bidang: string; jenjang: string; durationSec: number; url: string; description: string | null; position: number; status: string };

export function VideoForm({ initial }: { initial?: Initial }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveVideo.bind(null, initial?.id ?? null), {});
  return (
    <form action={action}>
      <div className="mb-4 flex justify-end gap-2">
        <Link href="/admin/rumath" className={buttonClass({ variant: "ghost" })}>
          Batal
        </Link>
        <Button type="submit" name="intent" value="draft" variant="secondary" disabled={pending}>
          Simpan draf
        </Button>
        <Button type="submit" name="intent" value="publish" disabled={pending}>
          {pending ? "Menyimpan…" : "Publish"}
        </Button>
      </div>
      {state.error && <p className="mb-4 rounded-xl bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive-ink">{state.error}</p>}
      <Card className="grid max-w-[760px] gap-4 p-6 sm:grid-cols-2">
        <Field label="Judul video" htmlFor="title" className="sm:col-span-2">
          <Input id="title" name="title" defaultValue={initial?.title} placeholder="Penjumlahan bersusun" required />
        </Field>
        <Field label="Jenis" htmlFor="jenis">
          <Select id="jenis" name="jenis" defaultValue={initial?.bidang ?? "Penjumlahan"}>
            {RUMATH_JENIS.map((j) => (
              <option key={j.name}>{j.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Jenjang" htmlFor="jenjang">
          <Select id="jenjang" name="jenjang" defaultValue={initial?.jenjang ?? "SMP"}>
            <option>SD</option>
            <option>SMP</option>
          </Select>
        </Field>
        <Field label="Durasi (mm:dd)" htmlFor="duration">
          <Input id="duration" name="duration" defaultValue={initial ? duration(initial.durationSec) : "5:00"} placeholder="8:24" />
        </Field>
        <Field label="Urutan" htmlFor="position" hint="Video ke-berapa di jenis ini.">
          <Input id="position" name="position" type="number" min={1} defaultValue={initial?.position ?? 1} />
        </Field>
        <Field label="Link video" htmlFor="url" hint="YouTube/Drive. Kosongkan untuk video contoh preview." className="sm:col-span-2">
          <Input id="url" name="url" type="url" defaultValue={initial?.url} placeholder="https://youtu.be/…" />
        </Field>
        <Field label="Deskripsi" htmlFor="description" className="sm:col-span-2">
          <Textarea id="description" name="description" defaultValue={initial?.description ?? ""} />
        </Field>
      </Card>
    </form>
  );
}
