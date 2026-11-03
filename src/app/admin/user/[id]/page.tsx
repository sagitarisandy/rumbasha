import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/shell";
import { Card } from "@/components/ui/misc";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { coinTx, packages, users } from "@/lib/db/schema";
import { longDate, num } from "@/lib/format";
import { UserForm } from "../user-form";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireStaff();
  const { id } = await params;
  const db = await getDb();
  const [u] = await db.select().from(users).where(eq(users.id, Number(id)));
  if (!u) notFound();
  const [pkgs, tx] = await Promise.all([
    db.select({ id: packages.id, name: packages.name }).from(packages).where(eq(packages.kind, "langganan")).orderBy(asc(packages.price)),
    db.select().from(coinTx).where(eq(coinTx.userId, u.id)).orderBy(desc(coinTx.createdAt)).limit(6),
  ]);
  return (
    <>
      <AdminHeader back="/admin/user" title={u.name} sub={`${u.email} · ${u.role === "siswa" ? `${num(u.points)} poin · ${num(u.coin)} coin` : u.role}`} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,760px)_1fr]">
        {/* only the editable fields go to the browser (never the password hash) */}
        <UserForm initial={{ id: u.id, role: u.role, name: u.name, email: u.email, phone: u.phone, grade: u.grade, school: u.school, branch: u.branch, packageId: u.packageId, active: u.active }} packages={pkgs} canSuper={me.role === "super"} />
        {u.role === "siswa" && (
          <Card className="h-fit p-5 xl:mt-14">
            <p className="font-semibold text-ink">Riwayat coin</p>
            <div className="mt-2 divide-y divide-border-2">
              {tx.length === 0 && <p className="py-4 text-sm text-subtle">Belum ada transaksi.</p>}
              {tx.map((t) => (
                <div key={t.id} className="flex justify-between gap-3 py-2.5 text-sm">
                  <span>
                    <span className="block text-ink">{t.note}</span>
                    <span className="text-xs text-subtle">
                      {longDate(t.createdAt)} · {t.by}
                    </span>
                  </span>
                  <span className={`font-semibold ${t.amount >= 0 ? "text-success-ink" : "text-destructive-ink"}`}>
                    {t.amount >= 0 ? "+" : ""}
                    {num(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
