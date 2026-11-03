import { and, asc, count, eq, ilike, or, type SQL } from "drizzle-orm";
import { UserPlus } from "lucide-react";
import { deleteEntity } from "@/app/actions/admin";
import { ImportDialogButton } from "@/app/admin/questions/import-dialog";
import { AdminHeader } from "@/components/admin/shell";
import { Pager, PER_PAGE, StatusDot, Table, Td, Th, pageOf, urlWith } from "@/components/admin/table";
import { RowActions, Toolbar } from "@/components/admin/toolbar";
import { Avatar } from "@/components/app/visuals";
import { LinkButton } from "@/components/ui/button";
import { Segmented } from "@/components/ui/tabs";
import { CABANG } from "@/lib/catalog";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { users, type Role } from "@/lib/db/schema";

type Search = { role?: string; q?: string; kelas?: string; cabang?: string; status?: string; hal?: string };
const ROLE_LABEL: Record<Role, string> = { siswa: "Siswa", tutor: "Tutor", admin: "Admin", super: "Super Admin" };

export default async function AdminUserPage({ searchParams }: { searchParams: Promise<Search> }) {
  const me = await requireStaff();
  const sp = await searchParams;
  const page = pageOf(sp.hal);
  const db = await getDb();
  const role = (Object.keys(ROLE_LABEL) as Role[]).includes(sp.role as Role) ? (sp.role as Role) : null;
  const where: SQL[] = [];
  if (role) where.push(eq(users.role, role));
  if (sp.q) where.push(or(ilike(users.name, `%${sp.q}%`), ilike(users.email, `%${sp.q}%`))!);
  if (sp.kelas) where.push(eq(users.grade, Number(sp.kelas)));
  if (sp.cabang) where.push(eq(users.branch, sp.cabang));
  if (sp.status) where.push(eq(users.active, sp.status === "aktif"));
  const [[{ n }], rows, perRole] = await Promise.all([
    db.select({ n: count() }).from(users).where(and(...where)),
    db.select().from(users).where(and(...where)).orderBy(asc(users.id)).limit(PER_PAGE).offset((page - 1) * PER_PAGE),
    db.select({ role: users.role, n: count() }).from(users).groupBy(users.role),
  ]);
  const total = perRole.reduce((s, r) => s + r.n, 0);
  const cnt = (r: Role) => perRole.find((x) => x.role === r)?.n ?? 0;
  const tabHref = (r?: string) => urlWith("/admin/users", { q: sp.q }, { role: r });

  return (
    <>
      <AdminHeader
        sub="Akun siswa, tutor, admin, dan super admin."
        actions={
          <>
            <ImportDialogButton kind="user" />
            <LinkButton href="/admin/users/new">
              <UserPlus /> Tambah user
            </LinkButton>
          </>
        }
      />
      <Segmented
        className="mb-4 max-w-[640px]"
        value={role ?? "semua"}
        items={[
          { value: "semua", label: `Semua ${total}`, href: tabHref() },
          ...(Object.keys(ROLE_LABEL) as Role[]).map((r) => ({ value: r, label: `${ROLE_LABEL[r]} ${cnt(r)}`, href: tabHref(r) })),
        ]}
      />
      <Toolbar
        placeholder="Cari nama atau email…"
        filters={[
          { key: "kelas", label: "Kelas", options: Array.from({ length: 9 }, (_, i) => ({ value: String(i + 1), label: `Kelas ${i + 1}` })) },
          { key: "cabang", label: "Cabang", options: CABANG.map((c) => ({ value: c, label: c })) },
          { key: "status", label: "Status", options: [{ value: "aktif", label: "Aktif" }, { value: "nonaktif", label: "Nonaktif" }] },
        ]}
      />
      <Table>
        <thead>
          <tr>
            <Th>Nama</Th>
            <Th>Role</Th>
            <Th>Kelas / keterangan</Th>
            <Th>Status</Th>
            <Th className="text-right">Aksi</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="hover:bg-sidebar">
              <Td>
                <span className="flex items-center gap-3">
                  <Avatar n={u.avatar} className="size-9" />
                  <span>
                    <span className="block font-semibold">{u.name}</span>
                    <span className="text-xs text-subtle">{u.email}</span>
                  </span>
                </span>
              </Td>
              <Td className="text-xs font-semibold">{ROLE_LABEL[u.role]}</Td>
              <Td className="text-ink-2">{u.role === "siswa" ? `Kelas ${u.grade} · ${u.school}` : u.role === "super" ? "Semua cabang" : u.branch}</Td>
              <Td>{u.active ? <StatusDot tone="green">Aktif</StatusDot> : <StatusDot tone="grey">Nonaktif</StatusDot>}</Td>
              <Td>
                <RowActions what={`akun ${u.name}`} editHref={`/admin/users/${u.id}`} onDelete={u.id === me.id ? undefined : deleteEntity.bind(null, "user", u.id)} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pager total={n} page={page} perPage={PER_PAGE} href={(p) => urlWith("/admin/users", sp, { hal: p })} />
    </>
  );
}
