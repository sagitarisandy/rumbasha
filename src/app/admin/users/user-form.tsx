"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveUser, type FormState } from "@/app/actions/admin";
import { Button, buttonClass } from "@/components/ui/button";
import { Field, Input, Select, Switch } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import { CABANG, SEKOLAH_SD, SEKOLAH_SMP } from "@/lib/catalog";

type Initial = { id: number; role: string; name: string; email: string; phone: string | null; grade: number | null; school: string | null; branch: string | null; packageId: number | null; active: boolean };

export function UserForm({ initial, packages, canSuper }: { initial?: Initial; packages: { id: number; name: string }[]; canSuper: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveUser.bind(null, initial?.id ?? null), {});
  const [role, setRole] = useState(initial?.role ?? "siswa");
  return (
    <form action={action}>
      <div className="mb-4 flex justify-end gap-2">
        <Link href="/admin/users" className={buttonClass({ variant: "ghost" })}>
          Batal
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : initial ? "Simpan perubahan" : "Buat akun"}
        </Button>
      </div>
      {state.error && <p className="mb-4 rounded-xl bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive-ink">{state.error}</p>}
      {state.ok && <p className="mb-4 rounded-xl bg-success-soft px-3 py-2 text-sm font-semibold text-success-ink">{state.message}</p>}
      <Card className="grid max-w-[760px] gap-4 p-6 sm:grid-cols-2">
        <Field label="Role" htmlFor="role">
          <Select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="siswa">Siswa</option>
            <option value="tutor">Tutor</option>
            <option value="admin">Admin</option>
            {canSuper && <option value="super">Super Admin</option>}
          </Select>
        </Field>
        <div className="flex items-end pb-2">
          <Switch name="active" defaultChecked={initial?.active ?? true} label="Akun aktif" />
        </div>
        <Field label="Nama lengkap" htmlFor="name">
          <Input id="name" name="name" defaultValue={initial?.name} required />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={initial?.email} required />
        </Field>
        <Field label="No. WhatsApp" htmlFor="phone">
          <Input id="phone" name="phone" inputMode="tel" defaultValue={initial?.phone ?? ""} />
        </Field>
        <Field label={initial ? "Kata sandi baru" : "Kata sandi awal"} htmlFor="password" hint={initial ? "Kosongkan kalau tidak diganti." : "Minimal 8 karakter. Siswa bisa menggantinya di Profil."}>
          <Input id="password" name="password" type="text" autoComplete="new-password" defaultValue={initial ? "" : "rumbasha123"} />
        </Field>
        {role === "siswa" ? (
          <>
            <Field label="Kelas" htmlFor="grade">
              <Select id="grade" name="grade" defaultValue={initial?.grade ?? 7}>
                {Array.from({ length: 9 }, (_, i) => (
                  <option key={i} value={i + 1}>
                    Kelas {i + 1}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Asal sekolah" htmlFor="school">
              <Input id="school" name="school" list="sekolah" defaultValue={initial?.school ?? ""} />
              <datalist id="sekolah">
                {[...SEKOLAH_SMP, ...SEKOLAH_SD].map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>
            <Field label="Paket" htmlFor="packageId">
              <Select id="packageId" name="packageId" defaultValue={initial?.packageId ?? ""}>
                <option value="">Belum ada</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        ) : null}
        <Field label="Cabang" htmlFor="branch">
          <Select id="branch" name="branch" defaultValue={initial?.branch ?? CABANG[0]}>
            {CABANG.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
      </Card>
    </form>
  );
}
