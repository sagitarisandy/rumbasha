import { and, asc, eq, ne } from "drizzle-orm";
import { Download, Zap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Rumbi, SubjectCover } from "@/components/app/visuals";
import { PdfRow } from "@/components/siswa/pdf-row";
import { PdfViewer } from "@/components/siswa/pdf-viewer";
import { HelpCard, MobileBar, SiswaPage } from "@/components/siswa/shell";
import { LinkButton, buttonClass } from "@/components/ui/button";
import { Card, Progress } from "@/components/ui/misc";
import { MAPEL, mapelStyle } from "@/lib/catalog";
import { requireSiswa } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { materials, progress } from "@/lib/db/schema";
import { ago } from "@/lib/format";
import { pdfPage } from "@/lib/pdf-content";
import { mapelProgress, recentReads } from "@/lib/queries/siswa";

export default async function PdfPreviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ hal?: string }> }) {
  const user = await requireSiswa();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const db = await getDb();
  const [m] = await db.select().from(materials).where(and(eq(materials.id, Number(id)), eq(materials.status, "publish")));
  if (!m) notFound();

  const [mine] = await db.select().from(progress).where(and(eq(progress.userId, user.id), eq(progress.materialId, m.id)));
  const start = Number(sp.hal) || mine?.page || 1;
  const others = await db
    .select({ id: materials.id, title: materials.title, pages: materials.pages, page: progress.page })
    .from(materials)
    .leftJoin(progress, and(eq(progress.materialId, materials.id), eq(progress.userId, user.id)))
    .where(and(eq(materials.bab, m.bab), eq(materials.subject, m.subject), eq(materials.status, "publish"), ne(materials.id, m.id)))
    .orderBy(asc(materials.id));
  const [recent, perMapel] = await Promise.all([recentReads(user.id, 3), mapelProgress(user.id)]);

  // Only the page types differ, so send cover, the 4 body variants and the summary page.
  const content: Record<number, ReturnType<typeof pdfPage>> = {};
  for (const n of [1, 2, 3, 4, 5, m.pages]) if (n <= m.pages) content[n] = pdfPage(m, n);
  const quizHref = `/siswa/quiz?mapel=${encodeURIComponent(m.subject)}&bidang=${encodeURIComponent(m.bidang)}&bab=${encodeURIComponent(m.bab)}&level=Mudah`;

  return (
    <SiswaPage
      header={<MobileBar title={m.title} back={`/siswa/modul?mapel=${encodeURIComponent(m.subject)}&bab=${encodeURIComponent(m.bab)}`} right={<a href={`/api/materi/${m.id}/pdf`} className={buttonClass({ variant: "ghost", size: "icon" })} aria-label="Unduh PDF"><Download /></a>} />}
      aside={
        <>
          <section className="hidden xl:block">
            <h2 className="mb-3 text-[17px] font-semibold text-ink">Terakhir kamu buka</h2>
            <div className="flex flex-col gap-3">
              {recent.map((r) => (
                <Link key={r.id} href={`/siswa/modul/${r.id}?hal=${r.page}`} className="flex items-center gap-3 rounded-2xl p-1 hover:bg-surface">
                  <SubjectCover mapel={r.subject} title="" size="sm" className="h-12 w-16 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-ink">{r.title}</p>
                    <p className="text-xs text-subtle">{r.page >= r.pages ? "Sudah selesai" : `${ago(r.at)} · hal. ${r.page}/${r.pages}`}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          <section className="hidden xl:block">
            <h2 className="mb-3 text-[17px] font-semibold text-ink">Progres modul</h2>
            <div className="flex flex-col gap-4">
              {MAPEL.map((s) => {
                const p = perMapel.find((x) => x.subject === s);
                return (
                  <div key={s}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-semibold text-ink">{s}</span>
                      <span className="text-xs text-subtle">{p?.opened ?? 0}/{p?.total ?? 0} PDF</span>
                    </div>
                    <Progress value={p ? (p.opened / p.total) * 100 : 0} color={mapelStyle(s).color} />
                  </div>
                );
              })}
            </div>
          </section>
          <HelpCard />
        </>
      }
    >
      <div className="mb-4 hidden items-start justify-between gap-4 lg:flex">
        <div>
          <p className="text-xs text-subtle">
            {m.subject} › {m.bidang} › {m.bab}
          </p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-ink">{m.title}</h1>
        </div>
        <a href={`/api/materi/${m.id}/pdf`} className={buttonClass({ variant: "ghost" })}>
          <Download /> Unduh PDF
        </a>
      </div>

      <PdfViewer id={m.id} pages={m.pages} start={start} content={content} />

      <div className="relative mt-5 flex items-center gap-4 overflow-hidden rounded-[20px] bg-accent-soft p-5 pl-[112px]">
        <Rumbi pose="mikir" className="absolute bottom-0 left-4 h-[88px]" />
        <div>
          <p className="font-semibold text-ink">Sudah paham? Coba 5 soal</p>
          <p className="text-[13px] text-subtle">Daily Quiz dari materi ini, level Mudah.</p>
          <LinkButton href={quizHref} variant="accent" size="sm" className="mt-2.5">
            <Zap /> Buat Daily Quiz
          </LinkButton>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-7">
          <h2 className="text-[17px] font-semibold text-ink">PDF lain di bab ini</h2>
          <Card className="mt-3 divide-y divide-border-2 px-4">
            {others.map((p) => (
              <PdfRow key={p.id} p={p} />
            ))}
          </Card>
        </section>
      )}
    </SiswaPage>
  );
}
