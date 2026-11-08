"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { BookIllustration, DotGrid, HeroBlob, PencilIllustration, PlusPair } from "./icons";
import { CountUp } from "./motion";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease },
});

// Positions inside the art box are percentages of the Penpot frame (667×528, origin at hero image).
const pct = (v: number, total: number) => `${(v / total) * 100}%`;
const ART_W = 667;
const ART_H = 528;

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section ref={ref} className="relative bg-lavender pb-40 pt-[132px] lg:h-[920px] lg:pb-0 lg:pt-0">
      <div className="relative mx-auto h-full max-w-[1200px] px-5 xl:px-0">
        <div className="relative z-10 max-w-[600px] lg:pt-[190px]">
          <motion.p {...fadeUp(0.1)} className="text-sm font-semibold uppercase tracking-[0.6px] text-orange">
            Satu Partner untuk Seluruh Jenjang • SD - SMP - SMA
          </motion.p>
          <motion.h1
            {...fadeUp(0.2)}
            className="mt-4 text-[32px] font-extrabold uppercase leading-[1.15] tracking-normal text-navy sm:text-[40px] lg:text-[44px]"
          >
            Dari Langkah Pertama, Menuju <span className="text-orange">Puncak Prestasi</span> Bersama Rumbasha
          </motion.h1>
          <motion.p {...fadeUp(0.3)} className="mt-6 max-w-[540px] text-base lg:text-lg font-medium leading-[1.5] text-navy">
            Menemani perjalanan akademik dari SD hingga SMA untuk membangun fondasi berpikir kritis yang kokoh. Bersama Rumbasha, anak didik dilatih menguasai materi secara mendalam agar tumbuh menjadi pribadi yang percaya diri menghadapi seleksi masa depan
          </motion.p>
          <motion.div {...fadeUp(0.4)} className="mt-[26px] flex flex-wrap gap-3.5">
            <a
              href="#daftar"
              className="inline-flex h-[52px] items-center rounded-xl bg-orange px-[26px] text-base font-semibold text-white shadow-cta transition hover:-translate-y-0.5 hover:bg-[#ff9248]"
            >
              Konsultasikan Kurikulum Anak
            </a>
            <a
              href="#kontak"
              className="inline-flex h-[52px] items-center rounded-xl border-[1.5px] border-navy px-[26px] text-base font-semibold text-navy transition hover:bg-navy hover:text-white"
            >
              Lokasi Terdekat
            </a>
          </motion.div>
        </div>

        {/* Right-hand art */}
        <div className="relative mx-auto mt-12 aspect-[667/528] w-full max-w-[667px] lg:absolute lg:left-[564px] lg:top-[150px] lg:mt-0 lg:w-[667px] xl:left-[564px]">
          <motion.div
            style={{ y: blobY, left: pct(27, ART_W), top: pct(92, ART_H), width: pct(628, ART_W) }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease }}
            className="absolute"
          >
            <HeroBlob uid="hero" className="h-auto w-full motion-safe-anim animate-[float_10s_ease-in-out_infinite]" />
          </motion.div>

          <motion.div style={{ y: photoY, width: pct(658, ART_W) }} className="absolute left-0 top-0">
            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35, ease }}>
              <Image
                src="/images/hero-siswa.webp"
                alt="Dua siswa SMA tersenyum membawa buku dan tas"
                width={1320}
                height={1039}
                preload
                sizes="(min-width: 1024px) 658px, 90vw"
                className="h-auto w-full"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="absolute"
            style={{ left: pct(20, ART_W), top: pct(36, ART_H), width: pct(96, ART_W) }}
          >
            <DotGrid uid="hero-dots" className="h-auto w-full motion-safe-anim animate-float-slow" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.9 }}
            className="absolute"
            style={{ left: pct(390, ART_W), top: pct(55, ART_H), width: pct(76, ART_W) }}
          >
            <div className="motion-safe-anim aspect-square w-full animate-float rounded-full bg-white shadow-badge">
              <BookIllustration className="h-full w-full" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute"
            style={{ left: pct(598, ART_W), top: pct(127, ART_H), width: pct(60, ART_W) }}
          >
            <PlusPair uid="hero-plus" className="h-auto w-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30, rotate: -30 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 12, delay: 1.05 }}
            className="absolute"
            style={{ left: pct(23, ART_W), top: pct(408, ART_H), width: pct(76, ART_W) }}
          >
            <PencilIllustration className="motion-safe-anim h-auto w-full animate-[float_5s_ease-in-out_infinite]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.15, ease }}
            className="absolute"
            style={{ left: pct(387, ART_W), top: pct(420, ART_H), width: pct(280, ART_W) }}
          >
            <div className="motion-safe-anim flex animate-float-slow flex-col items-center rounded-[18px] bg-white px-3 pb-5 pt-[18px] shadow-[0_16px_36px_rgb(14_17_104/0.2)]">
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex">
                  {["/images/kisah-rizky.webp", "/images/kisah-dinda.webp", "/images/cta-siswi.webp", "/images/siswa-sd.webp"].map((src, i) => (
                    <Image
                      key={src}
                      src={src}
                      alt=""
                      width={40}
                      height={40}
                      className={`h-8 w-8 rounded-full border-2 border-[#ffad44] bg-lavender-200 object-cover object-top sm:h-10 sm:w-10 ${i ? "-ml-2.5" : ""}`}
                    />
                  ))}
                </div>
                <p className="text-xl font-bold tracking-[0.03em] text-indigo sm:text-2xl">
                  <CountUp value={12000} format="thousands" suffix="+" duration={2} />
                </p>
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.5px] text-indigo sm:text-[13px]">Murid Rumbasha lolos PTN</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
