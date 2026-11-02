"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { aktivitasPhotos } from "./data";
import { Reveal } from "./motion";

/** "Fasilitas Belajar" — tilted photo collage whose rows drift in opposite directions on scroll. */
export default function Aktivitas() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rowOneX = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const rowTwoX = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  return (
    <section
      id="fasilitas"
      ref={ref}
      className="relative scroll-mt-28 overflow-hidden bg-[linear-gradient(180deg,#ffffff_0,#ffffff_229px,#f4f5ff_670px)] pb-[60px]"
    >
      <Reveal className="px-5 text-center">
        <h2 className="heading-tracking text-[26px] font-bold leading-[1.36] text-navy sm:text-[32px]">
          Aktivitas belajar di <span className="text-orange">Rumbasha</span>
        </h2>
      </Reveal>

      <div className="relative mt-[26px] h-[540px]">
        <div className="absolute left-1/2 top-0 h-[540px] w-[1440px] -translate-x-1/2">
          {[1, 2].map((row) => (
            <motion.div key={row} style={{ x: row === 1 ? rowOneX : rowTwoX }} className="absolute inset-0">
              {aktivitasPhotos
                .filter((p) => p.row === row)
                .map((p, i) => (
                  <motion.div
                    key={p.src}
                    initial={{ opacity: 0, y: 50, rotate: 0 }}
                    whileInView={{ opacity: 1, y: 0, rotate: p.rot }}
                    viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ rotate: 0, scale: 1.06, zIndex: 10, transition: { duration: 0.3 } }}
                    className={`absolute cursor-pointer overflow-hidden rounded-[18px] shadow-photo ${p.tint ? "bg-ring" : "bg-white"}`}
                    style={{ left: p.x, top: p.y, width: p.w, height: p.h }}
                  >
                    <Image src={p.src} alt="Kegiatan belajar di Rumbasha" fill sizes={`${p.w}px`} className="object-cover" />
                  </motion.div>
                ))}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
