"use client";

import {
  BarChart3, Coins, Database, FileText, Globe, House, Image as ImageIcon, LibraryBig, LineChart, ListChecks, Package, Calculator, Trophy, Users, ClipboardCheck, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: LucideIcon; badge?: string };
export const ADMIN_NAV: { title?: string; items: Item[] }[] = [
  { items: [{ href: "/admin", label: "Beranda", icon: House }] },
  {
    title: "Konten",
    items: [
      { href: "/admin/materi", label: "Materi", icon: FileText },
      { href: "/admin/bank-soal", label: "Bank Soal", icon: LibraryBig },
      { href: "/admin/image", label: "Image", icon: ImageIcon },
      { href: "/admin/master-data", label: "Master Data", icon: Database },
    ],
  },
  {
    title: "Quiz & Nilai",
    items: [
      { href: "/admin/quiz", label: "Quiz", icon: ClipboardCheck },
      { href: "/admin/rumath", label: "RUMATH", icon: Calculator },
      { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
      { href: "/admin/report-quiz", label: "Report Quiz", icon: LineChart },
      { href: "/admin/report-rumath", label: "Report RUMATH", icon: BarChart3 },
    ],
  },
  {
    title: "Pengguna",
    items: [
      { href: "/admin/user", label: "User", icon: Users },
      { href: "/admin/coin-akses", label: "Coin & Akses", icon: Coins },
      { href: "/admin/paket", label: "Paket", icon: Package },
    ],
  },
  {
    title: "Sistem",
    items: [
      { href: "/admin/landing-page", label: "Landing Page", icon: Globe },
      { href: "/admin/task", label: "Task", icon: ListChecks, badge: "Super" },
    ],
  },
];

export const titleFor = (pathname: string) => {
  for (const g of ADMIN_NAV) for (const it of g.items) if (it.href !== "/admin" && pathname.startsWith(it.href)) return { title: it.label, group: g.title ?? "Rumbasha" };
  return { title: "Beranda", group: "Rumbasha" };
};

export function AdminSideNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col" aria-label="Menu admin">
      {ADMIN_NAV.map((g, gi) => (
        <div key={gi} className="mb-2">
          {g.title && <p className="px-3.5 pb-1.5 pt-3 text-xs text-subtle">{g.title}</p>}
          {g.items.map(({ href, label, icon: Icon, badge }) => {
            const on = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`flex h-10 items-center gap-3 rounded-2xl px-3.5 text-[15px] transition ${on ? "bg-primary-soft font-semibold text-primary" : "text-ink-2 hover:bg-surface hover:text-ink"}`}>
                <Icon className="size-[18px] shrink-0" strokeWidth={on ? 2.2 : 1.8} />
                <span className="flex-1">{label}</span>
                {badge && <span className="rounded-lg bg-accent-soft px-1.5 py-0.5 text-[11px] font-semibold text-accent-ink">{badge}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AdminTitle() {
  const { title, group } = titleFor(usePathname());
  return (
    <div className="min-w-0">
      <p className="truncate text-[19px] font-semibold leading-tight text-ink">{title}</p>
      <p className="text-xs text-subtle">{group}</p>
    </div>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 lg:hidden">
      {ADMIN_NAV.flatMap((g) => g.items).map(({ href, label }) => {
        const on = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`shrink-0 rounded-2xl px-3 py-1.5 text-[13px] font-semibold ${on ? "bg-primary text-white" : "bg-surface text-ink-2"}`}>
            {label}
          </Link>
        );
      })}
    </div>
  );
}

