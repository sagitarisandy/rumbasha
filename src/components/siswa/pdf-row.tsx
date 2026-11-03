import { Download, Eye, FileText } from "lucide-react";
import Link from "next/link";
import { PdfMenu } from "@/app/siswa/(app)/modul/modul-client";
import { Badge } from "@/components/ui/misc";

export type PdfRowData = { id: number; title: string; pages: number; grade?: number; page: number | null };

export function PdfRow({ p }: { p: PdfRowData }) {
  const done = (p.page ?? 0) >= p.pages;
  return (
    <div className="flex items-center gap-3 py-3.5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <FileText className="size-5" />
      </span>
      <Link href={`/siswa/modul/${p.id}${p.page ? `?hal=${p.page}` : ""}`} className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-ink hover:text-primary">{p.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-subtle">
          <span>{p.pages} hlm</span>
          {p.grade && <span>· Kelas {p.grade}</span>}
          {p.page ? (
            <Badge variant="success">
              <Eye /> {done ? "Selesai" : "Dibuka"}
            </Badge>
          ) : (
            <Badge>Belum dibuka</Badge>
          )}
          {done && (
            <Badge variant="info">
              <Download /> Diunduh
            </Badge>
          )}
        </div>
      </Link>
      <PdfMenu id={p.id} />
    </div>
  );
}
