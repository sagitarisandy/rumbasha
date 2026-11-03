import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo, Rumbi } from "@/components/app/visuals";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk — Rumbasha" };

export default function MasukPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[640fr_800fr]">
      <aside className="relative hidden flex-col bg-primary-soft p-10 lg:flex">
        <Logo className="w-[110px]" />
        <div className="grid flex-1 place-items-center">
          <Rumbi pose="baca" className="h-[260px]" />
        </div>
        <p className="max-w-[420px] text-[22px] font-semibold leading-snug text-ink">Modul, quiz, dan tryout dalam satu akun.</p>
        <p className="mt-2 text-sm text-subtle">Untuk siswa SD dan SMP Rumbasha.</p>
      </aside>
      <main className="flex flex-col px-6 py-8 lg:items-center lg:justify-center">
        <div className="lg:hidden">
          <Logo className="w-[96px]" />
        </div>
        <div className="mt-10 w-full max-w-[360px] lg:mt-0">
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink lg:text-center">Masuk ke akunmu</h1>
          <p className="mb-7 mt-2 text-sm text-subtle lg:text-center">Akun dibuat admin Rumbasha saat kamu daftar paket.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
