"use client";

import { useActionState, useState } from "react";
import { updateProfile, type ProfileState } from "@/app/actions/siswa";
import { Avatar } from "@/components/app/visuals";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/form";

type Data = {
  name: string;
  email: string;
  phone: string;
  jenjang: string;
  grade: number;
  school: string;
  target: string;
  avatar: number;
  parent: { name: string; relation: string; phone: string; email?: string };
};

export function ProfileForm({ user, schools }: { user: Data; schools: string[] }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, {});
  const [avatar, setAvatar] = useState(user.avatar);
  const [jenjang, setJenjang] = useState(user.jenjang);
  const [picker, setPicker] = useState(false);
  const grades = jenjang === "SD" ? [1, 2, 3, 4, 5, 6] : [7, 8, 9];

  return (
    <form action={action} className="flex max-w-[560px] flex-col gap-4">
      <input type="hidden" name="avatar" value={avatar} />
      <div className="flex items-center gap-4">
        <Avatar n={avatar} className="size-16" />
        <button type="button" onClick={() => setPicker(true)} className="text-sm font-semibold text-ink hover:text-primary">
          Ganti foto
        </button>
      </div>
      <Field label="Nama lengkap" htmlFor="name">
        <Input id="name" name="name" defaultValue={user.name} required />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" defaultValue={user.email} required />
      </Field>
      <Field label="No. WhatsApp" htmlFor="phone">
        <Input id="phone" name="phone" inputMode="tel" defaultValue={user.phone} placeholder="0812xxxxxxx" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Jenjang" htmlFor="jenjang">
          <Select id="jenjang" name="jenjang" value={jenjang} onChange={(e) => setJenjang(e.target.value)}>
            <option>SD</option>
            <option>SMP</option>
          </Select>
        </Field>
        <Field label="Kelas" htmlFor="grade">
          <Select id="grade" name="grade" defaultValue={grades.includes(user.grade) ? user.grade : grades[grades.length - 1]} key={jenjang}>
            {grades.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Asal sekolah" htmlFor="school">
        <Select id="school" name="school" defaultValue={user.school}>
          {[...new Set([user.school, ...schools].filter(Boolean))].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </Field>
      <Field label="Target sekolah" htmlFor="target" hint="Dipakai untuk rekomendasi tryout.">
        <Input id="target" name="target" defaultValue={user.target} placeholder="SMAN 5 Surabaya" />
      </Field>

      <div id="ortu" className="mt-4 border-t border-border pt-5">
        <p className="font-semibold text-ink">Kontak orang tua / wali</p>
        <p className="mb-4 text-xs text-subtle">Untuk laporan belajar bulanan.</p>
        <div className="flex flex-col gap-4">
          <Field label="Nama" htmlFor="parentName">
            <Input id="parentName" name="parentName" defaultValue={user.parent.name} />
          </Field>
          <Field label="Hubungan" htmlFor="parentRelation">
            <Select id="parentRelation" name="parentRelation" defaultValue={user.parent.relation}>
              {["Ibu", "Ayah", "Wali", "Kakak"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </Field>
          <Field label="No. WhatsApp" htmlFor="parentPhone">
            <Input id="parentPhone" name="parentPhone" inputMode="tel" defaultValue={user.parent.phone} />
          </Field>
          <Field label={<span className="font-normal text-subtle">Email (opsional)</span>} htmlFor="parentEmail">
            <Input id="parentEmail" name="parentEmail" type="email" defaultValue={user.parent.email} placeholder="email@contoh.com" />
          </Field>
        </div>
      </div>

      {state.error && <p className="rounded-xl bg-destructive-soft px-3 py-2 text-sm font-semibold text-destructive-ink">{state.error}</p>}
      {state.ok && <p className="rounded-xl bg-success-soft px-3 py-2 text-sm font-semibold text-success-ink">Data diri tersimpan.</p>}
      <Button type="submit" size="lg" className="mt-2" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan"}
      </Button>

      <Dialog open={picker} onClose={() => setPicker(false)} title="Pilih avatar" size="sm" side>
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 10 }, (_, n) => (
            <button key={n} type="button" onClick={() => (setAvatar(n), setPicker(false))} className={`rounded-full p-0.5 ${n === avatar ? "ring-2 ring-primary" : ""}`} aria-label={`Avatar ${n + 1}`}>
              <Avatar n={n} className="size-full" />
            </button>
          ))}
        </div>
      </Dialog>
    </form>
  );
}
