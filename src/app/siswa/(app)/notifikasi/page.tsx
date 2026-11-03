import { and, desc, eq, isNull, or } from "drizzle-orm";
import { BookOpen, Coins, Megaphone, Package, Trophy, Zap, type LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/app/visuals";
import { HelpCard, MobileBar, SiswaPage } from "@/components/siswa/shell";
import { Card } from "@/components/ui/misc";
import { requireSiswa } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { notificationReads, notifications } from "@/lib/db/schema";
import { ago, wibDay } from "@/lib/format";
import { MarkAllButton, NotifLink } from "./notif-client";

const ICON: Record<string, [LucideIcon, string]> = {
  quiz: [Zap, "bg-accent-soft text-accent"],
  peringkat: [Trophy, "bg-accent-soft text-accent"],
  materi: [BookOpen, "bg-success-soft text-success"],
  promo: [Megaphone, "bg-primary-soft text-primary"],
  sistem: [Coins, "bg-cream text-warning"],
  paket: [Package, "bg-primary-soft text-primary"],
};

function byAge<T extends { n: { createdAt: Date } }>(rows: T[]): [string, T[]][] {
  const today = wibDay(new Date());
  const weekAgo = Date.now() - 7 * 86_400_000;
  return [
    ["Hari ini", rows.filter((r) => wibDay(r.n.createdAt) === today)],
    ["Minggu ini", rows.filter((r) => wibDay(r.n.createdAt) !== today && r.n.createdAt.getTime() > weekAgo)],
    ["Lebih lama", rows.filter((r) => r.n.createdAt.getTime() <= weekAgo)],
  ];
}

export default async function NotifikasiPage() {
  const user = await requireSiswa();
  const db = await getDb();
  const rows = await db
    .select({ n: notifications, read: notificationReads.userId })
    .from(notifications)
    .leftJoin(notificationReads, and(eq(notificationReads.notificationId, notifications.id), eq(notificationReads.userId, user.id)))
    .where(or(isNull(notifications.userId), eq(notifications.userId, user.id)))
    .orderBy(desc(notifications.createdAt));
  const groups = byAge(rows);
  const unread = rows.filter((r) => !r.read).length;

  return (
    <SiswaPage header={<MobileBar title="Notifikasi" right={unread > 0 && <MarkAllButton />} />} aside={<HelpCard />}>
      <div className="mb-2 hidden items-end justify-between lg:flex">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">Notifikasi</h1>
          <p className="mt-1 text-sm text-subtle">{unread ? `${unread} belum dibaca` : "Semua sudah dibaca"}</p>
        </div>
        {unread > 0 && <MarkAllButton />}
      </div>
      {rows.length === 0 && <EmptyState title="Belum ada notifikasi" />}
      {groups.map(
        ([label, list]) =>
          list.length > 0 && (
            <section key={label} className="mt-5">
              <h2 className="mb-2 text-[13px] font-semibold text-ink-2">{label}</h2>
              <Card className="overflow-hidden">
                {list.map(({ n, read }) => {
                  const [Icon, tone] = ICON[n.kind] ?? ICON.sistem;
                  return (
                    <NotifLink key={n.id} id={n.id} href={n.href ?? "/siswa"} unread={!read}>
                      <span className={`grid size-11 shrink-0 place-items-center rounded-full ${tone}`}>
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold text-ink">{n.title}</span>
                        <span className="block text-sm text-ink-2">{n.body}</span>
                        <span className="mt-0.5 block text-xs text-subtle">{ago(n.createdAt)}</span>
                      </span>
                      {!read && <span className="mt-2 size-2.5 shrink-0 rounded-full bg-accent" aria-label="Belum dibaca" />}
                    </NotifLink>
                  );
                })}
              </Card>
            </section>
          ),
      )}
    </SiswaPage>
  );
}
