"use client";

import { BookOpen, Calculator, CircleUser, ClipboardCheck, House, Trophy, Wallet, Zap, Bell, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number };

const MAIN: NavItem[] = [
  { href: "/student", label: "Beranda", icon: House },
  { href: "/student/modules", label: "Modul", icon: BookOpen },
  { href: "/student/daily-quiz", label: "Daily Quiz", icon: Zap },
  { href: "/student/exams", label: "Uji Kom & Tryout", icon: ClipboardCheck },
  { href: "/student/rumath", label: "RUMATH", icon: Calculator },
  { href: "/student/leaderboard", label: "Peringkat", icon: Trophy },
];

const isActive = (pathname: string, href: string) => (href === "/student" ? pathname === "/student" : pathname.startsWith(href));

function SideLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex h-11 items-center gap-3 rounded-2xl px-3.5 text-[15px] transition ${
        active ? "bg-primary-soft font-semibold text-primary" : "text-ink-2 hover:bg-surface hover:text-ink"
      }`}
    >
      <Icon className="size-[19px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
      <span className="flex-1">{item.label}</span>
      {!!item.badge && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent-soft px-1 text-[11px] font-semibold text-accent-ink">{item.badge}</span>}
    </Link>
  );
}

export function SiswaSideNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  const extra: NavItem[] = [
    { href: "/student/plans", label: "Paket & Coin", icon: Wallet },
    { href: "/student/notifications", label: "Notifikasi", icon: Bell, badge: unread },
    { href: "/student/profile", label: "Profil", icon: CircleUser },
  ];
  return (
    <nav className="flex flex-col gap-1" aria-label="Menu siswa">
      {MAIN.map((it) => (
        <SideLink key={it.href} item={it} active={isActive(pathname, it.href)} />
      ))}
      <div className="mx-3.5 my-3 h-px bg-border" />
      {extra.map((it) => (
        <SideLink key={it.href} item={it} active={isActive(pathname, it.href)} />
      ))}
    </nav>
  );
}

const TABS: NavItem[] = [
  { href: "/student", label: "Beranda", icon: House },
  { href: "/student/modules", label: "Belajar", icon: BookOpen },
  { href: "/student/daily-quiz", label: "Quiz", icon: Zap },
  { href: "/student/leaderboard", label: "Peringkat", icon: Trophy },
  { href: "/student/profile", label: "Profil", icon: CircleUser },
];

export function SiswaTabBar() {
  const pathname = usePathname();
  const quizPaths = ["/student/daily-quiz", "/student/exams", "/student/rumath"];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Navigasi bawah">
      <div className="mx-auto grid max-w-[520px] grid-cols-5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const on = href === "/student/daily-quiz" ? quizPaths.some((p) => pathname.startsWith(p)) : isActive(pathname, href);
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-1 py-2 text-[11px] ${on ? "font-semibold text-primary" : "text-faint"}`}>
              <span className={`grid h-7 w-12 place-items-center rounded-full transition ${on ? "bg-primary-soft" : ""}`}>
                <Icon className="size-[19px]" strokeWidth={on ? 2.2 : 1.8} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
