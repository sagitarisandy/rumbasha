"use client";

import { useActionState, useState, type ReactNode } from "react";
import { changePassword, type ProfileState } from "@/app/actions/siswa";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/form";

export function PasswordDialog({ className, children }: { className: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ProfileState, FormData>(changePassword, {});
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`w-full ${className}`}>
        {children}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Ubah kata sandi" description="Minimal 8 karakter. Jangan bagikan ke teman." size="sm" side>
        {state.ok ? (
          <div className="py-4 text-center">
            <p className="font-semibold text-success-ink">Kata sandi sudah diganti.</p>
            <Button className="mt-4" onClick={() => setOpen(false)}>
              Tutup
            </Button>
          </div>
        ) : (
          <form action={action} className="flex flex-col gap-4">
            <Field label="Kata sandi lama" htmlFor="current">
              <Input id="current" name="current" type="password" autoComplete="current-password" required />
            </Field>
            <Field label="Kata sandi baru" htmlFor="next">
              <Input id="next" name="next" type="password" autoComplete="new-password" minLength={8} required />
            </Field>
            <Field label="Ulangi kata sandi baru" htmlFor="confirm" error={state.error}>
              <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
            </Field>
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Menyimpan…" : "Simpan"}
            </Button>
          </form>
        )}
      </Dialog>
    </>
  );
}
