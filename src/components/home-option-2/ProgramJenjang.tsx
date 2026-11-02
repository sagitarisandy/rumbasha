"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { jenjangColumns } from "./data";
import { BookIllustration, ClipboardIllustration, GraduationIllustration, PromoBolt, Pyramid3D, SquareRing3D } from "./icons";
import { RevealGroup, RevealItem } from "./motion";

const icons = {
  clipboard: ClipboardIllustration,
  graduation: GraduationIllustration,
  book: BookIllustration,
};

/** Counts down to the next midnight so the promo pill always shows a live timer. */
function useCountdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      setLeft(Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  // Static design values until the client clock is known.
  if (left === null) return ["11", "08", "12"];
  const pad = (n: number) => String(n).padStart(2, "0");
  return [pad(Math.floor(left / 3600)), pad(Math.floor((left % 3600) / 60)), pad(left % 60)];
}

function TimeBox({ value }: { value: string }) {
  return (
    <span className="relative grid h-[23px] min-w-[23px] place-items-center overflow-hidden rounded bg-white/30 px-0.5 text-base font-medium tabular-nums">
      <motion.span key={value} initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
        {value}
      </motion.span>
    </span>
  );
}

function PromoCard() {
  const [h, m, s] = useCountdown();
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 9) return;
    setSent(true);
  };

  return (
    <motion.div
      id="daftar"
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[831px] scroll-mt-32 pt-8"
    >
      {/* Countdown pill */}
      <div className="absolute left-1/2 top-0 z-20 flex -translate-x-1/2 items-center">
        <PromoBolt uid="promo-bolt" className="relative z-10 -mr-3 h-[59px] w-[39px] motion-safe-anim animate-[float_3s_ease-in-out_infinite]" />
        <div className="flex h-[37px] items-center gap-3 whitespace-nowrap rounded-3xl bg-[linear-gradient(90deg,#e23f2a,#4349d7)] pl-5 pr-7 text-white shadow-[0_8px_20px_rgb(67_73_215/0.25)]">
          <span className="text-sm font-medium sm:text-base">Promo berakhir dalam</span>
          <span className="flex items-center gap-1.5">
            <TimeBox value={h} />:<TimeBox value={m} />:<TimeBox value={s} />
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[15px] bg-white px-6 pb-8 pt-10 shadow-[0_20px_50px_rgb(14_17_104/0.18)] md:h-[193px] md:pb-0">
        {/* Background decorations */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(247_132_51/0.3),rgb(176_177_242/0)_70%)]" />
          <Pyramid3D uid="promo-pyramid" className="absolute -top-6 right-6 w-[146px] rotate-[122deg] opacity-[0.12]" />
          <div className="absolute -bottom-24 -left-6 h-[158px] w-[158px] rounded-full bg-peach blur-[80px]" />
          <SquareRing3D uid="promo-ring" className="absolute -bottom-10 left-[300px] w-[208px] rotate-6 opacity-20" />
        </div>

        <div className="relative">
          <div>
            <p className="text-lg font-medium leading-[1.4] text-indigo-700 sm:text-xl">Daftarkan nomor WhatsApp-mu dapatkan</p>
            <p className="mt-2 max-w-[441px] text-[28px] font-bold leading-[1.3125] text-promo-red sm:text-[32px]">
              kelas trial GRATIS + potongan kursus 30%!
            </p>
          </div>
          <form onSubmit={submit} className="mt-6 flex h-[51px] items-center gap-2 rounded-xl bg-white pl-[17px] pr-2 shadow-[0_4px_12px_rgb(0_0_0/0.1)] md:absolute md:bottom-0 md:right-[3px] md:mt-0 md:w-[369px]">
            {sent ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 text-sm font-semibold text-whatsapp">
                Terima kasih! Admin kami akan menghubungi via WhatsApp.
              </motion.p>
            ) : (
              <>
                <label htmlFor="promo-phone" className="sr-only">
                  Nomor WhatsApp
                </label>
                <input
                  id="promo-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xx xxxx xxxx"
                  className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-navy outline-none placeholder:text-[#979797] sm:text-2xl"
                />
                <button
                  type="submit"
                  className="h-[35px] shrink-0 rounded-lg bg-[#f58432] px-2.5 text-base font-semibold text-white shadow-[0_4px_12px_rgb(0_0_0/0.1)] transition hover:bg-orange-600"
                >
                  Ambil Promo
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProgramJenjang() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} className="relative z-10 -mt-[41px] flow-root">
      {/* The WhatsApp promo card straddles the hero and this section, like the design. */}
      <div className="relative z-20 -mb-[125px] px-5 lg:-mt-[100px]">
        <PromoCard />
      </div>

      <div id="program-jenjang" className="relative overflow-hidden rounded-[32px] bg-navy">
        <motion.div style={{ y: bgY }} className="absolute -inset-x-[8%] -inset-y-[10%]">
          <Image src="/images/kelas-kosong.webp" alt="" fill sizes="100vw" loading="eager" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-navy/[0.78]" />

        <RevealGroup className="relative mx-auto grid max-w-[1240px] gap-14 px-5 pb-[110px] pt-[180px] md:grid-cols-3 md:gap-[80px] lg:pt-[256px]">
          {jenjangColumns.map((col) => {
            const Icon = icons[col.icon];
            return (
              <RevealItem key={col.title} className="flex flex-col items-center text-center text-white">
                <motion.div
                  whileHover={{ scale: 1.08, rotate: -4 }}
                  className="grid h-20 w-20 place-items-center rounded-full bg-white shadow-badge"
                >
                  <Icon className="h-20 w-20" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="mt-[30px] max-w-[360px] text-lg font-bold leading-[1.36] tracking-[0.03em]">{col.title}</h3>
                  <p className="mt-3 max-w-[360px] text-base leading-[1.5] text-white/85">{col.body}</p>
                </div>
                <a
                  href="#program"
                  className="mt-9 inline-flex h-12 items-center rounded-xl bg-orange px-6 pt-px text-[13px] font-bold tracking-[1.4px] transition hover:-translate-y-0.5 hover:bg-[#ff9248]"
                >
                  {col.cta}
                </a>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
