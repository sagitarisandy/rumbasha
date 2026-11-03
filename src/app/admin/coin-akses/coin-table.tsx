"use client";

import { Coins, Pencil, ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { bulkAkses, bulkCoin } from "@/app/actions/admin";
import { Table, Td, Th } from "@/components/admin/table";
import { Avatar } from "@/components/app/visuals";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { Segmented } from "@/components/ui/tabs";

type Row = { id: number; name: string; grade: number | null; avatar: number; coin: number; packageId: number | null; paket: string; akses: string; untilLabel: string; untilIso: string };

export function CoinTable({ rows, packages, total }: { rows: Row[]; packages: { id: number; name: string }[]; total: number }) {
  const [sel, setSel] = useState<number[]>([]);
  const [dialog, setDialog] = useState<null | { kind: "coin" | "akses"; ids: number[] }>(null);
  const [mode, setMode] = useState<"tambah" | "kurangi" | "atur">("tambah");
  const [amount, setAmount] = useState(50);
  const [note, setNote] = useState("");
  const [pkg, setPkg] = useState<string>("");
  const [until, setUntil] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const all = rows.length > 0 && rows.every((r) => sel.includes(r.id));
  const target = dialog ? rows.filter((r) => dialog.ids.includes(r.id)) : [];

  const open = (kind: "coin" | "akses", ids: number[]) => {
    setMsg(null);
    if (kind === "akses") {
      const first = rows.find((r) => r.id === ids[0]);
      setPkg(first?.packageId ? String(first.packageId) : "");
      setUntil(first?.untilIso ?? "");
    }
    setDialog({ kind, ids });
  };
  const apply = () =>
    start(async () => {
      if (!dialog) return;
      const r = dialog.kind === "coin" ? await bulkCoin(dialog.ids, mode, amount, note) : await bulkAkses(dialog.ids, pkg ? Number(pkg) : null, until);
      setMsg(r.error ?? r.message ?? null);
      if (r.ok) {
        setSel([]);
        setTimeout(() => setDialog(null), 700);
      }
    });

  return (
    <>
      {sel.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl bg-primary-soft px-4 py-2.5">
          <span className="text-sm font-semibold text-ink">{sel.length} dipilih</span>
          <div className="ml-auto flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => open("coin", sel)}>
              <Coins /> Ubah coin
            </Button>
            <Button variant="ghost" size="sm" onClick={() => open("akses", sel)}>
              <ShieldCheck /> Ubah akses
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSel([])}>
              Batal
            </Button>
          </div>
        </div>
      )}
      <Table>
        <thead>
          <tr>
            <Th className="w-10">
              <Checkbox aria-label="Pilih semua di halaman ini" checked={all} onChange={(e) => setSel(e.target.checked ? rows.map((r) => r.id) : [])} />
            </Th>
            <Th>Siswa</Th>
            <Th>Kelas</Th>
            <Th>Paket</Th>
            <Th>Akses</Th>
            <Th>Coin</Th>
            <Th>Berlaku s/d</Th>
            <Th className="text-right">Aksi</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={sel.includes(r.id) ? "bg-primary-soft/60" : "hover:bg-sidebar"}>
              <Td>
                <Checkbox aria-label={`Pilih ${r.name}`} checked={sel.includes(r.id)} onChange={(e) => setSel(e.target.checked ? [...sel, r.id] : sel.filter((x) => x !== r.id))} />
              </Td>
              <Td>
                <span className="flex items-center gap-3">
                  <Avatar n={r.avatar} className="size-8" />
                  <span className="font-semibold">{r.name}</span>
                </span>
              </Td>
              <Td className="text-ink-2">Kelas {r.grade}</Td>
              <Td>{r.paket}</Td>
              <Td className="text-ink-2">{r.akses}</Td>
              <Td className="font-semibold">{r.coin.toLocaleString("id-ID")}</Td>
              <Td className="text-ink-2">{r.untilLabel}</Td>
              <Td className="text-right">
                <button type="button" onClick={() => open("coin", [r.id])} className="inline-flex h-8 items-center gap-1.5 rounded-2xl bg-primary-soft px-3 text-xs font-semibold text-primary">
                  <Pencil className="size-3.5" /> Edit
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <p className="mt-2 text-xs text-subtle">{total} siswa cocok dengan filter.</p>

      <Dialog
        open={!!dialog}
        onClose={() => setDialog(null)}
        size="sm"
        title={dialog?.kind === "coin" ? "Ubah coin" : "Ubah akses"}
        description={target.length === 1 ? target[0].name : `${target.length} siswa dipilih`}
        footer={
          <>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Batal
            </Button>
            <Button onClick={apply} disabled={pending}>
              {pending ? "Menyimpan…" : "Simpan"}
            </Button>
          </>
        }
      >
        {dialog?.kind === "coin" ? (
          <div className="flex flex-col gap-4">
            {target.length === 1 && (
              <button type="button" onClick={() => setDialog({ kind: "akses", ids: dialog.ids })} className="w-fit text-xs font-semibold text-primary">
                Ubah akses paket siswa ini →
              </button>
            )}
            <Segmented
              value={mode}
              onChange={setMode}
              items={[
                { value: "tambah", label: "Tambah" },
                { value: "kurangi", label: "Kurangi" },
                { value: "atur", label: "Atur jadi" },
              ]}
            />
            <Field label="Jumlah coin" htmlFor="amount">
              <Input id="amount" type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </Field>
            <Field label="Catatan" htmlFor="note" hint="Tampil di riwayat coin siswa.">
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Hadiah juara Daily Quiz minggu ini" />
            </Field>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Field label="Paket" htmlFor="pkg">
              <Select id="pkg" value={pkg} onChange={(e) => setPkg(e.target.value)}>
                <option value="">Tanpa paket (akses dicabut)</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Berlaku sampai" htmlFor="until">
              <Input id="until" type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
            </Field>
          </div>
        )}
        {msg && <p className="mt-3 text-sm font-semibold text-ink">{msg}</p>}
      </Dialog>
    </>
  );
}
