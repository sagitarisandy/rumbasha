import { and, asc, eq, ilike } from "drizzle-orm";
import { Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState, MapelCard, SubjectCover } from "@/components/app/visuals";
import { HelpCard, MobileBar, SiswaPage } from "@/components/siswa/shell";
import { PdfRow } from "@/components/siswa/pdf-row";
import { Card, Progress } from "@/components/ui/misc";
import { Chips } from "@/components/ui/tabs";
import { KURIKULUM, MAPEL, mapelStyle, type Mapel } from "@/lib/catalog";
import { requireSiswa } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { materials, progress } from "@/lib/db/schema";
import { ago } from "@/lib/format";
import { babSummaries, mapelProgress, recentReads } from "@/lib/queries/siswa";
import { FilterButton } from "./modul-client";

type Search = { mapel?: string; bidang?: string; bab?: string; q?: string; kelas?: string; status?: string; lanjut?: string };

export default async function ModulPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireSiswa();
  const sp = await searchParams;
  if (sp.lanjut) {
    const [last] = await recentReads(user.id, 1);
    redirect(last ? `/student/modules/${last.id}?hal=${last.page}` : "/student/modules");
  }

  const mapel = (MAPEL as readonly string[]).includes(sp.mapel ?? "") ? (sp.mapel as Mapel) : sp.mapel === "Semua" ? "Semua" : "Matematika";
  const bidangList = mapel === "Semua" ? [] : KURIKULUM[mapel].map((b) => b.name);
  const bidang = bidangList.includes(sp.bidang ?? "") ? sp.bidang! : undefined;
  const link = (p: Partial<Search>) => {
    const next = { mapel, bidang, bab: sp.bab, q: sp.q, kelas: sp.kelas, status: sp.status, ...p };
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]);
    return `/student/modules?${qs}`;
  };

  const db = await getDb();
  const [recent, perMapel] = await Promise.all([recentReads(user.id, 3), mapelProgress(user.id)]);
  const subjects = mapel === "Semua" ? [...MAPEL] : [mapel];
  const babs = (await Promise.all(subjects.map(async (m) => (await babSummaries(user.id, m, bidang)).map((b) => ({ ...b, mapel: m }))))).flat();
  const bab = babs.find((b) => b.bab === sp.bab) ?? babs[0];

  const rows = await db
    .select({ id: materials.id, title: materials.title, pages: materials.pages, grade: materials.grade, bab: materials.bab, subject: materials.subject, page: progress.page })
    .from(materials)
    .leftJoin(progress, and(eq(progress.materialId, materials.id), eq(progress.userId, user.id)))
    .where(
      and(
        eq(materials.status, "publish"),
        eq(materials.jenjang, "SMP"),
        sp.q ? ilike(materials.title, `%${sp.q}%`) : bab ? and(eq(materials.subject, bab.mapel), eq(materials.bab, bab.bab)) : undefined,
        sp.q && mapel !== "Semua" ? eq(materials.subject, mapel) : undefined,
        sp.kelas ? eq(materials.grade, Number(sp.kelas)) : undefined,
      ),
    )
    .orderBy(asc(materials.id));
  const pdfs = rows.filter((r) => (sp.status === "belum" ? !r.page : sp.status === "dibuka" ? !!r.page : sp.status === "selesai" ? (r.page ?? 0) >= r.pages : true));

  return (
    <SiswaPage
      header={<MobileBar title="Modul" />}
      aside={
        <>
          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-ink">Terakhir kamu buka</h2>
            <div className="flex flex-col gap-3">
              {recent.map((r) => (
                <Link key={r.id} href={`/student/modules/${r.id}?hal=${r.page}`} className="flex items-center gap-3 rounded-2xl p-1 hover:bg-surface">
                  <SubjectCover mapel={r.subject} title="" size="sm" className="h-12 w-16 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-ink">{r.title}</p>
                    <p className="text-xs text-subtle">
                      {r.page >= r.pages ? "Sudah selesai" : `${ago(r.at)} · hal. ${r.page}/${r.pages}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-ink">Progres modul</h2>
            <div className="flex flex-col gap-4">
              {MAPEL.map((m) => {
                const p = perMapel.find((x) => x.subject === m);
                return (
                  <div key={m}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-semibold text-ink">{m}</span>
                      <span className="text-xs text-subtle">
                        {p?.opened ?? 0}/{p?.total ?? 0} PDF
                      </span>
                    </div>
                    <Progress value={p ? (p.opened / p.total) * 100 : 0} color={mapelStyle(m).color} />
                  </div>
                );
              })}
            </div>
          </section>
          <HelpCard />
        </>
      }
    >
      <div className="hidden lg:block">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">Modul pembelajaran</h1>
        <p className="mt-1 text-sm text-subtle">PDF materi dari tutor Rumbasha. Pilih mapel dulu, lalu bab.</p>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <form action="/student/modules" className="relative flex-1">
          <input type="hidden" name="mapel" value={mapel} />
          <Search className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-subtle" />
          <input name="q" defaultValue={sp.q} placeholder="Cari judul PDF" className="h-11 w-full rounded-[22px] bg-surface pl-11 pr-4 text-sm text-ink outline-none placeholder:text-subtle focus:ring-2 focus:ring-primary/25" />
        </form>
        <FilterButton kelas={sp.kelas} status={sp.status} mapel={mapel} bidang={bidang} />
      </div>

      <p className="mb-2 mt-6 text-[13px] font-semibold text-ink-2">Mapel</p>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {(["Semua", ...MAPEL] as const).map((m) => (
          <MapelCard key={m} mapel={m} active={m === mapel} href={link({ mapel: m, bidang: undefined, bab: undefined, q: undefined })} />
        ))}
      </div>

      {bidangList.length > 0 && (
        <>
          <p className="mb-2 mt-6 text-[13px] font-semibold text-ink-2">Bidang materi</p>
          <Chips
            value={bidang ?? "Semua"}
            items={["Semua", ...bidangList].map((b) => ({ value: b, label: b, href: link({ bidang: b === "Semua" ? undefined : b, bab: undefined }) }))}
          />
        </>
      )}

      {!sp.q && (
        <section className="mt-7">
          <h2 className="text-[17px] font-semibold text-ink">{mapel === "Semua" ? "Semua bab" : `Bab di ${bidang ?? mapel}`}</h2>
          <p className="mb-3 text-[13px] text-subtle">Urut sesuai kurikulum</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
            {babs.map((b) => {
              const on = b.bab === bab?.bab && b.mapel === bab?.mapel;
              return (
                <Link key={`${b.mapel}-${b.bab}`} href={link({ mapel: mapel === "Semua" ? "Semua" : b.mapel, bab: b.bab })} scroll={false} className={`rounded-[20px] border-2 bg-white p-2 shadow-panel transition hover:-translate-y-0.5 ${on ? "border-primary" : "border-transparent"}`}>
                  <SubjectCover mapel={b.mapel} bab={b.bab} label="Bab" title={b.bab} className="h-[112px]" />
                  <p className="mt-2.5 px-1.5 text-xs text-subtle">
                    {b.pdf} PDF · {b.opened ? `${b.opened} dibuka` : "belum dibuka"}
                  </p>
                  <Progress className="mx-1.5 mb-1.5 mt-2" value={(b.opened / b.pdf) * 100} color={b.done === b.pdf ? "var(--color-success)" : mapelStyle(b.mapel).color} />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-8">
        {sp.q ? (
          <h2 className="text-[17px] font-semibold text-ink">
            {pdfs.length} hasil untuk “{sp.q}”
          </h2>
        ) : (
          bab && (
            <>
              <h2 className="text-[17px] font-semibold text-ink">{bab.bab}</h2>
              <p className="text-[13px] text-subtle">
                {bab.pdf} PDF · {bab.opened} sudah dibuka
              </p>
            </>
          )
        )}
        <Card className="mt-3 divide-y divide-border-2 px-4">
          {pdfs.length === 0 && <EmptyState title="Belum ada PDF di sini" body="Coba bab atau filter lain." />}
          {pdfs.map((p) => (
            <PdfRow key={p.id} p={p} />
          ))}
        </Card>
      </section>
    </SiswaPage>
  );
}
