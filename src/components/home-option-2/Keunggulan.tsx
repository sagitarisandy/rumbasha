"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { keunggulanSlides } from "./data";
import { ChevronLeftThin, ChevronRightThin, Pyramid3D } from "./icons";
import { Reveal } from "./motion";

const ease = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 5000;

/** "Keunggulan Rumbasha (carousel)" — orange band + autoplaying circular photo carousel. */
export default function Keunggulan() {
  const [[index, direction], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const total = keunggulanSlides.length;
  const slide = keunggulanSlides[index];

  const go = useCallback(
    (delta: number) => setState(([i]) => [(i + delta + total) % total, delta]),
    [total],
  );

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, paused, reduce, go]);

  return (
    <section className="relative overflow-x-clip px-5 pb-[120px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Decorations */}
      <div aria-hidden className="absolute -left-[79px] top-[536px] hidden h-[260px] w-[260px] rounded-full bg-indigo/[0.04] lg:block" />
      <Pyramid3D uid="keunggulan-pyramid" className="motion-safe-anim absolute right-[20px] top-[650px] hidden w-[146px] rotate-[122deg] opacity-[0.12] lg:block" />

      <Reveal y={20} className="relative mx-auto max-w-[1220px]">
        <div className="rounded-[20px] bg-orange px-6 py-10 text-center lg:h-[124px] lg:py-0 lg:pt-10">
          <p className="heading-tracking text-xl font-bold leading-[1.36] text-navy sm:text-[28px]">
            Rumbasha membantu anak Anda unggul, dari SD sampai SMA favorit.
          </p>
        </div>
        <svg viewBox="0 0 44 22" className="mx-auto -mt-px block h-[22px] w-11" aria-hidden>
          <path d="M0 0h44L22 22z" fill="#f78433" />
        </svg>
      </Reveal>

      <Reveal delay={0.1} className="mx-auto mt-[54px] max-w-[1000px] text-center text-lg leading-[1.5] text-muted">
        Program belajar Rumbasha dirancang supaya anak memahami materi, bukan sekadar menghafal. Manfaatnya terasa di rapor, saat TKA, sampai seleksi
        masuk SMA.
      </Reveal>

      <div className="relative mx-auto mt-14 max-w-[1200px]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Slide sebelumnya"
            className="grid h-12 w-12 place-items-center rounded-full text-orange transition hover:-translate-x-1 hover:bg-orange/10"
          >
            <ChevronLeftThin className="h-12 w-12" />
          </button>

          {/* Photo ring */}
          <div className="relative h-[200px] w-[200px] sm:h-[240px] sm:w-[240px]">
            <div className="absolute inset-0 rounded-full bg-ring" />
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={index}
                  custom={direction}
                  variants={{
                    enter: (d: number) => ({ opacity: 0, x: d * 80, scale: 1.15, rotate: d * 6 }),
                    center: { opacity: 1, x: 0, scale: 1, rotate: -2 },
                    exit: (d: number) => ({ opacity: 0, x: d * -80, scale: 0.9 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.7, ease }}
                  className="absolute inset-[-14px]"
                >
                  <Image src={slide.image} alt="" fill sizes="270px" className="object-cover" />
                </motion.div>
              </AnimatePresence>
            </div>
            <motion.div
              key={`badge-${index}`}
              initial={{ scale: 0.4, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              className="absolute -left-8 top-2.5 grid h-[76px] w-[76px] place-items-center rounded-full bg-orange text-4xl font-bold tracking-[0.03em] text-white shadow-cta"
            >
              {index + 1}
            </motion.div>
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Slide berikutnya"
            className="grid h-12 w-12 place-items-center rounded-full text-orange transition hover:translate-x-1 hover:bg-orange/10"
          >
            <ChevronRightThin className="h-12 w-12" />
          </button>
        </div>

        <div className="relative mt-10 min-h-[110px] text-center" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <h3 className="text-base font-bold leading-[1.36] tracking-[0.03em] text-indigo sm:text-lg">{slide.title}</h3>
              <p className="mx-auto mt-[15px] max-w-[660px] text-base leading-[1.5] text-muted">{slide.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-[42px] flex items-center justify-center gap-2.5">
          {keunggulanSlides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setState([i, i > index ? 1 : -1])}
              aria-label={`Ke slide ${i + 1}`}
              className="relative grid h-4 w-4 place-items-center"
            >
              <span className={`block rounded-full transition-all duration-300 ${i === index ? "h-2.5 w-2.5 bg-orange" : "h-2 w-2 bg-[#d9dcef] hover:bg-orange/50"}`} />
              {i === index && !paused && !reduce && (
                <svg viewBox="0 0 16 16" className="absolute inset-0 -rotate-90" aria-hidden>
                  <motion.circle
                    key={index}
                    cx="8"
                    cy="8"
                    r="7"
                    fill="none"
                    stroke="#f78433"
                    strokeWidth="1.2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
