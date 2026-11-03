import { whatsappUrl } from "./data";
import { WhatsAppIcon } from "./icons";

/** "Chat Admin" button pinned to the bottom-right corner of the landing pages. */
export default function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat Admin via WhatsApp"
      className="group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_12px_28px_rgb(19_166_90/0.4)] transition hover:-translate-y-0.5 hover:bg-[#0f8f4d] lg:bottom-8 lg:right-8 lg:h-16 lg:w-16"
    >
      <span aria-hidden className="motion-safe-anim absolute inset-0 animate-pulse-ring rounded-full border-2 border-whatsapp" />
      <WhatsAppIcon className="h-7 w-7 lg:h-8 lg:w-8" />
      <span
        aria-hidden
        className="pointer-events-none absolute right-full mr-3 hidden translate-x-1 whitespace-nowrap rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold opacity-0 shadow-float transition group-hover:translate-x-0 group-hover:opacity-100 lg:block"
      >
        Chat Admin
      </span>
    </a>
  );
}
