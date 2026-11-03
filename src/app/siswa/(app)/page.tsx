import { ArrowRight, BookOpen, Calculator, ClipboardCheck, Coins, Download, FileText, Megaphone, Package, Star, Trophy, Video, Zap } from "lucide-react";
import Link from "next/link";
import { Rumbi, SubjectCover } from "@/components/app/visuals";
import { RankCard } from "@/components/siswa/rank-card";
import { HelpCard, MobileHome, SiswaPage, StatTile } from "@/components/siswa/shell";
import { LinkButton } from "@/components/ui/button";
import { Card, Progress, SectionTitle } from "@/components/ui/misc";
import { mapelStyle, type Mapel } from "@/lib/catalog";
import { requireSiswa } from "@/lib/dal";
import { ago, daysLeft, firstName, longDate, num } from "@/lib/format";
import { babSummaries, dailyUsedToday, getBoards, getPackage, getSetting, recentReads, unreadCount } from "@/lib/queries/siswa";

export default async function BerandaPage() {
  const user = await requireSiswa();
  const [reads, boards, pkg, daily, unread, announcement, promo] = await Promise.all([
    recentReads(user.id, 1),
    getBoards(user, 3),
    getPackage(user.packageId),
    dailyUsedToday(user.id),
    unreadCount(user.id),
    getSetting<{ text: string; href: string }>("announcement"),
    getSetting<{ label: string; title: string; cta: string; href: string; active: boolean }>("promo"),
  ]);
  const last = reads[0];

  // Rekomendasi: the least-read bab of Matematika, IPA and B. Inggris (skipping what they're already reading).
  const picks = await Promise.all(
    (["Matematika", "IPA", "B. Inggris"] as Mapel[]).map(async (mapel) => {
      const babs = (await babSummaries(user.id, mapel)).filter((b) => b.bab !== last?.bab);
      babs.sort((a, b) => a.opened / a.pdf - b.opened / b.pdf || b.pdf - a.pdf);
      return { mapel, ...babs[0] };
    }),
  );
  const daysTotal = pkg?.durationDays ?? 30;
  const left = daysLeft(user.packageUntil);
  const pct = last ? Math.round((Math.min(last.page, last.pages) / last.pages) * 100) : 0;
  const me = boards.daily.me;

  const menu = [
    { href: "/siswa/modul", label: "Modul", icon: BookOpen, bg: "bg-primary-soft", fg: "text-primary" },
    { href: "/siswa/quiz", label: "Daily Quiz", icon: Zap, bg: "bg-accent-soft", fg: "text-accent", note: daily.free > 0 ? `${daily.free}x gratis` : "10 coin" },
    { href: "/siswa/ujikom", label: "Uji Kom & Tryout", icon: ClipboardCheck, bg: "bg-info-soft", fg: "text-[#2a86db]" },
    { href: "/siswa/rumath", label: "RUMATH", icon: Calculator, bg: "bg-mint-soft", fg: "text-success" },
    { href: "/siswa/paket", label: "Paket", icon: Package, bg: "bg-primary-soft", fg: "text-primary" },
    { href: "/siswa/paket?tab=coin", label: "Top-up Coin", icon: Coins, bg: "bg-cream", fg: "text-warning" },
  ];

  return (
    <SiswaPage
      header={<MobileHome user={user} unread={unread} />}
      aside={
        <>
          <RankCard boards={boards} meId={user.id} />
          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-ink">Paket kamu</h2>
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{pkg?.name ?? "Belum ada paket"}</p>
                  <p className="mt-0.5 text-xs text-subtle">{user.packageUntil ? `Aktif s/d ${longDate(user.packageUntil)} · ${left} hari lagi` : "Pilih paket untuk membuka semua fitur"}</p>
                </div>
                <Link href="/siswa/paket" className="text-[13px] font-semibold text-primary">
                  {pkg ? "Perpanjang" : "Pilih paket"}
                </Link>
              </div>
              <Progress className="mt-4" value={pkg ? Math.min(100, (left / Math.max(left, daysTotal)) * 100) : 0} color="var(--color-success)" />
            </Card>
          </section>
          <HelpCard />
        </>
      }
    >
      {announcement && (
        <Link href={announcement.href} className="mb-6 flex items-center gap-3 rounded-2xl bg-accent-soft px-4 py-3 text-sm text-ink transition hover:brightness-[0.98]">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-accent">
            <Megaphone className="size-4" />
          </span>
          Siapkan dirimu untuk {announcement.text}
        </Link>
      )}

      <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink">Halo, {firstName(user.name)}</h1>
      <p className="mt-1 text-sm text-subtle">
        Kelas {user.grade} · target {user.target}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3 lg:hidden">
        <StatTile tone="orange" icon={<Trophy />} value={me ? `#${me.rank}` : "–"} label="Peringkat" />
        <StatTile tone="indigo" icon={<Star />} value={num(user.points)} label="Poin" />
        <StatTile tone="yellow" icon={<Coins />} value={num(user.coin)} label="Coin" />
      </div>

      {last && (
        <section className="mt-7">
          <SectionTitle title="Lanjutkan belajar" action={<Link href="/siswa/modul">Lihat semua</Link>} />
          <Card className="flex flex-col gap-4 p-3 sm:flex-row">
            <SubjectCover mapel={last.subject} bab={last.bab} label={`Bab · ${last.bidang}`} title={last.bab} className="h-[148px] sm:w-[232px]" />
            <div className="flex min-w-0 flex-1 flex-col px-1 pb-1 sm:py-1">
              <span className="w-fit rounded-xl bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">Terakhir dibuka · {ago(last.at)}</span>
              <p className="mt-2 text-[19px] font-semibold leading-tight text-ink">{last.title}</p>
              <p className="mt-1 text-xs text-subtle">
                {last.subject} › {last.bidang} › {last.bab}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-subtle">
                <span>
                  Hal. {last.page} dari {last.pages}
                </span>
                <span className="font-semibold text-ink">{pct}%</span>
              </div>
              <Progress className="mt-1.5" value={pct} />
              <div className="mt-4 flex items-center gap-2">
                <LinkButton href={`/siswa/modul/${last.id}?hal=${last.page}`}>
                  Lanjut baca <ArrowRight />
                </LinkButton>
                <LinkButton href={`/siswa/modul/${last.id}?unduh=1`} variant="ghost">
                  <Download /> Unduh
                </LinkButton>
              </div>
            </div>
          </Card>
        </section>
      )}

      <section className="mt-8">
        <SectionTitle title="Rekomendasi buatmu" sub="Dipilih dari nilai Daily Quiz terakhirmu" action={<Link href="/siswa/modul">Lihat semua</Link>} />
        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
          {picks.filter((p) => p.bab).map((p) => {
            const progress = Math.round((p.opened / p.pdf) * 100);
            const href = `/siswa/modul?mapel=${encodeURIComponent(p.mapel)}&bidang=${encodeURIComponent(p.bidang)}&bab=${encodeURIComponent(p.bab)}`;
            return (
              <Card key={p.mapel} className="flex w-[260px] shrink-0 snap-start flex-col p-2.5 sm:w-auto">
                <SubjectCover mapel={p.mapel} bab={p.bab} label={p.mapel} title={p.bab} className="h-[128px]" />
                <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
                  <p className="flex items-center gap-3 text-xs text-subtle">
                    <span className="inline-flex items-center gap-1">
                      <FileText className="size-3.5" /> {p.pdf} PDF
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {p.mapel === "IPA" ? <Video className="size-3.5" /> : <Zap className="size-3.5" />} {p.quiz || 2} quiz
                    </span>
                  </p>
                  <div className="mt-3 flex justify-between text-xs">
                    <span className="text-subtle">Progres</span>
                    <span className="font-semibold text-ink">{progress}%</span>
                  </div>
                  <Progress className="mt-1.5" value={progress} color={mapelStyle(p.mapel).color} />
                  <LinkButton href={href} variant="secondary" className="mt-3 w-full">
                    {progress ? "Lanjutkan" : "Mulai belajar"}
                  </LinkButton>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle title="Menu" />
        <div className="grid grid-cols-3 gap-3">
          {menu.map(({ href, label, icon: Icon, bg, fg, note }) => (
            <Link key={label} href={href} className={`relative flex min-h-[96px] flex-col justify-between rounded-[20px] p-3.5 transition hover:-translate-y-0.5 sm:min-h-[100px] ${bg}`}>
              <span className={`grid size-9 place-items-center rounded-full bg-white ${fg}`}>
                <Icon className="size-[18px]" />
              </span>
              {note && <span className="absolute right-3 top-3 text-[11px] font-semibold text-accent-ink">{note}</span>}
              <span className="mt-2 text-sm font-semibold leading-tight text-ink">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {promo?.active && (
        <Link href={promo.href} className="relative mt-8 block overflow-hidden rounded-[22px] bg-linear-to-br from-[#ff9a4d] to-[#f47a22] p-6 text-white shadow-btn-accent">
          <p className="text-xs text-white/85">{promo.label}</p>
          <p className="mt-1 max-w-[62%] text-[20px] font-bold leading-snug">{promo.title}</p>
          <span className="mt-4 inline-flex h-9 items-center rounded-[18px] bg-white px-4 text-sm font-semibold text-accent-ink">{promo.cta}</span>
          <Rumbi pose="koin" className="absolute -bottom-2 right-4 h-[130px] sm:right-10" />
        </Link>
      )}

    </SiswaPage>
  );
}
