"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import CtaBanner from "../home-option-2/CtaBanner";
import Footer from "../home-option-2/Footer";
import { Header, PromoBar } from "../home-option-2/Header";
import { Reveal, RevealGroup, RevealItem } from "../home-option-2/motion";

// Copy from the Penpot board "Detail Siswa — Kisah Sukses (Rizky)".
const stats = [
  { value: "91,5", label: "Nilai rata-rata TKA", highlight: true },
  { value: "+23", label: "Kenaikan skor tryout" },
  { value: "14 bln", label: "Belajar di Rumbasha" },
  { value: "Top 5%", label: "Tryout TKA Rumbasha" },
];

const journey = [
  { date: "Mei 2025", title: "Tes penempatan", body: "Skor awal 62 dari 100. Kelemahan utama ada di Matematika dan Bahasa Inggris." },
  { date: "Jul 2025 – Jan 2026", title: "Kelas Intensif SMA Favorit", body: "Kelas maksimal 15 murid, 3x seminggu. Di rumah lanjut modul dan Daily Quiz lewat aplikasi." },
  { date: "Jan – Mar 2026", title: "Tryout TKA bertahap", body: "Ikut 6 kali tryout TKA. Skor naik dari 68 di TO #1 menjadi 91 di TO #6." },
  { date: "Jun 2026", title: "Diterima di SMA favorit", body: "Diterima di SMAN 3 Bandung lewat jalur prestasi, sesuai pilihan pertamanya." },
];

const scores = [68, 72, 77, 75, 84, 91];

const programItems = [
  "Kelas tatap muka 3x seminggu",
  "Tryout TKA bulanan + pembahasan",
  "Konsultasi pilih SMA & jalur SPMB",
  "Laporan mingguan ke orang tua",
  "Akses penuh aplikasi Rumbasha",
];

const otherStories = [
  { name: "Nada A.", meta: "SMAN 8 Jakarta  ·  Rumbasha Jakarta", photo: "/images/alumni/nada-a.webp", body: "Dari nilai rapor pas-pasan, Nada diterima di SMAN 8 Jakarta setelah ikut kelas Reguler sejak kelas 8." },
  { name: "Farrel H.", meta: "SMAN 5 Bandung  ·  Rumbasha Bandung", photo: "/images/alumni/farrel-h.webp", body: "Farrel belajar di Rumbasha sejak kelas 5 SD dan naik 20 poin di tryout TKA dalam 6 bulan terakhir." },
  { name: "Razka A.", meta: "SMAN 68 Jakarta  ·  Rumbasha Jakarta", photo: "/images/alumni/razka-a.webp", body: "Konsultasi jalur SPMB bikin orang tua Razka yakin memilih jalur prestasi, dan tryout bulanan menjaga ritmenya." },
];

const ease = [0.22, 1, 0.36, 1] as const;

