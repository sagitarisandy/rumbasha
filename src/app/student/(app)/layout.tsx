import { Suspense, type ReactNode } from "react";
import { SiswaFrame } from "@/components/siswa/shell";
import { requireSiswa } from "@/lib/dal";
import { getPackage, unreadCount } from "@/lib/queries/siswa";

export const instant = false;

async function Shell({ children }: { children: ReactNode }) {
  const user = await requireSiswa();
  const [unread, pkg] = await Promise.all([unreadCount(user.id), getPackage(user.packageId)]);
  return (
    <SiswaFrame user={user} unread={unread} packageName={pkg?.name ?? null}>
      {children}
    </SiswaFrame>
  );
}

function ShellSkeleton() {
  return (
    <div className="min-h-dvh lg:pl-[248px]">
      <div className="fixed inset-y-0 left-0 hidden w-[248px] border-r border-border lg:block" />
      <div className="mx-auto max-w-[1192px] animate-pulse space-y-4 p-8">
        <div className="h-10 w-1/2 rounded-2xl bg-surface" />
        <div className="h-40 rounded-[20px] bg-surface" />
        <div className="h-64 rounded-[20px] bg-surface" />
      </div>
    </div>
  );
}

export default function SiswaLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
