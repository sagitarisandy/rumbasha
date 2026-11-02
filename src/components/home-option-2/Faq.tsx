"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { faqs } from "./data";
import { PlusIcon, WhatsAppIcon } from "./icons";
import { Reveal, RevealGroup, RevealItem } from "./motion";

/** FAQ accordion — first question open, like the design. */
export default function Faq({
  items = faqs,
  title = "Paling sering ditanyakan",
  className = "pt-[119px]",
}: {
  items?: { q: string; a: string }[];
  title?: string;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className={`scroll-mt-28 px-5 ${className}`}>
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[440px_760px] lg:gap-0">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[2px] text-orange">FAQ</p>
          <h2 className="heading-tracking mt-[11px] max-w-[380px] text-[26px] font-bold leading-[1.36] text-navy sm:text-[32px]">{title}</h2>
          <p className="mt-3.5 max-w-[360px] text-base leading-[1.5] text-muted">
            Belum menemukan jawabannya? Tim admin kami siap membantu setiap hari.
          </p>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noreferrer"
            className="mt-[42px] inline-flex h-[52px] items-center gap-2 rounded-xl bg-whatsapp px-6 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0f8f4d]"
          >
            Chat Admin <WhatsAppIcon className="h-6 w-6" />
          </a>
        </Reveal>

        <RevealGroup stagger={0.07} className="space-y-3">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <RevealItem key={item.q} y={16}>
                <div
                  className={`rounded-[18px] bg-white transition-[border-color,box-shadow] duration-300 ${
                    isOpen ? "border-[1.5px] border-indigo shadow-[0_10px_30px_rgb(63_65_151/0.12)]" : "border border-line hover:border-line-strong"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 px-8 py-5 text-left"
                  >
                    <span className="text-lg font-medium leading-[1.4] text-navy">{item.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 135 : 0, backgroundColor: isOpen ? "#3f4197" : "#f4f5ff", color: isOpen ? "#ffffff" : "#3f4197" }}
                      transition={{ duration: 0.3 }}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[640px] px-8 pb-6 text-base leading-[1.5] text-muted">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