function ScoreChart() {
  return (
    <div className="relative mt-6 h-[240px] pl-8">
      {[100, 75, 50, 25, 0].map((tick) => (
        <div key={tick} className="absolute inset-x-0 flex items-center gap-3" style={{ bottom: `${(tick / 100) * 200 + 24}px` }}>
          <span className="w-6 text-right text-[11px] text-muted-2">{tick}</span>
          <span className="h-px flex-1 bg-line" />
        </div>
      ))}
      <div className="absolute bottom-0 left-12 right-2 top-0 grid grid-cols-6 items-end gap-6">
        {scores.map((score, i) => {
          const last = i === scores.length - 1;
          return (
            <div key={i} className="flex h-full flex-col items-center justify-end">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.12 }}
                className={`mb-1.5 text-xs font-semibold ${last ? "text-navy" : "text-muted"}`}
              >
                {score}
              </motion.span>
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: (score / 100) * 200 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.12, ease }}
                className={`w-full max-w-[52px] rounded-t-lg ${last ? "bg-[linear-gradient(180deg,#5b63f5,#3f4197)]" : "bg-lavender-200"}`}
              />
              <span className="mt-2 h-4 text-[11px] text-muted-2">TO #{i + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** "Detail Siswa — Kisah Sukses (Rizky)" page. */
export default function AlumniDetail() {
  return (
    <>
      <PromoBar />
      <Header active="Alumni" />
      <main>
        <section className="bg-lavender px-5 pb-16 pt-[120px]">
          <div className="mx-auto max-w-[1200px]">
            <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
              <Link href="/" className="hover:text-orange">
                Beranda
              </Link>
              <span className="mx-2">›</span>
              <Link href="/#alumni" className="hover:text-orange">
                Kisah Sukses
              </Link>
              <span className="mx-2">›</span>
              <span className="font-semibold text-navy">Rizky Pratama</span>
            </nav>

            <div className="mt-8 grid items-center gap-12 lg:grid-cols-[440px_1fr] lg:gap-20">
              <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease }} className="relative">
                <div aria-hidden className="absolute -bottom-2 -left-9 grid gap-0">
                  {[0, 1].map((i) => (
                    <span key={i} className="block h-[66px] w-[66px] bg-orange [clip-path:polygon(0_0,100%_100%,0_100%)]" />
                  ))}
                </div>
                <div className="group relative h-[520px] overflow-hidden rounded-3xl shadow-[0_24px_50px_rgb(14_17_104/0.18)]">
                  <Image
                    src="/images/kisah-rizky.webp"
                    alt="Ilustrasi Rizky Pratama memegang buku"
                    fill
                    preload
                    sizes="440px"
                    className="object-cover object-top transition-transform duration-[1.2s] group-hover:scale-105"
                  />
                  <button
                    type="button"
                    className="absolute bottom-6 left-6 flex h-12 items-center gap-2.5 rounded-full bg-white pl-1.5 pr-5 text-sm font-semibold text-navy shadow-float transition hover:-translate-y-0.5"
                  >
                    <span className="relative grid h-9 w-9 place-items-center rounded-full bg-orange">
                      <span className="motion-safe-anim absolute inset-0 animate-pulse-ring rounded-full border-2 border-orange" />
                      <svg viewBox="0 0 12 12" className="ml-0.5 h-3 w-3" aria-hidden>
                        <path d="M2 1l9 5-9 5z" fill="#fff" />
                      </svg>
                    </span>
                    Tonton kisahnya
                  </button>
                </div>
              </motion.div>

              <div>
                <Reveal>
                  <p className="text-sm font-semibold uppercase tracking-[2px] text-orange">Kisah sukses murid</p>
                  <h1 className="heading-tracking mt-2 text-[40px] font-bold leading-[1.2] text-navy sm:text-5xl">Rizky Pratama</h1>
                  <p className="mt-3 text-[15px] text-muted">Alumni SMPN 5 Bandung · Rumbasha Bandung · Angkatan 2026</p>
                </Reveal>

                <Reveal delay={0.1} className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl bg-white p-5 shadow-card">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-lavender">
                    <Image src="/images/logos/sman-3-bandung.webp" alt="Logo SMA Negeri 3 Bandung" width={42} height={50} className="h-[38px] w-auto" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[2px] text-muted">Diterima di</p>
                    <p className="text-lg font-semibold text-navy">SMA Negeri 3 Bandung</p>
                  </div>
                  <span className="rounded-full bg-[#e3f6ec] px-3.5 py-1.5 text-xs font-semibold text-whatsapp">Jalur Prestasi 2026</span>
                </Reveal>

                <RevealGroup className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-0">
                  {stats.map((s, i) => (
                    <RevealItem key={s.label} className={`sm:px-5 ${i ? "sm:border-l sm:border-line-strong/60" : "sm:pl-0"}`}>
                      <p className={`text-[30px] font-bold leading-none tracking-[0.02em] ${s.highlight ? "text-orange" : "text-navy"}`}>
                        {s.value}
                      </p>
                      <p className="mt-2.5 text-xs text-muted">{s.label}</p>
                    </RevealItem>
                  ))}
                </RevealGroup>

                <Reveal delay={0.2} className="mt-9 border-l-[3px] border-orange pl-6">
                  <p className="text-[17px] font-medium leading-[1.65] text-navy">
                    “Dulu aku paling takut sama matematika. Di Rumbasha aku diajari pelan-pelan dari dasar, sampai akhirnya berani daftar ke SMAN 3 Bandung
                    sebagai pilihan pertama.”
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pt-24">
          <div className="mx-auto max-w-[1200px]">
            <Reveal className="text-center">
              <h2 className="heading-tracking text-[26px] font-bold text-navy sm:text-[32px]">Perjalanan belajar Rizky</h2>
              <p className="mt-3 text-base text-muted">
                Dari tes penempatan di kelas 8 sampai pengumuman SPMB, ini tahapan yang Rizky lalui selama 14 bulan.
              </p>
            </Reveal>

            <div className="relative mt-14">
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease }}
                className="absolute left-[12.5%] right-[12.5%] top-5 hidden h-0.5 origin-left bg-line-strong md:block"
              />
              <RevealGroup stagger={0.18} className="grid gap-6 md:grid-cols-4 md:gap-8">
                {journey.map((step, i) => {
                  const last = i === journey.length - 1;
                  return (
                    <RevealItem key={step.title} className="flex flex-col items-center">
                      <span className={`relative grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white ring-8 ring-white ${last ? "bg-orange" : "bg-indigo"}`}>
                        {i + 1}
                      </span>
                      <div className={`mt-10 w-full flex-1 rounded-[20px] p-6 ${last ? "bg-[#fff3ea]" : "bg-lavender"}`}>
                        <p className={`text-xs font-semibold ${last ? "text-orange" : "text-indigo"}`}>{step.date}</p>
                        <h3 className="mt-2 text-lg font-bold leading-[1.35] text-navy">{step.title}</h3>
                        <p className="mt-2.5 text-[13px] leading-[1.6] text-muted">{step.body}</p>
                      </div>
                    </RevealItem>
                  );
                })}
              </RevealGroup>
            </div>

            <div className="mt-20 grid gap-6 lg:grid-cols-[760px_1fr]">
              <Reveal className="rounded-[20px] border border-line bg-white p-8 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-navy">Perkembangan skor tryout</h3>
                    <p className="mt-1 text-xs text-muted">6 tryout TKA Rumbasha · skala 0–100</p>
                  </div>
                  <span className="rounded-full bg-[#e3f6ec] px-3.5 py-1.5 text-xs font-semibold text-whatsapp">+23 sejak TO #1</span>
                </div>
                <ScoreChart />
              </Reveal>

              <Reveal delay={0.1} className="relative overflow-hidden rounded-[20px] bg-[linear-gradient(160deg,#3f4197,#0e1168)] p-8 text-white shadow-[0_24px_50px_rgb(14_17_104/0.3)]">
                <div aria-hidden className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/[0.06]" />
                <p className="relative text-xs font-semibold uppercase tracking-[2px] text-peach">Program yang diikuti</p>
                <h3 className="relative mt-2 text-[26px] font-bold">Intensif SMA Favorit</h3>
                <p className="relative mt-1 text-sm text-white/70">Kelas 9 SMP · Rumbasha Bandung</p>
                <ul className="relative mt-6 space-y-3.5">
                  {programItems.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden>
                        <circle cx="10" cy="10" r="9" fill="#fff" />
                        <path d="M6 10.2l2.6 2.6L14 7.6" fill="none" stroke="#3f4197" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing?jenjang=smp"
                  className="relative mt-8 flex h-12 items-center justify-center rounded-xl bg-orange text-sm font-semibold shadow-cta transition hover:-translate-y-0.5 hover:bg-[#ff9248]"
                >
                  Lihat paket ini
                </Link>
              </Reveal>
            </div>

            <Reveal className="relative mt-20 overflow-hidden rounded-3xl bg-lavender px-8 py-12 sm:px-16">
              <div aria-hidden className="absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-lavender-200/70" />
              <div className="relative flex gap-8">
                <span aria-hidden className="hidden font-serif text-[96px] font-bold leading-[0.8] text-orange sm:block">
                  “
                </span>
                <div>
                  <p className="max-w-[860px] text-lg font-medium leading-[1.6] text-navy sm:text-xl">
                    Rumbasha rutin kirim laporan perkembangan setiap minggu, jadi kami tahu persis bagian mana yang perlu dibantu di rumah. Rizky juga jadi lebih
                    disiplin belajar sendiri.
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-indigo text-sm font-bold text-white">RK</span>
                    <div>
                      <p className="text-sm font-semibold text-navy">Ibu Rina Kusuma</p>
                      <p className="text-xs text-muted">Orang tua Rizky</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="mt-24">
              <Reveal className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="heading-tracking text-[26px] font-bold text-navy sm:text-[32px]">Kisah murid lainnya</h2>
                <Link href="/#alumni" className="group text-sm font-semibold text-orange">
                  Lihat semua kisah <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </Reveal>
              <RevealGroup className="mt-8 grid gap-6 md:grid-cols-3">
                {otherStories.map((story) => (
                  <RevealItem key={story.name} className="group rounded-[20px] border border-line bg-white p-7 shadow-card transition hover:-translate-y-1.5 hover:shadow-float">
                    <div className="flex items-center gap-4">
                      <Image src={story.photo} alt={story.name} width={60} height={60} className="h-[60px] w-[60px] rounded-full object-cover" />
                      <div>
                        <p className="text-base font-bold text-navy">{story.name}</p>
                        <p className="mt-0.5 text-xs text-muted">{story.meta}</p>
                      </div>
                    </div>
                    <p className="mt-5 text-sm leading-[1.6] text-muted">{story.body}</p>
                    {/* Detail pages for the other students are not designed yet. */}
                    <a href="#" className="mt-5 inline-block text-sm font-semibold text-orange">
                      Baca kisahnya <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    </a>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </div>
        </section>

        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
