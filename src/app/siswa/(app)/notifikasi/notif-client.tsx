"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { markAllRead, markRead } from "@/app/actions/siswa";

export function MarkAllButton() {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} onClick={() => start(() => markAllRead())} className="px-3 text-sm font-semibold text-primary disabled:opacity-50">
      Tandai dibaca
    </button>
  );
}

export function NotifLink({ id, href, unread, children }: { id: number; href: string; unread: boolean; children: ReactNode }) {
  const router = useRouter();
  const [, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() =>
        start(async () => {
          if (unread) await markRead(id);
          router.push(href);
        })
      }
      className={`flex w-full items-start gap-3 border-b border-border-2 px-4 py-3.5 text-left last:border-0 hover:bg-sidebar ${unread ? "bg-[#fafbff]" : ""}`}
    >
      {children}
    </button>
  );
}
