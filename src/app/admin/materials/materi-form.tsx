"use client";

import { FileUp } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveMateri, type FormState } from "@/app/actions/admin";
import { CurriculumFields } from "@/components/admin/curriculum-fields";
import { Button, buttonClass } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";

type Initial = { id: number; title: string; summary: string | null; pages: number; jenjang: string; grade: number; subject: string; bidang: string; bab: string; status: string };

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-b border-border-2 py-6 lg:grid-cols-[260px_1fr]">
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-[13px] text-subtle">{hint}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function MateriForm({ initial }: { initial?: Initial }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveMateri.bind(null, initial?.id ?? null), {});
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);

  return (
    <form action={action}>
      <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
        <Link href="/admin/materials" className={buttonClass({ variant: "ghost" })}>
          Batal
        </Link>
        <Button type="submit" name="intent" value="draft" variant="secondary" disabled={pending}>
          Simpan sebagai draf
        </Button>
        <Button type="submit" name="intent" value="publish" disabled={pending}>
          {pending ? "Menyimpan…" : initial?.status === "publish" ? "Simpan" : "Publish"}
        </Button>
      </div>
      {state.error && <p className="rounded-xl bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive-ink">{state.error}</p>}

      <Section title="Letak materi" hint="Menentukan posisi PDF di filter level siswa.">
        <CurriculumFields initial={initial} />
      </Section>
      <Section title="Info PDF" hint="Judul dan deskripsi singkat.">
        <div className="flex flex-col gap-4">
          <Field label="Judul PDF" htmlFor="title" hint="Dipakai juga untuk pencarian siswa.">
            <Input id="title" name="title" defaultValue={initial?.title} placeholder="Contoh: Penjumlahan Pecahan" required />
          </Field>
          <Field label={<span>Deskripsi <span className="font-normal text-subtle">(opsional)</span></span>} htmlFor="summary">
            <Textarea id="summary" name="summary" defaultValue={initial?.summary ?? ""} placeholder="Tampil di bawah judul pada halaman Modul." />
          </Field>
          <Field label="Jumlah halaman" htmlFor="pages" hint="Terisi otomatis dari file PDF bila diupload.">
            <Input id="pages" name="pages" type="number" min={1} defaultValue={initial?.pages ?? 12} className="max-w-[160px]" />
          </Field>
        </div>
      </Section>
      <Section title="File" hint="Format PDF, maksimal 20 MB.">
        <label
          onDragOver={(e) => (e.preventDefault(), setDrag(true))}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files[0];
            if (f) {
              setFile(f);
              const input = e.currentTarget.querySelector("input") as HTMLInputElement;
              const dt = new DataTransfer();
              dt.items.add(f);
              input.files = dt.files;
            }
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${drag ? "border-primary bg-primary-soft" : "border-[#c9cbe0] hover:bg-sidebar"}`}
        >
          <FileUp className="size-6 text-subtle" />
          <p className="mt-2 text-sm font-semibold text-ink">{file ? file.name : "Tarik file PDF ke sini atau klik untuk pilih"}</p>
          <p className="text-xs text-subtle">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : initial ? "Kosongkan kalau tidak mengganti file." : "Preview: isi halaman dibuat otomatis kalau file tidak diupload."}</p>
          <input type="file" name="file" accept="application/pdf" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
      </Section>
    </form>
  );
}
