"use client";

import Image from "next/image";
import { useState } from "react";
import { Reveal } from "./motion";

type Branch = { name: string; address: string; photo: string; query: string };

// (lanjutan) Placeholder addresses and photos: replace with the real branch data before launch.
const branches: Branch[] = [
  {
    name: "Bekasi - Rumbasha Bekasi",
    address: "Jl. Raya Narogong No. 12, Bekasi, Jawa Barat 17115",
    photo: "/images/fasilitas-kelas.webp",
    query: "Jl. Raya Narogong, Bekasi, Jawa Barat",
  },
  {
    name: "Bogor - Rumbasha Bogor",
    address: "Jl. Raya Pajajaran No. 25, Bogor, Jawa Barat 16143",
    photo: "/images/aktivitas/r1-2.webp",
    query: "Jl. Raya Pajajaran, Bogor, Jawa Barat",
  },
];

/** "Temukan Cabang Terdekat di Kotamu" — branch list with photos next to a Google Maps embed. */
export default function Cabang() {
  const [active, setActive] = useState(0);
  const branch = branches[active];
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(branch.query)}&z=15&hl=id&output=embed`;

  return (
    <section id="cabang" className="scroll-mt-24 px-5 pt-[120px] lg:pt-[151px]">
      <Reveal className="text-center">
        <h2 className="heading-tracking text-[26px] font-bold leading-[1.36] text-navy sm:text-[32px]">Temukan Cabang Terdekat di Kotamu</h2>
      </Reveal>

      <Reveal delay={0.1} className="mx-auto mt-10 max-w-[1200px]">
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          <ul className="flex flex-col gap-4 lg:self-start">
            {branches.map((b, i) => {
              const selected = i === active;
              return (
                <li key={b.name} className="flex">
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActive(i)}
                    className={`flex w-full items-center gap-4 rounded-[20px] border bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 ${selected ? "border-orange ring-1 ring-orange" : "border-lavender-200"}`}
                  >
                    <Image src={b.photo} alt="" width={144} height={144} className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover" />
                    <span>
                      <span className="block text-base font-semibold leading-[1.4] text-navy">{b.name}</span>
                      <span className="mt-0.5 block text-sm leading-[1.5] text-muted">{b.address}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <iframe
            key={branch.name}
            src={mapSrc}
            title={`Peta ${branch.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[360px] w-full rounded-[24px] border border-lavender-200 shadow-card lg:h-[480px]"
          />
        </div>
      </Reveal>
    </section>
  );
}
