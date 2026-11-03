import { Suspense, type ReactNode } from "react";
import { AdminFrame } from "@/components/admin/shell";
import { requireStaff } from "@/lib/dal";

async function Shell({ children }: { children: ReactNode }) {
  const user = await requireStaff();
  return <AdminFrame user={user}>{children}</AdminFrame>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh animate-pulse lg:pl-[248px]" />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
