import Image from "next/image";
import { alumniRowOne, alumniRowTwo, stats, type Alumni } from "./data";
import { AlumniIllustration, ChartIllustration, GraduationIllustration, LocationIllustration, SquareRing3D } from "./icons";
import { CountUp, Reveal, RevealGroup, RevealItem } from "./motion";

const statIcons = {
  graduation: GraduationIllustration,
  chart: ChartIllustration,
  alumni: AlumniIllustration,
  location: LocationIllustration,
};

function AlumniCard({ alumni }: { alumni: Alumni }) {
  return (
    <div className="flex h-[81px] w-[246px] shrink-0 items-center gap-[13px] rounded-lg border border-line/60 bg-[#fcfcff] pl-[9px] transition hover:-translate-y-1 hover:border-line hover:shadow-float">
      <Image src={alumni.photo} alt={alumni.name} width={65} height={65} className="h-[65px] w-[65px] rounded object-cover" />
      <div className="min-w-0 leading-[1.5]">
        <p className="truncate text-base font-semibold text-navy">{alumni.name}</p>
        <p className="truncate text-sm font-medium text-indigo/70">{alumni.school}</p>
        <p className="truncate text-sm font-medium text-muted-2/70">{alumni.branch}</p>
      </div>
    </div>
  );
}

function AlumniRow({ items, reverse, offset }: { items: Alumni[]; reverse?: boolean; offset?: boolean }) {
  // Two copies so the -50% translate loops seamlessly.
  const track = [...items, ...items];
  return (
    <div className="marquee-pause overflow-hidden">
      <div
        className={`marquee-track flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"} ${offset ? "pl-[94px]" : ""}`}
        style={{ ["--marquee-duration" as string]: "45s" }}
      >
        {track.map((a, i) => (
          <div key={i} className="pr-3.5">
            <AlumniCard alumni={a} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** "Bukti Lolos PTN" — stats with count-up and two alumni rows scrolling in opposite directions. */
export default function BuktiAlumni() {
  return (
    <section id="alumni" className="relative scroll-mt-28 pb-[104px]">
      <SquareRing3D uid="bukti-ring" className="motion-safe-anim pointer-events-none absolute -left-[23px] top-[143px] hidden w-[208px] rotate-6 animate-float-slow opacity-20 lg:block" />

      <div className="mx-auto max-w-[1200px] px-5 xl:px-0">
        <Reveal className="grid gap-6 lg:grid-cols-[620px_1fr] lg:gap-[120px]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[2px] text-orange">Bukti, bukan janji</p>
            <h2 className="heading-tracking mt-[11px] text-[26px] font-bold leading-[1.36] text-navy sm:text-[32px]">
              Ribuan murid Rumbasha sudah duduk di SMA favoritnya
            </h2>
          </div>
          <p className="max-w-[460px] text-base leading-[1.5] text-muted lg:pt-9">
            Angka diterima dihitung dari data alumni setiap tahun ajaran, bukan perkiraan.
          </p>
        </Reveal>

        <RevealGroup className="mt-[60px] grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {stats.map((stat, i) => {
            const Icon = statIcons[stat.icon];
            return (
              <RevealItem key={stat.label} className="relative flex items-start gap-4">
                {i > 0 && <span aria-hidden className="absolute -left-7 top-0 hidden h-20 w-px bg-lavender-200 lg:block" />}
                <div className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-white shadow-badge">
                  <Icon className="h-[68px] w-[68px]" />
                </div>
                <div>
                  <p className={`text-[32px] font-bold leading-[1.2] tracking-[0.03em] ${"highlight" in stat ? "text-orange" : "text-navy"}`}>
                    <CountUp value={stat.value} suffix={stat.suffix} format={stat.format} />
                  </p>
                  <p className="mt-1 text-base font-medium leading-[1.5] text-muted">{stat.label}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>

      <Reveal delay={0.1} className="mt-[64px] space-y-3.5">
        <AlumniRow items={alumniRowOne} />
        <AlumniRow items={alumniRowTwo} reverse offset />
      </Reveal>
    </section>
  );
}
