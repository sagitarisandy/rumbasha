"use client";

import { FileSpreadsheet } from "lucide-react";
import { useActionState, useState } from "react";
import { importSoal, importUsers, type FormState } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

const TEMPLATES = {
  soal: {
    title: "Import soal dari Excel",
    hint: "Simpan Excel sebagai CSV (pemisah titik koma). Satu baris satu soal.",
    columns: "pertanyaan;A;B;C;D;E;kunci;mapel;bab;level",
    sample: "Hasil dari 12 × 3 adalah …;36;15;33;39;42;A;Matematika;Bilangan Bulat;Mudah\nIbu kota Jawa Timur adalah …;Malang;Surabaya;Kediri;Madiun;Blitar;B;IPS;Geografi;Mudah",
    action: importSoal,
  },
  user: {
    title: "Import user dari Excel",
    hint: "Simpan Excel sebagai CSV. Kata sandi awal semua akun: rumbasha123.",
    columns: "nama,email,role,kelas,sekolah",
    sample: "Arif Budiman,arif.b@siswa.rumbasha.id,siswa,8,SMPN 3 Surabaya\nLina Marlina,lina.m@rumbasha.id,tutor,,",
    action: importUsers,
  },
};

export function ImportDialogButton({ kind }: { kind: keyof typeof TEMPLATES }) {
  const tpl = TEMPLATES[kind];
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(tpl.action, {});
  const download = () => {
    const blob = new Blob([`${tpl.columns}\n${tpl.sample}\n`], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `template-${kind}.csv`;
    a.click();
  };
  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        <FileSpreadsheet /> Import Excel
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={tpl.title} description={tpl.hint}>
        <form action={action} className="flex flex-col gap-4">
          <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-[#c9cbe0] px-6 py-8 text-center hover:bg-sidebar">
            <FileSpreadsheet className="size-6 text-subtle" />
            <span className="mt-2 text-sm font-semibold text-ink">Pilih file .csv</span>
            <span className="text-xs text-subtle">Kolom: {tpl.columns}</span>
            <input type="file" name="file" accept=".csv,text/csv" className="mt-3 text-xs" required />
          </label>
          {state.error && <p className="text-sm font-semibold text-destructive">{state.error}</p>}
          {state.ok && <p className="rounded-xl bg-success-soft px-3 py-2 text-sm font-semibold text-success-ink">{state.message}</p>}
          <div className="flex flex-wrap justify-between gap-2">
            <Button variant="link" onClick={download}>
              Unduh template
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Tutup
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Mengimpor…" : "Import"}
              </Button>
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export const ImportSoalButton = () => <ImportDialogButton kind="soal" />;
