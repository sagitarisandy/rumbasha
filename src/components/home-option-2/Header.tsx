"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import Link from "next/link";
import { navItems, programMenu } from "./data";
import { ChevronDown } from "./icons";

export function PromoBar() {
  return (
    <div className="relative z-40 bg-navy text-white">
      <div className="mx-auto flex min-h-[52px] max-w-[1200px] flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 py-2 text-center text-[13px] sm:text-[15px]">
        <p className="font-bold leading-[1.7]">Promo Tahun Ajaran 2026/2027</p>
        <span aria-hidden className="hidden h-3.5 w-px bg-[#8c8fc7] sm:block" />
        <p className="font-medium leading-[1.7] text-soft">
          Kelas trial gratis dan potongan kursus 30%, berlaku sampai 31 Oktober 2026
        </p>
        <Link
          href="/#daftar"
          className="ml-1 inline-flex h-7 items-center rounded-lg bg-orange px-4 text-[13px] font-semibold transition hover:-translate-y-px hover:bg-[#ff9248]"
        >
          Daftar Sekarang
        </Link>
      </div>
    </div>
  );
}

export function Header({ active }: { active?: string }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));

  return (
    // Sticky floating header; the negative bottom margin lets the hero background run underneath it.
    <div className="sticky top-4 z-50 -mb-[92px] mt-4 px-4 lg:px-10">
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`mx-auto flex h-[76px] max-w-[1360px] items-center justify-between rounded-[18px] border border-line px-4 backdrop-blur-md transition-[background-color,box-shadow] duration-300 lg:px-[18px] ${
          scrolled ? "bg-white/95 shadow-[0_14px_36px_rgb(14_17_104/0.12)]" : "bg-white/80 shadow-[0_10px_30px_rgb(14_17_104/0.08)]"
        }`}
      >
        <Link href="/" aria-label="Rumbasha Learning Center" className="shrink-0">
          <Image src="/images/logo-rumbasha.webp" alt="Rumbasha Learning Center" width={560} height={174} preload className="ml-[18px] h-auto w-[130px] lg:w-[155px]" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Utama">
          {navItems.map((item) => (
            <div key={item.label} className="group relative">
              <Link href={item.href} className="relative flex items-center gap-1 py-2 text-[13px] font-medium text-navy">
                <span className="transition-colors group-hover:text-orange">{item.label}</span>
                {item.hasMenu && <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />}
                <span
                  className={`absolute -bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-orange transition-all duration-300 ${
                    item.label === active ? "opacity-100" : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                  } ${item.hasMenu ? "!left-6" : ""}`}
                />
              </Link>
              {item.hasMenu && (
                // Program dropdown — the per-jenjang pages are not designed yet.
                <div className="invisible absolute left-1/2 top-full z-10 w-52 -translate-x-1/2 translate-y-2 pt-4 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <ul className="rounded-2xl border border-line bg-white p-2 shadow-float">
                    {programMenu.map((label) => (
                      <li key={label}>
                        <a href="#" className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy transition hover:bg-lavender hover:text-orange">
                          {label}
                          <span className="text-[11px] font-normal text-muted-2">Segera</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-[18px] lg:flex">
          <Link
            href="/login"
            className="inline-flex h-[46px] items-center rounded-xl border-[1.5px] border-line-strong px-5 text-[13px] font-semibold text-indigo transition hover:border-indigo hover:bg-lavender"
          >
            Login
          </Link>
          <Link
            href="/#daftar"
            className="inline-flex h-[46px] items-center rounded-xl bg-orange px-5 text-[13px] font-semibold text-white shadow-cta transition hover:-translate-y-0.5 hover:bg-[#ff9248]"
          >
            Daftar Sekarang
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-line lg:hidden"
          aria-expanded={open}
          aria-label="Buka menu"
        >
          <span className="relative block h-3 w-5">
            <span className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-navy transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`absolute bottom-0 left-0 h-0.5 w-5 rounded bg-navy transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </span>
        </button>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-2 max-w-[1360px] rounded-[18px] border border-line bg-white p-4 shadow-float lg:hidden"
          >
            {navItems.map((item) => (
              <div key={item.label}>
                <Link href={item.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-navy hover:bg-lavender">
                  {item.label}
                </Link>
                {item.hasMenu && (
                  <div className="mb-1 ml-3 grid grid-cols-2 gap-1 border-l border-line pl-3">
                    {programMenu.map((label) => (
                      <a key={label} href="#" className="rounded-lg px-3 py-2 text-[13px] text-muted hover:bg-lavender">
                        {label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link href="/login" onClick={() => setOpen(false)} className="grid h-11 place-items-center rounded-xl border-[1.5px] border-line-strong text-sm font-semibold text-indigo">
                Login
              </Link>
              <Link href="/#daftar" onClick={() => setOpen(false)} className="grid h-11 place-items-center rounded-xl bg-orange text-sm font-semibold text-white">
                Daftar Sekarang
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
