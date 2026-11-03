import { asc, eq, inArray } from "drizzle-orm";
import { deleteEntity, saveTask } from "@/app/actions/admin";
import { CreateButton, EditRow, type FieldDef } from "@/components/admin/form-dialog";
import { AdminHeader } from "@/components/admin/shell";
import { StatusDot, Table, Td, Th, TypePill } from "@/components/admin/table";
import { Avatar } from "@/components/app/visuals";
import { Segmented } from "@/components/ui/tabs";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { tasks, users } from "@/lib/db/schema";
import { longDate } from "@/lib/format";
import { TaskCheck } from "./task-check";

export default async function TaskPage({ searchParams }: { searchParams: Promise<{ lihat?: string }> }) {
  const me = await requireStaff();
  const sp = await searchParams;
  const mine = sp.lihat !== "semua";
  const db = await getDb();
  const staff = await db.select({ id: users.id, name: users.name, avatar: users.avatar }).from(users).where(inArray(users.role, ["admin", "tutor", "super"])).orderBy(asc(users.name));
  const rows = await db.select().from(tasks).where(mine ? eq(tasks.assigneeId, me.id) : undefined).orderBy(asc(tasks.done), asc(tasks.dueAt));
  const fields: FieldDef[] = [
    { name: "title", label: "Judul task", required: true, wide: true },
    { name: "category", label: "Kategori", type: "select", options: ["Bank soal", "Materi", "Quiz", "User", "Pengumuman", "Report", "Umum"].map((v) => ({ value: v, label: v })) },
    { name: "assigneeId", label: "Untuk", type: "select", options: staff.map((s) => ({ value: String(s.id), label: s.name })) },
    { name: "priority", label: "Prioritas", type: "select", options: ["Tinggi", "Sedang", "Rendah"].map((v) => ({ value: v, label: v })) },
    { name: "dueAt", label: "Tenggat", type: "date" },
    { name: "note", label: "Catatan", type: "textarea" },
  ];
  const isSuper = me.role === "super";
  const open = rows.filter((r) => !r.done).length;

  return (
    <>
      <AdminHeader
        sub={isSuper ? "Bagi pekerjaan ke admin dan tutor, lalu pantau progresnya." : `Task dari Super Admin · ${open} belum selesai.`}
        actions={isSuper && <CreateButton label="Buat task" title="Buat task" fields={fields} action={saveTask.bind(null, null)} values={{ priority: "Sedang", category: "Umum", assigneeId: String(staff[0]?.id ?? "") }} />}
      />
      <Segmented
        className="mb-4 max-w-[320px]"
        value={mine ? "saya" : "semua"}
        items={[
          { value: "saya", label: "Task saya", href: "/admin/task" },
          { value: "semua", label: "Semua task", href: "/admin/task?lihat=semua" },
        ]}
      />
      <Table>
        <thead>
          <tr>
            <Th className="w-10">Selesai</Th>
            <Th>Task</Th>
            <Th>Kategori</Th>
            <Th>Untuk</Th>
            <Th>Tenggat</Th>
            <Th>Prioritas</Th>
            <Th className="text-right">Aksi</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => {
            const who = staff.find((s) => s.id === t.assigneeId);
            return (
              <tr key={t.id} className="hover:bg-sidebar">
                <Td>
                  <TaskCheck id={t.id} done={t.done} />
                </Td>
                <Td>
                  <p className={`font-semibold ${t.done ? "text-faint line-through" : ""}`}>{t.title}</p>
                  {t.note && <p className="text-xs text-subtle">{t.note}</p>}
                </Td>
                <Td>
                  <TypePill>{t.category}</TypePill>
                </Td>
                <Td>
                  {who && (
                    <span className="flex items-center gap-2">
                      <Avatar n={who.avatar} className="size-7" /> {who.name}
                    </span>
                  )}
                </Td>
                <Td className="text-ink-2">{t.dueAt ? longDate(t.dueAt) : "—"}</Td>
                <Td>
                  <StatusDot tone={t.priority === "Tinggi" ? "red" : t.priority === "Sedang" ? "orange" : "grey"}>{t.priority}</StatusDot>
                </Td>
                <Td>
                  {isSuper ? (
                    <EditRow what={`task “${t.title}”`} title="Edit task" fields={fields} values={{ ...t, assigneeId: String(t.assigneeId ?? "") }} action={saveTask.bind(null, t.id)} onDelete={deleteEntity.bind(null, "task", t.id)} />
                  ) : (
                    <span className="block text-right text-xs text-subtle">dari {t.createdBy}</span>
                  )}
                </Td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <Td colSpan={7} className="py-10 text-center text-subtle">
                Tidak ada task.
              </Td>
            </tr>
          )}
        </tbody>
      </Table>
      {!isSuper && <p className="mt-3 text-xs text-subtle">Hanya Super Admin yang bisa membuat dan mengubah task. Centang untuk menandai selesai.</p>}
    </>
  );
}
