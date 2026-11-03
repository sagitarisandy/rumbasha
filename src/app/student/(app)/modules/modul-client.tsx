"use client";

import { Download, Eye, EllipsisVertical, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Chips } from "@/components/ui/tabs";

export function FilterButton({ kelas, status, mapel, bidang }: { kelas?: string; status?: string; mapel: string; bidang?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [k, setK] = useState(kelas ?? "");
  const [s, setS] = useState(status ?? "");
  const active = (kelas ? 1 : 0) + (status ? 1 : 0);
  const apply = (nk: string, ns: string) => {
    const qs = new URLSearchParams(Object.entries({ mapel, bidang, kelas: nk, status: ns }).filter(([, v]) => v) as [string, string][]);
    router.push(`/student/modules?${qs}`, { scroll: false });
    setOpen(false);
  };
  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)} className="relative">
        <SlidersHorizontal /> Filter
        {active > 0 && <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] text-white">{active}</span>}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        side
        title="Filter PDF"
        footer={
          <>
            <Button variant="outline" onClick={() => apply("", "")}>
              Reset
            </Button>
            <Button onClick={() => apply(k, s)}>Terapkan</Button>
          </>
        }
      >
        <p className="mb-2 text-sm font-semibold text-ink">Kelas</p>
        <Chips value={k || "all"} onChange={(v) => setK(v === "all" ? "" : v)} items={[{ value: "all", label: "Semua" }, ...["7", "8", "9"].map((g) => ({ value: g, label: `Kelas ${g}` }))]} />
        <p className="mb-2 mt-5 text-sm font-semibold text-ink">Status</p>
        <Chips
          value={s || "all"}
          onChange={(v) => setS(v === "all" ? "" : v)}
          items={[
            { value: "all", label: "Semua" },
            { value: "belum", label: "Belum dibuka" },
            { value: "dibuka", label: "Sudah dibuka" },
            { value: "selesai", label: "Selesai" },
          ]}
        />
      </Dialog>
    </>
  );
}

export function PdfMenu({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label="Opsi PDF" onClick={() => setOpen((o) => !o)} className="grid size-9 place-items-center rounded-full text-ink hover:bg-surface">
        <EllipsisVertical className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-2xl border border-border bg-white p-1.5 shadow-pop">
          <Link href={`/student/modules/${id}`} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink hover:bg-surface">
            <Eye className="size-4" /> Buka
          </Link>
          <a href={`/api/materials/${id}/pdf`} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink hover:bg-surface">
            <Download className="size-4" /> Unduh
          </a>
        </div>
      )}
    </div>
  );
}
