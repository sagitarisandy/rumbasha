"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import CtaBanner from "../home-option-2/CtaBanner";
import { alumniRowOne, alumniRowTwo } from "../home-option-2/data";
import Footer from "../home-option-2/Footer";
import { Header, PromoBar } from "../home-option-2/Header";
import { Reveal } from "../home-option-2/motion";

// Logos live in /public/images/logos. Schools without a logo file fall back to a number badge.
const schoolLogos: Record<string, string> = {
  "SMAN 3 Bandung": "/images/logos/sman-3-bandung.webp",
  "SMAN 5 Bandung": "/images/logos/sman-5-bandung.webp",
  "SMAN 8 Bandung": "/images/logos/sman-8-bandung.webp",
  "SMAN 8 Jakarta": "/images/logos/sman-8-jakarta.webp",
  "SMAN 28 Jakarta": "/images/logos/sman-28-jakarta.webp",
  "SMAN 68 Jakarta": "/images/logos/sman-68-jakarta.webp",
  "SMAN 70 Jakarta": "/images/logos/sman-70-jakarta.webp",
  "SMAN 81 Jakarta": "/images/logos/sman-81-jakarta.webp",
};

// (lanjutan) Placeholder quotes in the voice of each alumnus: replace with the alumni's own words before launch.
const quotes = [
  "Kelasnya kecil, jadi kalau belum paham tinggal tanya. Gurunya sabar jelasin sampai benar-benar ngerti.",
  "Tryout bulanannya bikin aku tahu persis bagian mana yang masih lemah, jadi belajarnya nggak asal-asalan.",
  "Aplikasinya enak dipakai di rumah. Daily Quiz tiap hari bikin belajar jadi kebiasaan.",
  "Dulu bingung milih SMA dan jalurnya. Konsultasi di Rumbasha bikin aku dan orang tua yakin sama pilihan itu.",
  "Pembahasan soalnya runtut, dari konsep dulu baru latihan. Matematika yang tadinya menakutkan jadi terasa masuk akal.",
  "Temannya seru, suasananya santai tapi tetap serius belajar. Aku jadi semangat datang ke kelas.",
  "Laporan mingguan ke orang tua bikin aku lebih disiplin. Nggak enak kalau progresnya jalan di tempat.",
  "Latihan soal TKA-nya mirip sama yang keluar waktu ujian, jadi pas hari H aku sudah terbiasa.",
  "Dari rapor yang biasa saja, pelan-pelan nilaiku naik karena dibimbing step by step.",
  "Gurunya nggak cuma ngajarin materi, tapi juga ngasih tahu cara belajar yang cocok buat aku.",
  "Aku datang dengan target satu SMA. Sekarang target itu sudah jadi seragamku.",
  "Kalau ada materi yang ketinggalan, bisa diulang lewat modul di aplikasi. Jadi nggak pernah merasa tertinggal.",
];

type Entry = { name: string; school: string; branch: string; photo: string; quote: string };

const alumni: Entry[] = [...alumniRowOne, ...alumniRowTwo].map((a, i) => ({ ...a, quote: quotes[i % quotes.length] }));
const branchFilters = ["Semua", ...Array.from(new Set(alumni.map((a) => a.branch.replace("Rumbasha ", ""))))];

// (lanjutan) Headlines are placeholder copy, written from the story boards.
const stories = [
  {
    name: "Rizky Pratama",
    headline: "Dari skor tes awal 62, kini berseragam SMAN 3 Bandung",
    school: "SMAN 3 Bandung",
    image: "/images/kisah-rizky.webp",
    href: "/alumni/rizky" as string | null,
  },
  {
    name: "Dinda",
    headline: "Belajar dengan nyaman, lalu berani mengejar Ilmu Komunikasi",
    school: "Murid Rumbasha",
    image: "/images/kisah-dinda.webp",
    href: null as string | null,
  },
];

function SchoolBadge({ school, size = 24 }: { school: string; size?: number }) {
  const logo = schoolLogos[school];
  if (logo) return <Image src={logo} alt="" width={size * 2} height={size * 2} style={{ width: size, height: size }} className="shrink-0 object-contain" />;
  return (
    <span aria-hidden style={{ width: size, height: size }} className="grid shrink-0 place-items-center rounded-full bg-lavender text-[10px] font-bold text-indigo">
      {school.match(/\d+/)?.[0]}
    </span>
  );
}

