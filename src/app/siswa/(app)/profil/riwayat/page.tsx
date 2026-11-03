import { Calculator, CalendarDays, ClipboardCheck, FileDown, FileText, LineChart, Star, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/app/visuals";
import { HelpCard, MobileBar, SiswaPage } from "@/components/siswa/shell";
import { buttonClass } from "@/components/ui/button";
import { Segmented } from "@/components/ui/tabs";
import { requireSiswa } from "@/lib/dal";
import { ago, num } from "@/lib/format";
import { monthRange, riwayat } from "@/lib/queries/riwayat";
import { MonthPicker } from "./month-picker";

const ICON = { daily: Zap, ujikom: ClipboardCheck, tryout: ClipboardCheck, rumath: Calculator, modul: FileText };

export default async function RiwayatPage({ searchParams }: { searchParams: Promise<{ bulan?: string; tipe?: string }> }) {
  const user = await requireSiswa();
  const sp = await searchParams;
  const range = monthRange(sp.bulan);
  const tipe = ["daily", "ujikom", "rumath"].includes(sp.tipe ?? "") ? sp.tipe! : "semua";
  const all = await riwayat(user.id, range.from, range.to);
  const list = all.filter((x) => tipe === "semua" || x.kind === tipe || (tipe === "ujikom" && x.kind === "tryout"));
  const quizzes = all.filter((x) => x.kind !== "modul");
  const avg = quizzes.length ? Math.round(quizzes.reduce((s, x) => s + (x.score ?? 0), 0) / quizzes.length) : 0;
  const points = quizzes.reduce((s, x) => s + x.points, 0);
  const href = (t: string) => `/siswa/profil/riwayat?bulan=${range.key}${t !== "semua" ? `&tipe=${t}` : ""}`;
  const exportBtn = (
    <a href={`/api/riwayat/pdf?bulan=${range.key}`} className={buttonClass({ variant: "ghost", size: "sm" })}>
      <FileDown /> Export PDF
    </a>
  );

  return (
    <SiswaPage header={<MobileBar title="Riwayat belajar" back="/siswa/profil" right={exportBtn} />} aside={<HelpCard />}>
      <div className="mb-4 hidden items-end justify-between lg:flex">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">Riwayat belajar</h1>
        {exportBtn}
      </div>
      <div className="flex items-center gap-2 text-ink">
        <CalendarDays className="size-4 text-subtle" />
        <MonthPicker value={range.key} />
      </div>
      <Segmented
        className="mt-4"
        value={tipe}
        items={[
          { value: "semua", label: "Semua", href: href("semua") },
          { value: "daily", label: "Daily", href: href("daily") },
          { value: "ujikom", label: "Uji Kom", href: href("ujikom") },
          { value: "rumath", label: "RUMATH", href: href("rumath") },
        ]}
      />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[20px] bg-primary-soft p-4">
          <span className="grid size-9 place-items-center rounded-full bg-white text-primary"><LineChart className="size-4" /></span>
          <p className="mt-3 text-[22px] font-semibold text-ink">{quizzes.length}</p>
          <p className="text-xs text-subtle">Quiz bulan ini</p>
        </div>
        <div className="rounded-[20px] bg-accent-soft p-4">
          <span className="grid size-9 place-items-center rounded-full bg-white text-accent"><Star className="size-4" /></span>
          <p className="mt-3 text-[22px] font-semibold text-ink">{avg}</p>
          <p className="text-xs text-subtle">Rata-rata nilai</p>
        </div>
        <div className="rounded-[20px] bg-success-soft p-4">
          <span className="grid size-9 place-items-center rounded-full bg-white text-success"><Trophy className="size-4" /></span>
          <p className="mt-3 text-[22px] font-semibold text-ink">+{num(points)}</p>
          <p className="text-xs text-subtle">Poin bulan ini</p>
        </div>
      </div>
      <div className="mt-4 divide-y divide-border-2">
        {list.length === 0 && <EmptyState title={`Belum ada aktivitas di ${range.label}`} />}
        {list.map((x) => {
          const Icon = ICON[x.kind];
          return (
            <Link key={x.key} href={x.href} className="flex items-start gap-3 py-3.5 hover:bg-sidebar">
              <Icon className="mt-0.5 size-5 shrink-0 text-ink-2" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-ink">{x.title}</p>
                <p className="text-xs text-subtle">
                  {ago(x.at)} · {x.sub}
                </p>
              </div>
              {x.points > 0 && <span className="text-[15px] font-semibold text-ink">+{x.points}</span>}
            </Link>
          );
        })}
      </div>
    </SiswaPage>
  );
}
