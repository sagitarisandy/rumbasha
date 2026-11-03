import Image from "next/image";
import { footerColumns } from "./data";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, TikTokIcon, YouTubeIcon } from "./icons";
import { Reveal } from "./motion";

const socials = [
  { label: "Instagram", Icon: InstagramIcon },
  { label: "TikTok", Icon: TikTokIcon },
  { label: "YouTube", Icon: YouTubeIcon },
  { label: "Facebook", Icon: FacebookIcon },
];

const footerHref: Record<string, string> = {
  "Kelas Reguler": "/pricing",
  "Persiapan TKA SMP": "/pricing?jenjang=smp",
  "Kelas Privat": "/pricing",
  Fasilitas: "/#fasilitas",
  "Kisah Alumni": "/alumni/rizky",
  FAQ: "/#faq",
};

const contacts = [
  { Icon: PhoneIcon, text: "0812 3456 7890", href: "tel:081234567890" },
  { Icon: MailIcon, text: "halo@rumbasha.id", href: "mailto:halo@rumbasha.id" },
  { Icon: PinIcon, text: "Kab. Bekasi & Kab. Bogor" },
];

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <>
      <p className="text-lg font-medium leading-[1.4] text-white">{children}</p>
      <span className="mt-1 block h-[3px] w-6 rounded-sm bg-orange" />
    </>
  );
}

/** "Footer (glassy)" — gradient footer with blurred glows and a glass panel. */
export default function Footer() {
  return (
    <footer id="kontak" className="relative mt-[105px] overflow-hidden rounded-t-[40px] bg-[linear-gradient(135deg,#0e1168_0%,#1c2190_55%,#2b2fa8_100%)] text-white">
      <div aria-hidden className="motion-safe-anim absolute -top-[170px] left-[72%] h-[520px] w-[520px] animate-float-slow rounded-full bg-orange/45 blur-[140px]" />
      <div aria-hidden className="absolute -left-[180px] top-[160px] h-[560px] w-[560px] rounded-full bg-[#5b63f5]/45 blur-[150px]" />
      <div aria-hidden className="absolute left-[39%] top-[260px] h-[360px] w-[360px] rounded-full bg-[#8a5cf6]/[0.22] blur-[120px]" />

      <div className="relative mx-auto max-w-[1280px] px-5 pb-[53px] pt-7 xl:px-0">
        <Reveal y={20} className="rounded-3xl border border-white/[0.16] bg-[linear-gradient(135deg,rgb(255_255_255/0.12),rgb(255_255_255/0.04))] p-8 shadow-[0_20px_50px_rgb(5_7_58/0.25)] backdrop-blur-md xl:h-[260px] xl:px-10 xl:py-8">
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[380px_190px_190px_200px_1fr] xl:gap-0">
            <div>
              <Image src="/images/logo-rumbasha-putih.webp" alt="Rumbasha Learning Center" width={560} height={174} className="h-auto w-[150px]" />
              <p className="mt-4 max-w-[300px] text-sm leading-[1.714] text-footer-link">
                Bimbingan belajar untuk murid SD dan SMP, fokus mengantar murid lolos ke SMA favorit.
              </p>
              <div className="mt-[18px] flex gap-3">
                {socials.map(({ label, Icon }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.18] bg-white/[0.08] transition hover:-translate-y-1 hover:bg-orange"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>
            </div>

            {footerColumns.map((col) => (
              <div key={col.title} className="pt-1">
                <ColumnTitle>{col.title}</ColumnTitle>
                <ul className="mt-2.5 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href={footerHref[link] ?? "#"} className="text-sm leading-[1.714] text-footer-link transition hover:text-white">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="pt-1">
              <ColumnTitle>Kontak</ColumnTitle>
              <ul className="mt-2.5 space-y-2.5">
                {contacts.map(({ Icon, text, href }) => (
                  <li key={text} className="flex items-center gap-2.5 text-sm leading-[1.714] text-footer-link">
                    <Icon className="h-[18px] w-[18px] shrink-0 text-orange" />
                    {href ? (
                      <a href={href} className="transition hover:text-white">
                        {text}
                      </a>
                    ) : (
                      text
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <div className="mt-[55px] flex flex-col gap-2 px-0 text-sm leading-[1.714] text-white/60 sm:flex-row sm:justify-between xl:px-10">
          <p>© 2026 Rumbasha Learning Center. Hak cipta dilindungi.</p>
          <p className="font-medium">Bimbel SD dan SMP</p>
        </div>
      </div>
    </footer>
  );
}
