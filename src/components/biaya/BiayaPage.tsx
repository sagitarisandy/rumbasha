"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { whatsappUrl } from "../home-option-2/data";
import Faq from "../home-option-2/Faq";
import Footer from "../home-option-2/Footer";
import { Header, PromoBar } from "../home-option-2/Header";
import { Reveal, RevealGroup, RevealItem } from "../home-option-2/motion";
import { biayaFaqs, biayaTabs, caraBergabung, type JenjangTab, type Paket } from "./data";

const ease = [0.22, 1, 0.36, 1] as const;

function CheckIcon({ light }: { light?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="h-6 w-6 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="9.5" fill={light ? "#ffffff" : "#13a65a"} />
      <path d="M5.8 10.3l2.8 2.8 5.6-5.8" fill="none" stroke={light ? "#3f4197" : "#ffffff"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-6 w-6 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="9.5" fill="#e4e6f5" />
      <path d="M6.5 10h7" stroke="#7d80a8" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function PaketCard({ paket, featured }: { paket: Paket; featured?: boolean }) {
  return (
    <div
      className={`relative h-full overflow-hidden rounded-3xl p-8 transition-shadow duration-300 ${
        featured
          ? "bg-[linear-gradient(160deg,#3f4197,#0e1168)] text-white shadow-[0_24px_60px_rgb(14_17_104/0.35)] md:-mt-5 md:pb-12"
          : "bg-white text-navy shadow-card hover:shadow-float"
      }`}
    >
      {featured && (
        <>
          <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/[0.06]" />
          <span className="relative mb-3 inline-flex rounded-full bg-orange px-3.5 py-1 text-xs font-semibold">Paling banyak dipilih</span>
        </>
      )}
      <h3 className="relative text-2xl font-bold">{paket.name}</h3>
      <p className={`relative mt-2.5 text-sm leading-[1.5] ${featured ? "text-white/80" : "text-muted"}`}>{paket.desc}</p>
      <p className={`relative mt-3 text-xs ${featured ? "text-white/70" : "text-muted-2"}`}>{paket.meta}</p>
      {paket.price && (
        <p className="relative mt-4 flex items-baseline gap-1">
          <span className={`text-[32px] font-bold tracking-[0.02em] ${featured ? "text-white" : "text-navy"}`}>{paket.price}</span>
          <span className={`text-sm ${featured ? "text-white/70" : "text-muted"}`}>/bulan</span>
        </p>
      )}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className={`relative mt-5 flex h-12 items-center justify-center rounded-xl text-sm font-semibold transition hover:-translate-y-0.5 ${
          featured ? "bg-orange text-white shadow-cta hover:bg-[#ff9248]" : "border-[1.5px] border-indigo text-indigo hover:bg-indigo hover:text-white"
        }`}
      >
        {paket.cta}
      </a>
      <div className={`relative mt-7 border-t pt-5 ${featured ? "border-white/15" : "border-line"}`}>
        <p className={`text-xs font-semibold uppercase tracking-[2px] ${featured ? "text-peach" : "text-orange"}`}>Isi paket</p>
        <ul className="mt-4 space-y-3">
          {paket.features.map(([label, included]) => (
            <li
              key={label}
              className={`flex items-center gap-2.5 text-sm ${included ? (featured ? "text-white" : "text-navy") : "text-[#a9abc4]"}`}
            >
              {included ? <CheckIcon light={featured} /> : <DashIcon />}
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CompareTable({ tab }: { tab: JenjangTab }) {
  return (
    <div className="overflow-x-auto rounded-[20px] border border-line bg-white shadow-card">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-[38%] px-8 py-6 text-left font-semibold text-navy">Fitur</th>
            {tab.pakets.map((p, i) => (
              <th
                key={p.name}
                className={`px-4 py-6 text-center font-semibold text-navy ${i === 1 ? "border-t-[3px] border-orange bg-lavender" : ""}`}
              >
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tab.compare.map((row) => (
            <tr key={row.label} className="border-t border-line">
              <td className="px-8 py-[19px] font-medium text-navy">{row.label}</td>
              {row.values.map((v, i) => (
                <td key={i} className={`px-4 py-[19px] text-center ${i === 1 ? "bg-lavender font-semibold text-navy" : "text-muted"}`}>
                  {typeof v === "boolean" ? <span className="inline-flex">{v ? <CheckIcon /> : <DashIcon />}</span> : v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "Paket & Harga" page — one Penpot board per tab (Pra SD & SD, SMP, SMA, E-Learning). */
export default function BiayaPage() {
  const params = useSearchParams();
  const [active, setActive] = useState(() => (biayaTabs.some((t) => t.id === params.get("jenjang")) ? params.get("jenjang")! : "sd"));
  const tab = biayaTabs.find((t) => t.id === active) ?? biayaTabs[0];

  const select = (id: string) => {
    setActive(id);
    window.history.replaceState(null, "", id === "sd" ? "/pricing" : `/pricing?jenjang=${id}`);
  };

  return (
    <>
      <PromoBar />
      <Header active="Biaya" />
      <main>
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f4f5ff_0,#f4f5ff_640px,#ffffff_640px)] px-5 pb-10 pt-[120px]">
          {/* Orange triangle decoration (top right) */}
          <div aria-hidden className="absolute right-[6%] top-[160px] hidden grid-cols-2 gap-3 lg:grid">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 200, damping: 14 }}
                className="block h-[70px] w-[70px] bg-orange [clip-path:polygon(0_0,100%_100%,0_100%)]"
              />
            ))}
          </div>

          <div className="relative mx-auto max-w-[1200px]">
            <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
              <Link href="/" className="hover:text-orange">
                Beranda
              </Link>
              <span className="mx-2">›</span>
              <span className="font-semibold text-navy">Paket & Harga</span>
            </nav>

            <div className="mx-auto mt-10 max-w-[760px] text-center">
              <AnimatePresence mode="wait">
                <motion.div key={tab.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                  <p className="text-sm font-semibold uppercase tracking-[2px] text-orange">{tab.eyebrow}</p>
                  <h1 className="mt-3 text-balance text-[30px] font-extrabold leading-[1.25] tracking-normal text-navy sm:text-[40px]">{tab.title}</h1>
                  <p className="mx-auto mt-4 max-w-[700px] text-base leading-[1.5] text-muted">{tab.desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-9 flex flex-col items-center">
              <p className="mb-2 text-center text-xs font-medium text-navy">Pilih jenjang atau program</p>
              <div role="tablist" className="flex flex-wrap justify-center gap-1 rounded-xl border border-line bg-white p-1.5 shadow-[0_4px_14px_rgb(14_17_104/0.06)]">
                {biayaTabs.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    type="button"
                    aria-selected={t.id === active}
                    onClick={() => select(t.id)}
                    className={`relative h-10 min-w-[104px] rounded-lg px-4 text-[13px] font-semibold transition-colors ${
                      t.id === active ? "text-white" : "text-navy hover:text-orange"
                    }`}
                  >
                    {t.id === active && (
                      <motion.span layoutId="biaya-tab" className="absolute inset-0 rounded-lg bg-indigo" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                    )}
                    <span className="relative">{t.tab}</span>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab.id}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
                className="mt-16 grid items-start gap-7 md:grid-cols-3"
              >
                {tab.pakets.map((p, i) => (
                  <motion.div
                    key={p.name}
                    variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
                    whileHover={{ y: -6 }}
                    className={i === 1 ? "md:order-none" : ""}
                  >
                    <PaketCard paket={p} featured={i === 1} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            <p className="mx-auto mt-10 max-w-[1000px] text-center text-[13px] leading-[1.6] text-muted">{tab.note}</p>
          </div>
        </section>

        <section className="px-5 pb-24 pt-14">
          <div className="mx-auto max-w-[1200px]">
            <Reveal className="text-center">
              <h2 className="heading-tracking text-[26px] font-bold text-navy sm:text-[32px]">Bandingkan paket</h2>
              <p className="mt-3 text-base text-muted">{tab.compareIntro}</p>
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <AnimatePresence mode="wait">
                <motion.div key={tab.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <CompareTable tab={tab} />
                </motion.div>
              </AnimatePresence>
            </Reveal>
          </div>
        </section>

        <section className="bg-lavender px-5 py-24">
          <div className="mx-auto max-w-[1200px]">
            <Reveal className="text-center">
              <h2 className="heading-tracking text-[26px] font-bold text-navy sm:text-[32px]">Cara bergabung</h2>
              <p className="mt-3 text-base text-muted">Tiga langkah dari pilih paket sampai mulai belajar di cabang.</p>
            </Reveal>
            <RevealGroup className="mt-12 grid gap-7 md:grid-cols-3">
              {caraBergabung.map((step, i) => (
                <RevealItem key={step.title} className="rounded-[20px] bg-white p-7 shadow-card transition hover:-translate-y-1 hover:shadow-float">
                  <div className="flex items-center gap-4">
                    <span className={`grid h-10 w-10 place-items-center rounded-full text-base font-bold text-white ${i === 2 ? "bg-orange" : "bg-indigo"}`}>
                      {i + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-navy">{step.title}</h3>
                  </div>
                  <p className="mt-5 text-sm leading-[1.6] text-muted">{step.body}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        <Faq items={biayaFaqs} title="Pertanyaan seputar paket" className="pt-24" />
      </main>
      <Footer />
    </>
  );
}
