import Image from "next/image";
import { schoolLogos } from "./data";
import { Reveal } from "./motion";

/** "Asal Sekolah (logo berjalan)" — logo track sliding left in an endless loop. */
export default function SchoolMarquee() {
  const track = [...schoolLogos, ...schoolLogos];
  return (
    <section className="bg-white pb-[124px] pt-[72px]">
      <Reveal className="px-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-[2px] text-orange">Asal sekolah murid Rumbasha</p>
        <h2 className="heading-tracking mx-auto mt-2 max-w-[947px] text-[26px] font-bold leading-[1.36] text-navy sm:text-[32px]">
          Murid Rumbasha datang dari sekolah di <span className="text-orange">Bekasi dan Bogor</span>
        </h2>
      </Reveal>

      <div className="marquee-pause relative mt-6 overflow-hidden py-2">
        <div className="marquee-track flex w-max animate-marquee items-center" style={{ ["--marquee-duration" as string]: "32s" }}>
          {track.map((logo, i) => (
            <div key={i} className="group flex h-[72px] shrink-0 items-center px-10" title={logo.name}>
              <Image
                src={logo.src}
                alt={i < schoolLogos.length ? logo.name : ""}
                width={logo.w}
                height={72}
                style={{ width: "auto" }}
                className="h-[72px] w-auto object-contain transition duration-300 group-hover:-translate-y-1 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
        {/* Fade kiri / Fade kanan */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-white/0 sm:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-white/0 sm:w-40" />
      </div>
    </section>
  );
}
