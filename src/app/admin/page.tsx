import { and, desc, eq } from "drizzle-orm";
import { ClipboardCheck, FileText, KeyRound, LibraryBig, Plus, TrendingDown, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { LineChart } from "@/components/admin/charts";
import { AdminHeader } from "@/components/admin/shell";
import { Avatar } from "@/components/app/visuals";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { activity, tasks } from "@/lib/db/schema";
import { ago, due, firstName, greeting, num } from "@/lib/format";
import { activeSessions, counts, scoreTrend } from "@/lib/queries/admin";
import { TaskCheck } from "./task/task-check";

function Kpi({ icon, label, value, delta, foot, sub, tone }: { icon: ReactNode; label: string; value: string; delta: number; foot: string; sub: string; tone: string }) {
  return (
    <div className={`rounded-[20px] p-5 ${tone}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-white text-primary [&_svg]:size-[18px]">{icon}</span>
          <span className="text-sm text-ink-2">{label}</span>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-xl bg-white px-2 py-0.5 text-xs font-semibold ${delta >= 0 ? "text-success-ink" : "text-destructive-ink"}`}>
          {delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {delta >= 0 ? "+" : "−"}
          {Math.abs(delta).toLocaleString("id-ID", { maximumFractionDigits: 1 })}
          {label === "Quiz dikerjakan" || label === "Total user" ? "%" : ""}
        </span>
      </div>
      <p className="mt-4 text-[30px] font-bold leading-none tracking-[-0.02em] text-ink">{value}</p>
      <p className="mt-3 text-sm font-semibold text-ink">{foot}</p>
      <p className="text-xs text-subtle">{sub}</p>
    </div>
  );
}

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ rentang?: string }> }) {
  const user = await requireStaff();
  const sp = await searchParams;
  const range = sp.rentang === "30h" || sp.rentang === "7h" ? sp.rentang : "12m";
  const db = await getDb();
  const [c, trend, myTasks, feed, live] = await Promise.all([
    counts(),
    scoreTrend(range),
    db.select().from(tasks).where(eq(tasks.assigneeId, user.id)).orderBy(tasks.done, tasks.dueAt).limit(5),
    db.select().from(activity).orderBy(desc(activity.createdAt)).limit(5),
    activeSessions(),
  ]);
  const openTasks = await db.select().from(tasks).where(and(eq(tasks.assigneeId, user.id), eq(tasks.done, false)));
  const donePct = c.att_all ? Math.round((c.att_done / c.att_all) * 100) : 0;
  const prevPct = c.att_prev ? Math.round(((c.att_done - c.att_prev) / c.att_prev) * 100) : 0;
  const ranges = [
    { value: "12m", label: "12 minggu", href: "/admin" },
    { value: "30h", label: "30 hari", href: "/admin?rentang=30h" },
    { value: "7h", label: "7 hari", href: "/admin?rentang=7h" },
  ];

  return (
    <>
      <AdminHeader
        title={`${greeting()}, ${firstName(user.name)}`}
        sub={`${openTasks.length} task aktif dari Super Admin · ${live} sesi Uji Kom berlangsung hari ini.`}
        actions={
          <>
            <LinkButton href="/admin/quiz?tipe=ujikom" variant="ghost">
              <KeyRound /> Buat kode akses
            </LinkButton>
            <LinkButton href="/admin/bank-soal/tambah">
              <Plus /> Tambah soal
            </LinkButton>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi tone="bg-primary-soft" icon={<Users />} label="Total user" value={num(c.users)} delta={c.users ? Math.round((c.users_new / c.users) * 1000) / 10 : 0} foot={`Naik ${num(c.users_new)} akun bulan ini`} sub={`Siswa ${num(c.siswa)} · Tutor ${num(c.tutor)} · Admin ${num(c.admin)}`} />
        <Kpi tone="bg-accent-soft" icon={<LibraryBig />} label="Bank soal" value={num(c.soal)} delta={c.soal_new} foot={`${num(c.soal_new)} soal baru minggu ini`} sub={`SD ${num(c.soal_sd)} · SMP ${num(c.soal - c.soal_sd)}`} />
        <Kpi tone="bg-info-soft" icon={<FileText />} label="Materi PDF" value={num(c.materi)} delta={c.materi_new} foot={`${num(c.materi_new)} PDF dipublish minggu ini`} sub={`SD ${num(c.materi_sd)} · SMP ${num(c.materi - c.materi_sd)}`} />
        <Kpi tone="bg-success-soft" icon={<ClipboardCheck />} label="Quiz dikerjakan" value={`${donePct}%`} delta={prevPct} foot={`${num(c.att_done)} dari ${num(c.att_all)} quiz`} sub={`${num(c.att_all - c.att_done)} belum dikerjakan (30 hari)`} />
      </div>

      <Card className="mt-5 p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[17px] font-semibold text-ink">Rata-rata nilai Daily Quiz</p>
            <p className="text-[13px] text-subtle">{range === "12m" ? "12 minggu terakhir" : range === "30h" ? "30 hari terakhir" : "7 hari terakhir"}, skala 0–100</p>
          </div>
          <Segmented size="sm" value={range} items={ranges} className="w-[300px]" />
        </div>
        <LineChart labels={trend.labels} max={100} series={[{ name: "SD", values: trend.sd }, { name: "SMP", values: trend.smp }]} />
      </Card>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <p className="text-[17px] font-semibold text-ink">Task kamu</p>
              <p className="text-[13px] text-subtle">Dari Super Admin</p>
            </div>
            <Link href="/admin/task" className="text-[13px] font-semibold text-ink hover:text-primary">
              Semua task
            </Link>
          </div>
          <div className="divide-y divide-border-2">
            {myTasks.length === 0 && <p className="py-6 text-sm text-subtle">Tidak ada task. Santai dulu ☕</p>}
            {myTasks.map((tk) => (
              <div key={tk.id} className="flex items-center gap-3 py-3">
                <TaskCheck id={tk.id} done={tk.done} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[15px] font-semibold ${tk.done ? "text-faint line-through" : "text-ink"}`}>{tk.title}</p>
                  <p className="text-xs text-subtle">
                    {tk.category} · {tk.done ? "selesai" : tk.dueAt ? due(tk.dueAt) : "tanpa tenggat"}
                  </p>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${tk.priority === "Tinggi" ? "text-destructive-ink" : tk.priority === "Sedang" ? "text-warning-ink" : "text-subtle"}`}>
                  <span className={`size-1.5 rounded-full ${tk.priority === "Tinggi" ? "bg-destructive" : tk.priority === "Sedang" ? "bg-warning" : "bg-faint"}`} />
                  {tk.priority}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <p className="mb-2 text-[17px] font-semibold text-ink">Aktivitas terbaru</p>
          <div className="divide-y divide-border-2">
            {feed.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <Avatar n={a.avatar} className="size-8" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{a.actor}</span> {a.text}
                  </p>
                  <p className="text-xs text-subtle">{ago(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