function StoryCard({ story }: { story: (typeof stories)[number] }) {
  const inner = (
    <>
      <Image src={story.image} alt={`Ilustrasi ${story.name}`} fill sizes="(min-width:1024px) 580px, 100vw" className="object-cover object-top transition-transform duration-[1.2s] group-hover:scale-105" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(14_17_104/0.92)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <p className="flex items-center gap-2 text-sm font-semibold text-peach">
          {story.name} <span className="text-white/50">·</span> <span className="text-white/80">{story.school}</span>
        </p>
        <h2 className="heading-tracking mt-2 text-xl font-bold leading-[1.36] text-white sm:text-2xl">{story.headline}</h2>
        <span className="mt-4 inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-navy transition group-hover:bg-orange group-hover:text-white">
          {story.href ? "Baca kisahnya" : "Segera hadir"}
        </span>
      </div>
    </>
  );
  const cls = "group relative block aspect-[4/5] overflow-hidden rounded-[28px] bg-navy shadow-pop sm:aspect-[5/4] lg:aspect-[4/5]";
  return story.href ? (
    <Link href={story.href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function QuoteCard({ a }: { a: Entry }) {
  return (
    <figure className="mb-5 break-inside-avoid rounded-[24px] border border-line bg-white p-6 shadow-panel transition hover:-translate-y-1 hover:shadow-float">
      <svg viewBox="0 0 32 24" className="h-6 w-8 text-orange" aria-hidden>
        <path fill="currentColor" d="M0 24V14.4C0 6.1 4.5 1.2 12 0l1.2 3.6C9.1 5 7.2 7.6 7.2 11H13v13H0zm19 0V14.4C19 6.1 23.5 1.2 31 0l1.2 3.6C28.1 5 26.2 7.6 26.2 11H32v13H19z" />
      </svg>
      <blockquote className="mt-4 text-base leading-[1.6] text-navy">{a.quote}</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
        <Image src={a.photo} alt={a.name} width={130} height={130} className="h-[52px] w-[52px] shrink-0 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold leading-[1.4] text-navy">{a.name}</p>
          <p className="flex items-center gap-1.5 text-sm font-medium leading-[1.5] text-indigo">
            <SchoolBadge school={a.school} />
            <span className="truncate">{a.school}</span>
          </p>
          <p className="truncate text-xs font-medium text-muted-2">{a.branch}</p>
        </div>
      </figcaption>
    </figure>
  );
}

/** "Kisah Alumni" list page: featured stories first, then a wall of alumni quotes. */
export default function AlumniList() {
  const [filter, setFilter] = useState("Semua");
  const shown = filter === "Semua" ? alumni : alumni.filter((a) => a.branch.endsWith(filter));

  return (
    <>
      <PromoBar />
      <Header active="Alumni" />
      <main>
        <section className="bg-lavender px-5 pb-[72px] pt-[120px]">
          <div className="mx-auto max-w-[1200px]">
            <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
              <Link href="/" className="hover:text-orange">
                Beranda
              </Link>
              <span className="mx-2">›</span>
              <span className="font-semibold text-navy">Kisah Alumni</span>
            </nav>
            <Reveal className="mx-auto mt-10 max-w-[680px] text-center">
              <p className="text-sm font-semibold uppercase tracking-[2px] text-orange">Bukti, bukan janji</p>
              <h1 className="heading-tracking mt-[11px] text-[30px] font-bold leading-[1.36] text-navy sm:text-[40px]">
                Kisah alumni <span className="text-orange">Rumbasha</span> yang menginspirasi
              </h1>
              <p className="mt-4 text-base leading-[1.5] text-muted">
                Dari bingung memilih SMA sampai diterima di sekolah impian. Dengarkan cerita mereka langsung.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="px-5 pt-14">
          <div className="mx-auto grid max-w-[1200px] gap-6 md:grid-cols-2">
            {stories.map((s, i) => (
              <Reveal key={s.name} delay={i * 0.1} y={30}>
                <StoryCard story={s} />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="px-5 pt-[96px]">
          <div className="mx-auto max-w-[1200px]">
            <Reveal className="text-center">
              <h2 className="heading-tracking text-[26px] font-bold leading-[1.36] text-navy sm:text-[32px]">
                Kata mereka tentang <span className="text-orange">Rumbasha</span>
              </h2>
            </Reveal>

            <div className="mt-8 flex flex-wrap justify-center gap-3" role="group" aria-label="Filter cabang">
              {branchFilters.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={`h-10 rounded-full border px-5 text-sm font-semibold transition ${filter === f ? "border-indigo bg-primary-soft text-indigo shadow-tab" : "border-line bg-white text-navy hover:border-line-strong"}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="mt-10 columns-1 gap-5 md:columns-2 lg:columns-3">
              {shown.map((a, i) => (
                <QuoteCard key={`${a.name}-${a.school}-${i}`} a={a} />
              ))}
            </div>
          </div>
        </section>

        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
