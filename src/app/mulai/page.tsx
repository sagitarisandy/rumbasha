import type { Metadata } from "next";
import Link from "next/link";
import { Logo, Rumbi } from "@/components/app/visuals";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "Rumbasha — Siap masuk SMA impianmu?" };

/** Welcome screen of the app (first screen on mobile). */
export default function MulaiPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[440px] flex-col px-6 pb-8 pt-8">
      <Logo className="w-[96px]" />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Rumbi pose="yey" className="h-[200px]" />
        <h1 className="mt-8 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink">Siap masuk SMA impianmu?</h1>
        <p className="mt-2 text-[15px] text-subtle">Modul, quiz, dan tryout bareng tutor Rumbasha. Untuk siswa SD dan SMP.</p>
      </div>
      <div className="flex flex-col gap-2">
        <LinkButton href="/masuk" size="lg" className="w-full">
          Masuk
        </LinkButton>
        <LinkButton href="/quiz-trial" variant="accent" size="lg" className="w-full">
          Coba quiz gratis
        </LinkButton>
        <p className="mt-2 text-center text-sm text-subtle">
          Belum punya akun?{" "}
          <Link href="/biaya" className="font-semibold text-primary">
            Lihat paket
          </Link>
        </p>
      </div>
    </main>
  );
}
