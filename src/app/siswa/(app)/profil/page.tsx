import { ChevronRight, CircleHelp, History, Lock, Pencil, Plus, Settings, User, Users } from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { Avatar } from "@/components/app/visuals";
import { MyStatsAside } from "@/components/siswa/my-stats";
import { MobileBar, SiswaPage } from "@/components/siswa/shell";
import { Badge, Card, Progress } from "@/components/ui/misc";
import { requireSiswa } from "@/lib/dal";
import { daysLeft, longDate, num } from "@/lib/format";
import { getPackage } from "@/lib/queries/siswa";
import { PasswordDialog } from "./password-dialog";

export default async function ProfilPage() {
  const user = await requireSiswa();
  const pkg = await getPackage(user.packageId);
  const left = daysLeft(user.packageUntil);
  const parentPhone = user.parent?.phone ? `${user.parent.phone.slice(0, 4)}-xxxx-${user.parent.phone.slice(-4)}` : "Belum diisi";
  const row = "flex items-center gap-4 border-b border-border-2 py-4 last:border-0";

  return (
    <SiswaPage header={<MobileBar title="Profil" back={null} right={<Link href="/siswa/profil/data-diri" aria-label="Pengaturan" className="grid size-10 place-items-center text-ink"><Settings className="size-5" /></Link>} />} aside={<MyStatsAside user={user} />}>
      <h1 className="hidden text-[26px] font-semibold tracking-[-0.02em] text-ink lg:block">Profil</h1>
      <div className="mt-2 flex items-center gap-4 lg:mt-5">
        <Avatar n={user.avatar} className="size-[72px] ring-[6px] ring-accent-soft" />
        <div className="min-w-0 flex-1">
          <p className="text-[22px] font-semibold leading-tight text-ink">{user.name}</p>
          <p className="text-sm text-subtle">
            Kelas {user.grade} · {user.school}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {pkg && <Badge variant="outline">{pkg.name}</Badge>}
            {user.target && <Badge>Target {user.target}</Badge>}
          </div>
        </div>
        <Link href="/siswa/profil/data-diri" className="hidden items-center gap-1.5 text-sm font-semibold text-ink hover:text-primary sm:flex">
          <Pencil className="size-4" /> Edit
        </Link>
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[17px] font-semibold text-ink">{pkg ? `Paket ${pkg.name}` : "Belum ada paket"}</p>
            <p className="mt-2 text-xs text-subtle">Coin</p>
            <p className="text-[22px] font-semibold text-ink">{num(user.coin)}</p>
          </div>
          <div className="text-right">
            <Link href="/siswa/paket?tab=coin" className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-primary">
              <Plus className="size-4" /> Isi coin
            </Link>
            {user.packageUntil && (
              <>
                <p className="mt-2 text-xs text-subtle">Aktif sampai</p>
                <p className="font-semibold text-ink">{longDate(user.packageUntil)}</p>
              </>
            )}
          </div>
        </div>
        <Progress className="mt-4" value={pkg ? Math.min(100, (left / Math.max(left, pkg.durationDays)) * 100) : 0} />
      </Card>

      <div className="mt-6">
        <Link href="/siswa/profil/data-diri" className={row}>
          <User className="size-5 text-ink" />
          <span className="flex-1">
            <span className="block text-[15px] font-semibold text-ink">Data diri</span>
            <span className="text-xs text-subtle">Nama, kelas, asal sekolah</span>
          </span>
          <ChevronRight className="size-4 text-faint" />
        </Link>
        <Link href="/siswa/profil/data-diri#ortu" className={row}>
          <Users className="size-5 text-ink" />
          <span className="flex-1">
            <span className="block text-[15px] font-semibold text-ink">Kontak orang tua / wali</span>
            <span className="text-xs text-subtle">
              {user.parent ? `${user.parent.relation} · ${parentPhone}` : "Belum diisi"}
            </span>
          </span>
          <ChevronRight className="size-4 text-faint" />
        </Link>
        <Link href="/siswa/profil/riwayat" className={row}>
          <History className="size-5 text-ink" />
          <span className="flex-1">
            <span className="block text-[15px] font-semibold text-ink">Riwayat belajar</span>
            <span className="text-xs text-subtle">Export PDF untuk orang tua</span>
          </span>
          <ChevronRight className="size-4 text-faint" />
        </Link>
        <PasswordDialog className={row}>
          <Lock className="size-5 text-ink" />
          <span className="flex-1 text-left">
            <span className="block text-[15px] font-semibold text-ink">Kata sandi</span>
            <span className="text-xs text-subtle">Ubah kata sandi akun</span>
          </span>
          <ChevronRight className="size-4 text-faint" />
        </PasswordDialog>
        <a href="https://wa.me/6281234567890?text=Halo%20admin%20Rumbasha" target="_blank" rel="noreferrer" className={row}>
          <CircleHelp className="size-5 text-ink" />
          <span className="flex-1 text-[15px] font-semibold text-ink">Bantuan & masukan</span>
          <ChevronRight className="size-4 text-faint" />
        </a>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-4 py-4 text-[15px] font-semibold text-destructive">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Keluar
          </button>
        </form>
      </div>
      <p className="mt-6 text-center text-xs text-subtle">Rumbasha 2.0.0 · preview</p>
    </SiswaPage>
  );
}
