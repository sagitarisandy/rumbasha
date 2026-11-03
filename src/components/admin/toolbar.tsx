"use client";

import { ListFilter, Pencil, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export type Filter = { key: string; label: string; options: { value: string; label: string }[] };

/** Search box + filter chips that write to the URL (?q=, ?<filter>=), resetting the page. */
export function Toolbar({ placeholder, filters = [], right }: { placeholder: string; filters?: Filter[]; right?: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(sp.toString());
    if (v) next.set(k, v);
    else next.delete(k);
    next.delete("hal");
    router.replace(`${pathname}?${next}`, { scroll: false });
  };
  useEffect(() => {
    if (q === (sp.get("q") ?? "")) return;
    const t = setTimeout(() => set("q", q), 350);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative mr-2 w-full sm:w-[260px]">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="h-10 w-full rounded-xl bg-transparent pl-9 pr-3 text-sm text-ink outline-none placeholder:text-subtle focus:bg-surface" />
      </div>
      {filters.map((f) => {
        const v = sp.get(f.key) ?? "";
        const label = f.options.find((o) => o.value === v)?.label;
        return (
          <label key={f.key} className={`relative inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[18px] border border-dashed px-3 text-[13px] font-semibold ${v ? "border-primary/40 bg-primary-soft text-primary" : "border-[#c9cbe0] text-ink"}`}>
            <ListFilter className="size-3.5" />
            {f.label}
            {label && <span className="rounded-md bg-white px-1.5 text-xs font-normal text-subtle">{label}</span>}
            <select value={v} onChange={(e) => set(f.key, e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={f.label}>
              <option value="">Semua</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        );
      })}
      <div className="ml-auto flex items-center gap-2">{right}</div>
    </div>
  );
}

/** Edit link + delete button with a confirmation dialog. */
export function RowActions({ editHref, onEdit, onDelete, what }: { editHref?: string; onEdit?: () => void; onDelete?: () => Promise<{ error?: string } | void>; what: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const edit = "inline-flex h-8 items-center gap-1.5 rounded-2xl bg-primary-soft px-3 text-xs font-semibold text-primary hover:bg-[#e3e6ff]";
  return (
    <div className="flex items-center justify-end gap-1.5">
      {editHref ? (
        <Link href={editHref} className={edit}>
          <Pencil className="size-3.5" /> Edit
        </Link>
      ) : (
        onEdit && (
          <button type="button" onClick={onEdit} className={edit}>
            <Pencil className="size-3.5" /> Edit
          </button>
        )
      )}
      {onDelete && (
        <button type="button" onClick={() => setOpen(true)} aria-label={`Hapus ${what}`} className="grid size-8 place-items-center rounded-full bg-destructive-soft text-destructive hover:bg-[#fbdcdc]">
          <Trash2 className="size-3.5" />
        </button>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        title={`Hapus ${what}?`}
        description="Data yang dihapus tidak bisa dikembalikan."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await onDelete?.();
                  if (r && r.error) setError(r.error);
                  else setOpen(false);
                })
              }
            >
              {pending ? "Menghapus…" : "Hapus"}
            </Button>
          </>
        }
      >
        {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
      </Dialog>
    </div>
  );
}
