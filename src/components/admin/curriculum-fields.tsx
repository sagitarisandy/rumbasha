"use client";

import { useState } from "react";
import { Field, Input, Select } from "@/components/ui/form";
import { KURIKULUM, MAPEL, type Mapel } from "@/lib/catalog";

/** Jenjang/Kelas, Mapel → Bidang → Bab selects (bab can also be typed for a new one). */
export function CurriculumFields({ initial }: { initial?: { jenjang?: string; grade?: number; subject?: string; bidang?: string; bab?: string } }) {
  const [jenjang, setJenjang] = useState(initial?.jenjang ?? "SMP");
  const [mapel, setMapel] = useState<Mapel>((MAPEL as readonly string[]).includes(initial?.subject ?? "") ? (initial!.subject as Mapel) : "Matematika");
  const bidangs = KURIKULUM[mapel];
  const [bidang, setBidang] = useState(initial?.bidang && bidangs.some((b) => b.name === initial.bidang) ? initial.bidang : bidangs[0].name);
  const babs = bidangs.find((b) => b.name === bidang)?.bab ?? [];
  const [bab, setBab] = useState(initial?.bab ?? babs[0]?.name ?? "");
  const grades = jenjang === "SD" ? [1, 2, 3, 4, 5, 6] : [7, 8, 9];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Jenjang" htmlFor="jenjang">
        <Select id="jenjang" name="jenjang" value={jenjang} onChange={(e) => setJenjang(e.target.value)}>
          <option>SD</option>
          <option>SMP</option>
        </Select>
      </Field>
      <Field label="Kelas" htmlFor="grade">
        <Select id="grade" name="grade" defaultValue={initial?.grade && grades.includes(initial.grade) ? initial.grade : grades[0]} key={jenjang}>
          {grades.map((g) => (
            <option key={g} value={g}>
              Kelas {g}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Mapel" htmlFor="subject">
        <Select
          id="subject"
          name="subject"
          value={mapel}
          onChange={(e) => {
            const m = e.target.value as Mapel;
            setMapel(m);
            setBidang(KURIKULUM[m][0].name);
            setBab(KURIKULUM[m][0].bab[0].name);
          }}
        >
          {MAPEL.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </Select>
      </Field>
      <Field label="Bidang materi" htmlFor="bidang">
        <Select
          id="bidang"
          name="bidang"
          value={bidang}
          onChange={(e) => {
            setBidang(e.target.value);
            setBab(bidangs.find((b) => b.name === e.target.value)?.bab[0].name ?? "");
          }}
        >
          {bidangs.map((b) => (
            <option key={b.name}>{b.name}</option>
          ))}
        </Select>
      </Field>
      <Field label="Bab" htmlFor="bab" hint="Pilih dari daftar atau ketik bab baru." className="sm:col-span-2">
        <Input id="bab" name="bab" list="bab-list" value={bab} onChange={(e) => setBab(e.target.value)} required />
        <datalist id="bab-list">
          {babs.map((b) => (
            <option key={b.name} value={b.name} />
          ))}
        </datalist>
      </Field>
    </div>
  );
}
