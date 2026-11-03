import { HelpCard, MobileBar, SiswaPage } from "@/components/siswa/shell";
import { SEKOLAH_SD, SEKOLAH_SMP } from "@/lib/catalog";
import { requireSiswa } from "@/lib/dal";
import { ProfileForm } from "./profile-form";

export default async function DataDiriPage() {
  const user = await requireSiswa();
  return (
    <SiswaPage header={<MobileBar title="Data diri" back="/siswa/profil" />} aside={<HelpCard />}>
      <h1 className="mb-5 hidden text-[26px] font-semibold tracking-[-0.02em] text-ink lg:block">Data diri</h1>
      <ProfileForm
        schools={[...SEKOLAH_SMP, ...SEKOLAH_SD]}
        user={{
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          jenjang: user.jenjang ?? "SMP",
          grade: user.grade ?? 9,
          school: user.school ?? "",
          target: user.target ?? "",
          avatar: user.avatar,
          parent: user.parent ?? { name: "", relation: "Ibu", phone: "", email: "" },
        }}
      />
    </SiswaPage>
  );
}
