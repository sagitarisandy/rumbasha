import { FileText, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Rumbi } from "@/components/app/visuals";
import { MobileBar, SiswaPage } from "@/components/siswa/shell";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/misc";
import { requireSiswa } from "@/lib/dal";
import { duration, firstName } from "@/lib/format";
import { KIND_LABEL, loadResult } from "@/lib/queries/hasil";
import { myRank } from "@/lib/queries/siswa";

export default async function HasilPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSiswa();
  const { id } = await params;
  const r = await loadResult(Number(id), user.id);
  if (!r) notFound();
  // Daily Quiz sets are personal, so its rank is the global Daily Quiz board.
  const board = r.quiz.kind === "daily" ? await myRank("daily", user.id, user.jenjang) : null;
  const rankLabel = board ? (board.rank ? `#${board.rank}/${board.of}` : "–") : r.rank ? `#${r.rank}/${r.participants}` : "–";
  const good = r.score >= 70;
  const kind = KIND_LABEL[r.quiz.kind] ?? "Quiz";
  const weakest = r.review[0]?.bab;
  const back = r.quiz.kind === "daily" ? "/siswa/quiz" : r.quiz.kind === "rumath" ? "/siswa/rumath" : "/siswa/ujikom";

  const cells: [string, string][] = [
    ["Benar", String(r.benar)],
    ["Salah", String(r.salah)],
    ["Kosong", String(r.kosong)],
    ["Poin", r.points ? `+${r.points}` : "0"],
    ["Peringkat", rankLabel],
    ["Waktu", duration(Math.min(r.seconds, r.quiz.durationMin * 60))],
  ];

  return (
    <SiswaPage header={<MobileBar title={`Hasil ${kind}`} back={back} right={<span className="grid size-10 place-items-center text-ink"><Share2 className="size-5" /></span>} />}>
      <div className="mx-auto max-w-[400px] text-center">
        <Rumbi pose={good ? "juara" : "sedih"} className="mx-auto h-[150px]" />
        <p className="mt-4 text-sm text-subtle">Nilai kamu</p>
        <p className="text-[64px] font-bold leading-none tracking-[-0.03em] text-ink">{r.score}</p>
        <p className="mt-3 text-lg font-semibold text-ink">{good ? `Mantap, ${firstName(user.name)}!` : "Belum pas, tapi sudah selesai."}</p>
        <p className="mt-1 text-sm text-subtle">
          {good
            ? `${r.avg !== null && r.score >= r.avg && r.participants > 1 ? `Di atas rata-rata peserta (${r.avg}). ` : ""}${r.points ? `Poin +${r.points} sudah masuk peringkat.` : "Pertahankan, ya!"}`
            : `Banyak salah di ${weakest ?? "materi ini"}. Baca lagi materinya, lalu coba Daily Quiz level Mudah.`}
        </p>
      </div>

      <div className="mx-auto mt-7 grid max-w-[400px] grid-cols-3 border-y border-border">
        {cells.map(([k, v], n) => (
          <div key={k} className={`px-3 py-3 ${n % 3 ? "border-l border-border" : ""} ${n < 3 ? "border-b border-border" : ""}`}>
            <p className="text-xs text-subtle">{k}</p>
            <p className="text-lg font-semibold text-ink">{v}</p>
          </div>
        ))}
      </div>

      {r.review.length > 0 && (
        <Card className="mx-auto mt-6 max-w-[400px] p-5">
          <p className="font-semibold text-ink">Perlu diulang</p>
          <div className="mt-2 divide-y divide-border-2">
            {r.review.map((rv) => (
              <div key={rv.bab} className="flex items-center gap-3 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{rv.material?.title ?? rv.bab}</p>
                  <p className="text-xs text-subtle">{rv.wrong} soal salah</p>
                </div>
                {rv.material && (
                  <Link href={`/siswa/modul/${rv.material.id}`} className="text-sm font-semibold text-ink hover:text-primary">
                    Baca
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mx-auto mt-6 flex max-w-[400px] flex-col gap-2">
        <LinkButton href={`/siswa/hasil/${r.attempt.id}/pembahasan`} size="lg">
          Lihat pembahasan
        </LinkButton>
        <LinkButton href={r.quiz.kind === "daily" ? "/siswa/peringkat" : `/siswa/peringkat?quiz=${r.quiz.id}`} variant="ghost" size="lg">
          Lihat peringkat quiz ini
        </LinkButton>
      </div>
    </SiswaPage>
  );
}
