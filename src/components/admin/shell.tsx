import { ArrowLeft, Bell, Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/app/visuals";
import type { CurrentUser } from "@/lib/dal";
import { UserMenu } from "../app/user-menu";
import { AdminMobileNav, AdminSideNav, AdminTitle } from "./nav";

const ROLE: Record<string, string> = { super: "Super Admin", admin: "Admin", tutor: "Tutor" };

export function AdminFrame({ user, children }: { user: CurrentUser; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-white lg:pl-[248px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border bg-white px-4 pb-4 pt-6 lg:flex">
        <div className="mb-5 flex items-center justify-between px-3">
          <Logo href="/admin" className="w-[100px]" />
          <span className="rounded-lg bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-ink">{ROLE[user.role] === "Super Admin" ? "Super" : "Admin"}</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <AdminSideNav />
        </div>
      </aside>
      <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur">
        <div className="flex h-[76px] items-center gap-4 px-4 sm:px-8">
          <div className="lg:hidden">
            <Logo href="/admin" className="w-[84px]" />
          </div>
          <div className="hidden lg:block">
            <AdminTitle />
          </div>
          <form action="/admin/search" className="relative ml-auto hidden w-full max-w-[380px] md:block lg:ml-10">
            <Search className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-subtle" />
            <input name="q" placeholder="Cari user, soal, materi, atau quiz…" className="h-11 w-full rounded-[22px] bg-surface pl-11 pr-4 text-sm text-ink outline-none placeholder:text-subtle focus:ring-2 focus:ring-primary/25" />
          </form>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/admin/tasks" aria-label="Task" className="relative grid size-10 place-items-center rounded-full text-accent hover:bg-surface">
              <Bell className="size-5" />
              <span className="absolute right-2.5 top-2 size-2 rounded-full bg-accent ring-2 ring-white" />
            </Link>
            <UserMenu name={user.name} sub={user.email} avatar={user.avatar} links={[{ href: "/admin/tasks", label: "Task saya" }, { href: "/admin/landing-page", label: "Landing page" }]} />
          </div>
        </div>
        <AdminMobileNav />
      </header>
      <main className="px-4 pb-16 pt-6 sm:px-8 sm:pt-8">{children}</main>
    </div>
  );
}

/** Page heading row: description on the left, actions on the right (or a back link + title for forms). */
export function AdminHeader({ sub, actions, title, back }: { sub?: ReactNode; actions?: ReactNode; title?: ReactNode; back?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {title && (
          <div className="flex items-center gap-2">
            {back && (
              <Link href={back} aria-label="Kembali" className="grid size-9 place-items-center rounded-full text-ink hover:bg-surface">
                <ArrowLeft className="size-5" />
              </Link>
            )}
            <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
          </div>
        )}
        {sub && <p className={`max-w-[520px] text-sm text-subtle ${title ? "mt-1" : ""}`}>{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
