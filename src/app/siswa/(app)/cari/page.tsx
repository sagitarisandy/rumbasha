import { and, eq, ilike, inArray, or } from "drizzle-orm";
import { Search } from "lucide-react";
import Link from "next/link";
import { EmptyState, SubjectCover } from "@/components/app/visuals";
import { HelpCard, MobileBar, SiswaPage } from "@/components/siswa/shell";
import { VideoThumb } from "@/components/siswa/video-thumb";
import { Segmented } from "@/components/ui/tabs";
import { requireSiswa } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { materials, quizzes, videos } from "@/lib/db/schema";
import { clock, duration, shortDate } from "@/lib/format";
import { RecentSearches, RememberSearch } from "./recent";

export default async function CariPage({ searchParams }: { searchParams: Promise<{ q?: string; tipe?: string }> }) {
  const user = await requireSiswa();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const tipe = sp.tipe === "pdf" || sp.tipe === "quiz" || sp.tipe === "video" ? sp.tipe : "semua";
  const db = await getDb();
  const like = `%${q}%`;
  const [pdfs, qz, vids] = q
    ? await Promise.all([
        tipe === "semua" || tipe === "pdf"
          ? db.select().from(materials).where(and(eq(materials.status, "publish"), eq(materials.jenjang, user.jenjang ?? "SMP"), or(ilike(materials.title, like), ilike(materials.bab, like), ilike(materials.summary, like)))).limit(20)
          : [],
        tipe === "semua" || tipe === "quiz"
          ? db.select().from(quizzes).where(and(inArray(quizzes.kind, ["ujikom", "tryout"]), eq(quizzes.status, "aktif"), or(ilike(quizzes.title, like), ilike(quizzes.bab, like)))).limit(10)
          : [],
        tipe === "semua" || tipe === "video" ? db.select().from(videos).where(and(eq(videos.status, "publish"), or(ilike(videos.title, like), ilike(videos.bidang, like)))).limit(10) : [],
      ])
    : [[], [], []];
  const count = pdfs.length + qz.length + vids.length;
  const href = (t: string) => `/siswa/cari?${new URLSearchParams({ q, ...(t !== "semua" ? { tipe: t } : {}) })}`;

  return (
    <SiswaPage header={<MobileBar title="Cari" />} aside={<HelpCard />}>
      <form action="/siswa/cari" className="relative">
        <Search className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-subtle" />
        <input name="q" defaultValue={q} autoFocus placeholder="Cari materi, PDF, atau quiz…" className="h-12 w-full rounded-3xl bg-surface pl-11 pr-4 text-[15px] text-ink outline-none placeholder:text-subtle focus:ring-2 focus:ring-primary/25" />
        {tipe !== "semua" && <input type="hidden" name="tipe" value={tipe} />}
      </form>
      {q && <RememberSearch q={q} />}
      <Segmented
        className="mt-4"
        value={tipe}
        items={[
          { value: "semua", label: "Semua", href: href("semua") },
          { value: "pdf", label: "PDF", href: href("pdf") },
          { value: "quiz", label: "Quiz", href: href("quiz") },
          { value: "video", label: "Video", href: href("video") },
        ]}
      />

      {!q ? (
        <RecentSearches />
      ) : count === 0 ? (
        <EmptyState pose="mikir" title={`Tidak ada hasil untuk “${q}”`} body="Coba kata lain, misalnya nama bab atau mapel." />
      ) : (
        <>
          <p className="mt-5 text-[13px] text-subtle">
            {count} hasil untuk “{q}”
          </p>
          <div className="mt-2 divide-y divide-border-2">
            {pdfs.map((m) => (
              <Link key={`m${m.id}`} href={`/siswa/modul/${m.id}`} className="flex gap-4 py-4 hover:bg-sidebar">
                <SubjectCover mapel={m.subject} title="" size="sm" className="h-[68px] w-[92px] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-subtle">
                    Modul › {m.subject} › {m.bidang}
                  </p>
                  <p className="text-[16px] font-semibold text-ink">{m.title}</p>
                  <p className="line-clamp-2 text-sm text-ink-2">{m.summary}</p>
                  <p className="mt-0.5 text-xs text-subtle">{m.pages} halaman</p>
                </div>
              </Link>
            ))}
            {qz.map((z) => (
              <Link key={`q${z.id}`} href="/siswa/ujikom" className="flex gap-4 py-4 hover:bg-sidebar">
                <SubjectCover mapel={z.subject === "Semua" ? "Semua" : z.subject} title="" size="sm" className="h-[68px] w-[92px] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-subtle">{z.kind === "tryout" ? "Tryout" : "Uji Kom & Tryout"}</p>
                  <p className="text-[16px] font-semibold text-ink">{z.title}</p>
                  <p className="text-sm text-ink-2">
                    {z.startsAt ? `${shortDate(z.startsAt)} ${clock(z.startsAt)}` : "Jadwal menyusul"} · {z.questionIds.length} soal · perlu kode akses
                  </p>
                </div>
              </Link>
            ))}
            {vids.map((v) => (
              <Link key={`v${v.id}`} href={`/siswa/rumath/video/${v.id}`} className="flex gap-4 py-4 hover:bg-sidebar">
                <VideoThumb jenis={v.bidang} seconds={v.durationSec} className="h-[68px] w-[92px] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-subtle">RUMATH › {v.bidang}</p>
                  <p className="text-[16px] font-semibold text-ink">{v.title}</p>
                  <p className="text-sm text-ink-2">
                    Video {v.position} · {duration(v.durationSec)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </SiswaPage>
  );
}
