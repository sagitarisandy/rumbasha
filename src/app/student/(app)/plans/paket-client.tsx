"use client";

import { Building2, Check, CircleCheck, QrCode, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { purchase, type PurchaseResult } from "@/app/actions/siswa";
import { Rumbi } from "@/components/app/visuals";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Card } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { PERIODS } from "@/lib/catalog";
import { num, rupiah, rupiahShort } from "@/lib/format";

type Pkg = { id: number; name: string; tagline: string | null; price: number; priceOriginal: number | null; features: string[]; highlight: boolean };
type Pack = { id: number; coin: number; price: number; note: string };
type Order = { type: "coin"; packageId: number; amount: number; label: string } | { type: "paket"; packageId: number; period: string; amount: number; label: string };

const METHODS = [
  { key: "QRIS", icon: QrCode, hint: "Bayar dari aplikasi bank atau e-wallet" },
  { key: "Virtual Account", icon: Building2, hint: "Transfer dari ATM atau m-banking" },
  { key: "E-wallet", icon: Wallet, hint: "Saldo dompet digital" },
];

export function PaketClient({ packages, coinPacks, tab: initialTab }: { packages: Pkg[]; coinPacks: Pack[]; tab: "paket" | "coin" }) {
  const router = useRouter();
  const [tab, setTab] = useState(initialTab);
  const [period, setPeriod] = useState<string>("bulanan");
  const [packId, setPackId] = useState(coinPacks[1]?.id ?? coinPacks[0]?.id);
  const [order, setOrder] = useState<Order | null>(null);
  const [method, setMethod] = useState("QRIS");
  const [result, setResult] = useState<PurchaseResult | null>(null);
  const [pending, start] = useTransition();
  const p = PERIODS.find((x) => x.key === period)!;

  const pay = () =>
    start(async () => {
      if (!order) return;
      const r = await purchase(order.type === "coin" ? { type: "coin", packageId: order.packageId, method } : { type: "paket", packageId: order.packageId, period: order.period, method });
      setResult(r);
      router.refresh();
    });
  const close = () => {
    setOrder(null);
    setResult(null);
  };
  const pack = coinPacks.find((c) => c.id === packId);

  return (
    <>
      <Segmented
        className="mt-5"
        value={tab}
        onChange={setTab}
        items={[
          { value: "paket", label: "Paket langganan" },
          { value: "coin", label: "Isi coin" },
        ]}
      />

      {tab === "paket" ? (
        <>
          <Segmented className="mt-3 w-fit" size="sm" value={period} onChange={setPeriod} items={PERIODS.map((x) => ({ value: x.key, label: x.label }))} />
          <div className="mt-4 flex flex-col gap-4">
            {packages.map((pk) => {
              const monthly = Math.round(pk.price * (1 - p.discount));
              const total = monthly * p.months;
              return (
                <Card key={pk.id} className={`relative p-5 sm:p-6 ${pk.highlight ? "ring-2 ring-accent/50" : ""}`}>
                  {pk.highlight && <span className="absolute right-5 top-5 rounded-xl bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-ink">Paling banyak dipilih</span>}
                  <p className="pr-36 text-[17px] font-semibold text-ink">{pk.name}</p>
                  {pk.tagline && <p className="text-xs text-subtle">{pk.tagline}</p>}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-[30px] font-bold tracking-[-0.02em] text-ink">{rupiahShort(monthly)}</span>
                    <span className="text-sm text-subtle">/bulan</span>
                    {pk.priceOriginal && <span className="text-sm text-faint line-through">{rupiahShort(pk.priceOriginal)}</span>}
                  </div>
                  {p.months > 1 && <p className="text-xs text-subtle">Dibayar {rupiah(total)} untuk {p.months} bulan</p>}
                  <ul className="mt-3 flex flex-col gap-2">
                    {pk.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-ink">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={pk.highlight ? "accent" : "ghost"}
                    size="lg"
                    className="mt-4 w-full"
                    onClick={() => setOrder({ type: "paket", packageId: pk.id, period, amount: total, label: `${pk.name} · ${p.label.replace(/ −.*/, "")}` })}
                  >
                    Pilih paket
                  </Button>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <section className="mt-5">
          <p className="font-semibold text-ink">Isi coin</p>
          <p className="text-[13px] text-subtle">Untuk RUMATH, Daily Quiz tambahan, dan tryout tambahan.</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {coinPacks.map((c) => {
              const on = c.id === packId;
              return (
                <button key={c.id} type="button" onClick={() => setPackId(c.id)} aria-pressed={on} className={`relative rounded-[20px] p-4 text-left transition ${on ? "bg-primary-soft ring-2 ring-primary/30" : "bg-white ring-1 ring-border-2 hover:bg-surface"}`}>
                  <p className="text-[19px] font-semibold text-ink">{num(c.coin)} coin</p>
                  <p className="text-xs text-subtle">{c.note}</p>
                  <p className="mt-2 font-semibold text-ink">{rupiah(c.price)}</p>
                  {on && <span className="absolute right-4 top-4 size-2.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
          {pack && (
            <Button variant="accent" size="lg" className="mt-5 w-full" onClick={() => setOrder({ type: "coin", packageId: pack.id, amount: pack.price, label: `Beli ${num(pack.coin)} coin` })}>
              Beli {num(pack.coin)} coin · {rupiah(pack.price)}
            </Button>
          )}
        </section>
      )}

      <Dialog open={!!order} onClose={close} side size="sm">
        {order &&
          (result?.ok ? (
            <div className="py-2 text-center">
              <Rumbi pose="yey" className="mx-auto h-28" />
              <p className="mt-3 flex items-center justify-center gap-2 text-lg font-semibold text-ink">
                <CircleCheck className="size-5 text-success" /> Pembayaran berhasil
              </p>
              <p className="mt-1 text-sm text-subtle">{result.message}</p>
              <Button className="mt-5 w-full" size="lg" onClick={close}>
                Selesai
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-ink">{order.label}</p>
                  <p className="text-sm text-subtle">Masuk ke akun setelah pembayaran berhasil.</p>
                </div>
                <p className="text-lg font-semibold text-ink">{rupiah(order.amount)}</p>
              </div>
              <p className="mb-2 mt-5 text-sm font-semibold text-ink">Metode pembayaran</p>
              <div className="flex flex-col gap-1">
                {METHODS.map(({ key, icon: Icon, hint }) => (
                  <button key={key} type="button" onClick={() => setMethod(key)} aria-pressed={method === key} className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${method === key ? "bg-primary-soft" : "hover:bg-surface"}`}>
                    <Icon className="size-5 text-ink" />
                    <span className="flex-1">
                      <span className="block text-[15px] font-semibold text-ink">{key}</span>
                      <span className="text-xs text-subtle">{hint}</span>
                    </span>
                    <span className={`size-[18px] rounded-full ${method === key ? "border-[5px] border-primary" : "border border-[#c9cbe0]"}`} />
                  </button>
                ))}
              </div>
              {result?.error && <p className="mt-3 text-sm font-semibold text-destructive">{result.error}</p>}
              <p className="mt-4 rounded-xl bg-surface px-3 py-2 text-xs text-subtle">Mode preview: pembayaran disimulasikan langsung berhasil, tidak ada uang yang ditarik.</p>
              <Button variant="accent" size="lg" className="mt-4 w-full" onClick={pay} disabled={pending}>
                {pending ? "Memproses…" : `Bayar ${rupiah(order.amount)}`}
              </Button>
            </>
          ))}
      </Dialog>
    </>
  );
}
