"use client";

import { Copy, KeyRound, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import { setAccessCode } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export const randomCode = () => Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

export function AccessCodeCell({ quizId, code, title }: { quizId: number; code: string | null; title: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(code ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      {code ? (
        <button
          type="button"
          onClick={() => (navigator.clipboard?.writeText(code), setCopied(true), setTimeout(() => setCopied(false), 1200))}
          className="inline-flex items-center gap-1.5 font-mono text-[13px] font-semibold tracking-wider text-ink"
          title="Salin kode"
        >
          {code} <Copy className="size-3.5 text-subtle" /> {copied && <span className="font-sans text-xs font-normal text-success">disalin</span>}
        </button>
      ) : (
        <button type="button" onClick={() => (setValue(randomCode()), setOpen(true))} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:text-primary">
          <KeyRound className="size-3.5" /> Buat kode
        </button>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} size="sm" title="Kode akses" description={title}>
        <div className="flex items-center gap-2">
          <input value={value} onChange={(e) => setValue(e.target.value.toUpperCase().slice(0, 6))} className="h-14 flex-1 rounded-xl border border-border text-center font-mono text-2xl font-semibold tracking-[0.4em] text-ink outline-none focus:border-primary" aria-label="Kode akses" />
          <Button variant="ghost" size="icon" onClick={() => setValue(randomCode())} aria-label="Acak kode">
            <RefreshCw />
          </Button>
        </div>
        <p className="mt-2 text-xs text-subtle">6 huruf/angka. Bagikan ke siswa sebelum sesi dimulai.</p>
        {msg && <p className="mt-2 text-sm font-semibold text-success-ink">{msg}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Tutup
          </Button>
          <Button
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await setAccessCode(quizId, value);
                setMsg(r.error ?? r.message ?? null);
                if (r.ok) setTimeout(() => setOpen(false), 900);
              })
            }
          >
            Simpan kode
          </Button>
        </div>
      </Dialog>
    </>
  );
}
