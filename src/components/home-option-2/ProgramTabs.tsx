"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { programs } from "./data";
import { DotGrid, PlusPair, ProgramBlob, Zigzag } from "./icons";
import { Reveal } from "./motion";

const ease = [0.22, 1, 0.36, 1] as const;

/** "Program Belajar (3 jenjang)" — tabbed program card. */
export default function ProgramTabs() {
  const [active, setActive] = useState(programs[0].id);
  const program = programs.find((p) => p.id === active) ?? programs[0];

  return (
    <section id="program" className="relative scroll-mt-28 px-5 pb-[85px]">
      <Reveal className="text-center">
        <h2 className="heading-tracking text-[26px] font-bold leading-[1.36] text-navy sm:text-[32px]">
          Program belajar di <span className="text-orange">Rumbasha</span>
        </h2>
        <p className="mt-3 text-base leading-[1.5] text-navy/80">Pilih jenjang dulu, lalu lihat program yang tersedia.</p>
      </Reveal>

      <div className="relative mx-auto max-w-[1200px]">
        {/* Decorations around the tabs */}
        <Zigzag uid="program-zig" className="motion-safe-anim absolute left-[65px] top-[41px] hidden w-[129px] animate-float-slow lg:block" />
        <DotGrid uid="program-dots" className="motion-safe-anim absolute right-[-12px] top-[33px] hidden w-24 animate-float lg:block" />
        <PlusPair uid="program-plus" className="absolute -left-20 top-[377px] hidden w-[60px] xl:block" />

        <Reveal delay={0.1} className="flex justify-center pt-[26px]">
          <div role="tablist" aria-label="Jenjang" className="flex rounded-xl bg-lavender-200 p-[5px]">
            {programs.map((p) => (
              <button
                key={p.id}
                role="tab"
                type="button"
                aria-selected={p.id === active}
                onClick={() => setActive(p.id)}
                className={`relative h-11 rounded-lg px-5 font-tight text-base font-semibold transition-colors ${
                  p.id === active ? "text-navy" : "text-navy/70 hover:text-navy"
                }`}
              >
                {p.id === active && (
                  <motion.span
                    layoutId="program-tab-pill"
                    className="absolute inset-0 rounded-lg bg-white shadow-[0_2px_8px_rgb(14_17_104/0.1)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{p.tab}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-[38px]">
          <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-[#d0d3f1] bg-white shadow-card">
            <motion.div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[120px]"
              animate={{ background: `linear-gradient(180deg, rgb(255 255 255 / 0), ${program.wash})` }}
              transition={{ duration: 0.6 }}
            />

            {/* Right art */}
            <div className="relative h-[300px] md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[466px]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.6, ease }}
                  className="absolute inset-0"
                >
                  <ProgramBlob uid={`program-blob-${program.id}`} palette={program.palette} className="absolute inset-0 h-full w-full" />
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.1, ease }}
                    className={`absolute ${program.photo.className}`}
                  >
                    <Image
                      src={program.photo.src}
                      alt={program.photo.alt}
                      width={program.photo.width}
                      height={program.photo.height}
                      sizes="560px"
                      className="h-auto w-full drop-shadow-[0_12px_24px_rgb(14_17_104/0.18)]"
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Left content */}
            <div className="relative px-6 pb-10 pt-8 md:max-w-[640px] md:px-14 md:pb-[47px] md:pt-[47px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <h3 className="font-tight text-[28px] font-bold leading-[1.25] text-navy">{program.title}</h3>
                  <p className="mt-[17px] max-w-[520px] font-tight text-base leading-[1.6] text-navy/85">{program.description}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {program.chips.map((chip, i) => (
                      <motion.li
                        key={chip}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 + i * 0.07 }}
                        className="rounded-lg bg-chip px-3.5 py-[7px] font-tight text-sm font-semibold leading-[1.3] text-navy"
                      >
                        {chip}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
              <a
                href="#daftar"
                className="mt-8 inline-flex h-[52px] items-center rounded-xl bg-orange px-[26px] text-base font-semibold text-white shadow-cta transition hover:-translate-y-0.5 hover:bg-[#ff9248]"
              >
                Daftar Sekarang
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
