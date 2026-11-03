import { asc, eq } from "drizzle-orm";
import { AdminHeader } from "@/components/admin/shell";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { packages } from "@/lib/db/schema";
import { UserForm } from "../user-form";

export default async function TambahUserPage() {
  const me = await requireStaff();
  const db = await getDb();
  const pkgs = await db.select({ id: packages.id, name: packages.name }).from(packages).where(eq(packages.kind, "langganan")).orderBy(asc(packages.price));
  return (
    <>
      <AdminHeader back="/admin/user" title="Tambah user" sub="Akun siswa dibuat admin saat siswa daftar paket." />
      <UserForm packages={pkgs} canSuper={me.role === "super"} />
    </>
  );
}
