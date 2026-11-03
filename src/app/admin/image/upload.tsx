"use client";

import { Check, Link2, Upload } from "lucide-react";
import { useActionState, useState } from "react";
import { uploadImages, type FormState } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Select } from "@/components/ui/form";

export function UploadButton() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [state, action, pending] = useActionState<FormState, FormData>(uploadImages, {});
  return (
    <>
      <Button onClick={() => (setFiles([]), setOpen(true))}>
        <Upload /> Upload gambar
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Upload gambar" description="PNG, JPG, WebP, atau SVG. Maksimal 2 MB per file.">
        <form action={action} className="flex flex-col gap-4">
          <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-[#c9cbe0] px-6 py-8 text-center hover:bg-sidebar">
            <Upload className="size-6 text-subtle" />
            <span className="mt-2 text-sm font-semibold text-ink">{files.length ? `${files.length} file dipilih` : "Pilih atau tarik gambar ke sini"}</span>
            <span className="text-xs text-subtle">{files.map((f) => f.name).join(", ")}</span>
            <input type="file" name="files" multiple accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" className="sr-only" onChange={(e) => setFiles([...(e.target.files ?? [])])} />
          </label>
          <Field label="Kategori" htmlFor="folder">
            <Select id="folder" name="folder" defaultValue="Soal">
              {["Soal", "Materi", "Banner", "Landing"].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </Select>
          </Field>
          {state.error && <p className="text-sm font-semibold text-destructive">{state.error}</p>}
          {state.ok && <p className="rounded-xl bg-success-soft px-3 py-2 text-sm font-semibold text-success-ink">{state.message}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Tutup
            </Button>
            <Button type="submit" disabled={pending || !files.length}>
              {pending ? "Mengupload…" : "Upload"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export function CopyLink({ id }: { id: number }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(`${location.origin}/api/images/${id}`);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      aria-label="Salin link gambar"
      className="grid size-8 place-items-center rounded-full bg-white text-ink shadow-tab"
    >
      {done ? <Check className="size-3.5 text-success" /> : <Link2 className="size-3.5" />}
    </button>
  );
}
