import { Bell, ChevronLeft, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar, Logo, Rumbi } from "@/components/app/visuals";
import { LinkButton } from "@/components/ui/button";
import type { CurrentUser } from "@/lib/dal";
import { UserMenu } from "../app/user-menu";
import { SiswaSideNav, SiswaTabBar } from "./nav";

export function SiswaFrame({ user, unread, packageName, children }: { user: CurrentUser; unread: number; packageName: string | null; children: ReactNode }) {
  const sub = [user.grade ? `Kelas ${user.grade}` : null, packageName].filter(Boolean).join(" · ");
  return (
    <div className="min-h-dvh bg-white lg:pl-[248px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border bg-white px-4 pb-4 pt-6 lg:flex">
        <div className="mb-8 px-3">
          <Logo href="/student" className="w-[104px]" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SiswaSideNav unread={unread} />
        </div>
        <div className="relative mt-4 overflow-hidden rounded-[20px] bg-primary-soft p-4">
          <p className="max-w-[130px] text-[15px] font-semibold leading-tight text-ink">Belajar 15 menit hari ini</p>
          <p className="mt-2 max-w-[130px] text-xs text-subtle">Streak kamu {user.streak} hari. Lanjut!</p>
          <LinkButton href="/student/modules?lanjut=1" size="sm" className="mt-3">
            Mulai
          </LinkButton>
          <Rumbi pose="baca" className="absolute -bottom-1 -right-2 h-[88px]" />
        </div>
      </aside>

      <header className="sticky top-0 z-20 hidden h-[88px] items-center gap-6 border-b border-border bg-white/90 px-8 backdrop-blur lg:flex">
        <form action="/student/search" className="relative w-full max-w-[480px]">
          <Search className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-subtle" />
          <input name="q" placeholder="Cari materi, PDF, atau quiz…" className="h-11 w-full rounded-[22px] bg-surface pl-11 pr-4 text-sm text-ink outline-none placeholder:text-subtle focus:ring-2 focus:ring-primary/25" />
        </form>
        <div className="ml-auto flex items-center gap-5">
          <Link href="/student/notifications" aria-label={`Notifikasi, ${unread} belum dibaca`} className="relative grid size-10 place-items-center rounded-full text-primary hover:bg-surface">
            <Bell className="size-5" />
            {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-accent ring-2 ring-white" />}
          </Link>
          <UserMenu name={user.name} sub={sub} avatar={user.avatar} links={[{ href: "/student/profile", label: "Profil" }, { href: "/student/plans", label: "Paket & Coin" }]} />
        </div>
      </header>

      <div className="pb-24 lg:pb-0">{children}</div>
      <SiswaTabBar />
    </div>
  );
}

/** Two-column page body: content + 340px right panel on desktop, stacked on mobile. */
export function SiswaPage({ children, aside, header }: { children: ReactNode; aside?: ReactNode; header?: ReactNode }) {
  return (
    <>
      {header}
      <div className={`mx-auto grid max-w-[1192px] gap-8 px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-7 ${aside ? "xl:grid-cols-[minmax(0,1fr)_340px]" : ""}`}>
        <div className="min-w-0">{children}</div>
        {aside && <aside className="flex min-w-0 flex-col gap-6">{aside}</aside>}
      </div>
    </>
  );
}

/** Mobile top bar: back + title + optional right slot. Hidden on desktop. */
export function MobileBar({ title, back = "/student", right }: { title: ReactNode; back?: string | null; right?: ReactNode }) {
  return (
    <div className="sticky top-0 z-20 flex h-14 items-center gap-2 bg-white/95 px-3 backdrop-blur lg:hidden">
      {back && (
        <Link href={back} aria-label="Kembali" className="grid size-10 place-items-center rounded-full text-ink hover:bg-surface">
          <ChevronLeft className="size-5" />
        </Link>
      )}
      <h1 className={`min-w-0 flex-1 truncate text-[17px] font-semibold text-ink ${back ? "" : "pl-2"}`}>{title}</h1>
      {right}
    </div>
  );
}

export function MobileHome({ user, unread }: { user: CurrentUser; unread: number }) {
  return (
    <div className="flex h-16 items-center justify-between px-4 lg:hidden">
      <Logo href="/student" className="w-[92px]" />
      <div className="flex items-center gap-2">
        <Link href="/student/notifications" aria-label="Notifikasi" className="relative grid size-10 place-items-center rounded-full text-accent">
          <Bell className="size-5" />
          {unread > 0 && <span className="absolute right-2.5 top-2 size-2 rounded-full bg-accent" />}
        </Link>
        <Link href="/student/profile" aria-label="Profil">
          <Avatar n={user.avatar} className="size-10 ring-4 ring-accent-soft" />
        </Link>
      </div>
    </div>
  );
}

export function HelpCard() {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-ink p-5 pl-[104px] text-white">
      <Rumbi pose="hai" className="absolute bottom-2 left-3 h-[92px]" />
      <p className="font-semibold">Bingung sama soal?</p>
      <p className="mt-1 text-[13px] text-white/75">Tanya tutor lewat WhatsApp, Senin–Sabtu 08.00–20.00.</p>
      <a
        href="https://wa.me/6281234567890?text=Halo%20kak%20tutor%2C%20saya%20mau%20tanya%20soal"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex h-9 items-center gap-2 rounded-[18px] bg-linear-to-b from-[#ff9a4d] to-[#f47a22] px-4 text-sm font-semibold shadow-btn-accent"
      >
        <MessageCircle className="size-4" />
        Tanya tutor
      </a>
    </div>
  );
}

/** Stat tile from the right panel ("82,5 · Rata-rata nilai"). */
export function StatTile({ icon, value, label, tone = "indigo", right }: { icon: ReactNode; value: ReactNode; label: ReactNode; tone?: "indigo" | "orange" | "green" | "yellow"; right?: ReactNode }) {
  const bg = { indigo: "bg-primary-soft", orange: "bg-accent-soft", green: "bg-success-soft", yellow: "bg-cream" }[tone];
  const fg = { indigo: "text-primary", orange: "text-accent", green: "text-success", yellow: "text-warning" }[tone];
  return (
    <div className={`flex items-center gap-3 rounded-[20px] p-4 ${bg}`}>
      <span className={`grid size-10 shrink-0 place-items-center rounded-full bg-white [&_svg]:size-[18px] ${fg}`}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[19px] font-semibold leading-tight text-ink">{value}</p>
        <p className="text-xs text-subtle">{label}</p>
      </div>
      {right}
    </div>
  );
}
