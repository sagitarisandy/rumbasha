"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { videoStories } from "./data";
import { PlayIcon } from "./icons";
import { Reveal } from "./motion";

type Video = { title: string; image: string };

function PlayButton({ className = "" }: { className?: string }) {
  return (
    <span className={`grid place-items-center ${className}`}>
      <span className="motion-safe-anim absolute inset-[4px] animate-pulse-ring rounded-full border-2 border-white/70" />
      <PlayIcon className="relative h-full w-full transition-transform duration-300 group-hover:scale-110" />
    </span>
  );
}

function VideoModal({ video, onClose }: { video: Video; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center bg-navy/70 p-5 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="relative aspect-video w-full max-w-[960px] overflow-hidden rounded-3xl bg-navy shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={video.image} alt="" fill sizes="960px" className="object-cover opacity-40" />
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-white">
          <div>
            <PlayButton className="relative mx-auto h-20 w-20" />
            <p className="mt-6 text-2xl font-bold">{video.title}</p>
            <p className="mt-2 text-white/80">Video akan dipasang di sini (placeholder wireframe).</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-xl text-white transition hover:bg-white/30"
          aria-label="Tutup video"
        >
          ×
        </button>
      </motion.div>
    </motion.div>
  );
}

/** "Video" — main story video plus two student stories. */
export default function VideoStories() {
  const [playing, setPlaying] = useState<Video | null>(null);

  return (
    <section className="px-5 pb-[100px]">
      <Reveal className="text-center">
        <h2 className="heading-tracking text-[26px] font-bold leading-[1.36] text-navy sm:text-[32px]">
          Cerita dari kelas <span className="text-orange">Rumbasha</span>
        </h2>
      </Reveal>

      <div className="mx-auto mt-[46px] max-w-[1200px] space-y-10">
        <Reveal>
          <button
            type="button"
            onClick={() => setPlaying({ title: "Lihat Cara Rumbasha Membantu Anak Belajar", image: "/images/video-utama.webp" })}
            className="group relative block h-[320px] w-full overflow-hidden rounded-3xl text-left sm:h-[440px]"
          >
            <Image
              src="/images/video-utama.webp"
              alt="Murid mengangkat tangan di kelas"
              fill
              sizes="(min-width: 1240px) 1200px, 100vw"
              className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(14_17_104/0.05),rgb(14_17_104/0.75))]" />
            <PlayButton className="absolute left-1/2 top-[90px] h-[100px] w-[100px] -translate-x-1/2 sm:top-[90px]" />
            <p className="absolute bottom-10 left-6 right-6 max-w-[640px] text-[28px] font-bold leading-[1.36] tracking-[0.03em] text-white sm:left-10 sm:text-[40px]">
              Lihat Cara Rumbasha Membantu Anak Belajar
            </p>
          </button>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {videoStories.map((story, i) => (
            <Reveal key={story.name} delay={i * 0.12}>
              <button
                type="button"
                onClick={() => setPlaying({ title: `Kisah ${story.name}`, image: story.image })}
                className="group relative block h-[330px] w-full overflow-hidden rounded-3xl text-left"
              >
                <Image
                  src={story.image}
                  alt={`Ilustrasi ${story.name}, murid Rumbasha`}
                  fill
                  sizes="(min-width: 768px) 590px, 100vw"
                  className="object-cover object-[50%_28%] transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(14_17_104/0.05),rgb(14_17_104/0.75))]" />
                <PlayButton className="absolute right-10 top-20 h-[100px] w-[100px]" />
                <div className="absolute bottom-[33px] left-8 right-8 text-white">
                  <p className="text-[32px] font-bold leading-[1.36] tracking-[0.03em]">{story.name}</p>
                  <span className="mt-2 block h-0.5 w-[180px] origin-left bg-white/80 transition-transform duration-500 group-hover:scale-x-125" />
                  <p className="mt-2.5 text-[22px] leading-[1.5]">{story.subtitle}</p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>{playing && <VideoModal video={playing} onClose={() => setPlaying(null)} />}</AnimatePresence>
    </section>
  );
}
