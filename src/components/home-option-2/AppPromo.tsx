"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { appFeatures } from "./data";
import { BoltIcon, BooksIcon, ClipboardIcon, TrophyIcon } from "./icons";
import { Reveal, RevealGroup, RevealItem } from "./motion";

const featureIcons = { books: BooksIcon, bolt: BoltIcon, clipboard: ClipboardIcon, trophy: TrophyIcon };

function Phone({ className, screenClass, children }: { className: string; screenClass: string; children: React.ReactNode }) {
  return (
    <div className={`absolute rounded-[48px] bg-[#12132b] p-3 shadow-[0_24px_48px_rgb(14_17_104/0.28)] ${className}`}>
      <div className={`relative h-full w-full overflow-hidden rounded-[38px] bg-white ${screenClass}`}>{children}</div>
    </div>
  );
}

/** "Lanjutkan Belajar di Aplikasi" — feature list with two floating phone mockups. */
export default function AppPromo() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const backY = useTransform(scrollYProgress, [0, 1], [80, -40]);
  const frontY = useTransform(scrollYProgress, [0, 1], [40, -20]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-lavender lg:h-[640px]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 pt-[72px] lg:block xl:px-0">
        <div className="relative z-10 max-w-[560px]">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[2px] text-orange">Aplikasi Rumbasha</p>
            <h2 className="heading-tracking mt-[11px] max-w-[520px] text-[26px] font-bold leading-[1.36] text-navy sm:text-[32px]">
              Lanjutkan belajar di aplikasi <span className="text-orange">Rumbasha</span>
            </h2>
            <p className="mt-5 max-w-[500px] text-base leading-[1.5] text-muted">
              Belajar tidak berhenti di ruang kelas. Lewat aplikasi Rumbasha, murid bisa membuka lagi modul terakhir, latihan soal harian, ikut tryout, dan
              memantau peringkatnya dari rumah.
            </p>
          </Reveal>

          <RevealGroup stagger={0.08} className="mt-9 grid gap-x-0 gap-y-6 sm:grid-cols-[270px_280px]">
            {appFeatures.map((f) => {
              const Icon = featureIcons[f.icon];
              return (
                <RevealItem key={f.title} className="group flex items-center gap-3.5">
                  <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] bg-white shadow-[0_6px_16px_rgb(14_17_104/0.06)] transition group-hover:-translate-y-1 group-hover:shadow-float">
                    <Icon className="h-[26px] w-[26px]" />
                  </span>
                  <span>
                    <span className="block text-base font-semibold leading-[1.4] text-navy">{f.title}</span>
                    <span className="block text-sm leading-[1.4] text-muted">{f.body}</span>
                  </span>
                </RevealItem>
              );
            })}
          </RevealGroup>

          <Reveal delay={0.2} className="mt-9">
            <a
              href="#daftar"
              className="inline-flex h-[52px] items-center rounded-xl bg-orange px-[26px] text-base font-semibold text-white shadow-cta transition hover:-translate-y-0.5 hover:bg-[#ff9248]"
            >
              Coba Quiz Trial Gratis
            </a>
            <p className="mt-4 text-sm leading-[1.4] text-muted">Masuk dengan akun murid yang didapat saat mendaftar di Rumbasha.</p>
          </Reveal>
        </div>

        {/* Phone art. Coordinates follow the Penpot board (origin = content left edge at x 120). */}
        <div className="relative h-[560px] lg:absolute lg:left-[calc(50%-600px)] lg:top-0 lg:h-[640px] lg:w-[1240px]">
          <div className="absolute left-1/2 top-0 h-full w-[630px] -translate-x-1/2 lg:left-[640px] lg:w-[620px] lg:translate-x-0">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-10 top-[70px] h-[540px] w-[540px] rounded-full bg-[linear-gradient(135deg,#3f4197,#0e1168)]"
            />
            <div className="motion-safe-anim absolute left-[460px] top-[440px] h-[140px] w-[140px] animate-float-slow rounded-full bg-orange/90" />
            <div className="absolute left-0 top-[60px] h-[90px] w-[90px] rounded-full bg-indigo/[0.08]" />

            <motion.div style={{ y: backY }} className="absolute inset-0">
              <Phone className="left-[300px] top-[150px] h-[570px] w-[270px]" screenClass="">
                <div className="absolute inset-x-0 top-0 z-10 h-10 bg-white" />
                <div className="absolute left-1/2 top-2.5 z-10 h-5 w-[71px] -translate-x-1/2 rounded-[20px] bg-[#12132b]" />
                <Image src="/images/app-siswa-beranda.webp" alt="" width={246} height={1027} className="absolute left-0 top-[-353px] w-full" />
              </Phone>
            </motion.div>

            <motion.div style={{ y: frontY }} className="absolute inset-0">
              <Phone className="left-20 top-16 h-[660px] w-[314px]" screenClass="">
                <div className="absolute left-1/2 top-2.5 z-10 h-6 w-[84px] -translate-x-1/2 rounded-[20px] bg-[#12132b]" />
                {/* Screen slowly scrolls through the student home screen. */}
                <div className="motion-safe-anim absolute inset-x-0 top-0 animate-app-scroll">
                  <Image
                    src="/images/app-siswa-beranda.webp"
                    alt="Tampilan beranda siswa di aplikasi Rumbasha"
                    width={290}
                    height={1211}
                    className="w-full"
                  />
                </div>
              </Phone>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -left-[60px] top-[452px] max-lg:left-0"
            >
              <div className="motion-safe-anim flex h-16 w-[216px] animate-float items-center gap-2.5 rounded-2xl bg-white pl-3 shadow-float">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#fff3ea]">
                  <BoltIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold leading-[1.4] text-navy">Daily Quiz hari ini</span>
                  <span className="block text-xs leading-[1.4] text-muted">2x gratis · 10 soal</span>
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="absolute left-[386px] top-[84px] max-lg:left-auto max-lg:right-0"
            >
              <div className="motion-safe-anim flex h-16 w-[184px] animate-float-slow items-center gap-2.5 rounded-2xl bg-white pl-3 shadow-float">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#fff8e5]">
                  <TrophyIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold leading-[1.4] text-navy">Peringkat #12</span>
                  <span className="block text-xs leading-[1.4] text-muted">Naik 3 peringkat</span>
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
