"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { FlameIcon, Zigzag } from "./icons";
import { Reveal } from "./motion";

/** "Siap melangkah ke SMA favorit" call-to-action banner. */
export default function CtaBanner() {
  return (
    <section className="px-5 pt-[120px] lg:pt-[151px]">
      <Reveal y={40} className="relative mx-auto max-w-[1200px]">
        <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#3f4197,#0e1168)] px-6 pb-12 pt-12 sm:px-16 sm:pb-[54px] sm:pt-14 lg:h-[380px]">
          <div aria-hidden className="motion-safe-anim absolute -top-[120px] left-[68%] h-[420px] w-[420px] animate-[float_12s_ease-in-out_infinite] rounded-full bg-white/[0.06]" />
          <motion.div
            aria-hidden
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-[76%] top-[180px] h-[300px] w-[300px] rounded-full bg-orange/90"
          />
          <Zigzag uid="cta-zig" className="motion-safe-anim absolute left-[668px] top-[116px] hidden w-[129px] animate-float lg:block" />
          <svg viewBox="0 0 33 33" className="motion-safe-anim absolute left-[1097px] top-[86px] hidden w-[33px] animate-spin-slow lg:block" aria-hidden>
            <rect x="3" y="3" width="27" height="27" rx="4" fill="#ffd1db" opacity="0.2" transform="rotate(25 16.5 16.5)" />
          </svg>

          <div className="relative max-w-[620px]">
            <p className="text-sm font-semibold uppercase tracking-[2px] text-peach">Pendaftaran TA 2026/2027 dibuka</p>
            <h2 className="heading-tracking mt-[13px] text-[26px] font-bold leading-[1.36] text-white sm:text-[32px]">
              Siap melangkah ke SMA favorit pilihanmu?
            </h2>
            <p className="mt-3 max-w-[560px] text-xl font-medium leading-[1.333] text-soft sm:text-2xl">
              Mulai dengan kelas trial gratis. Rasakan dulu cara belajarnya, baru putuskan.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/#daftar"
                className="inline-flex h-[52px] items-center rounded-xl bg-orange px-6 text-base font-semibold text-white shadow-cta transition hover:-translate-y-0.5 hover:bg-[#ff9248]"
              >
                Daftar Sekarang
              </Link>
              <a
                href="#kontak"
                className="inline-flex h-[52px] items-center rounded-xl bg-white px-6 text-base font-semibold text-navy transition hover:-translate-y-0.5 hover:bg-lavender"
              >
                Hubungi Kami
              </a>
            </div>
          </div>
        </div>

        {/* Student photo breaks out of the top edge of the banner. */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute -top-[30px] right-0 hidden w-[457px] overflow-hidden rounded-br-[32px] lg:block"
        >
          <Image src="/images/cta-siswi.webp" alt="Siswi berhijab putih tersenyum menunjuk ke atas" width={457} height={410} className="h-auto w-full" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.6 }}
          className="absolute left-[677px] top-[229px] hidden lg:block"
        >
          <div className="motion-safe-anim w-[190px] animate-float rounded-2xl bg-white px-2.5 py-3 text-center shadow-[0_10px_24px_rgb(14_17_104/0.2)]">
            <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-navy">
              <FlameIcon className="h-5 w-5" /> Kuota terbatas
            </p>
            <p className="mt-1 whitespace-nowrap text-xs leading-[1.5] text-muted-2">Maksimal 10 murid per kelas</p>
          </div>
        </motion.div>
      </Reveal>
    </section>
  );
}
