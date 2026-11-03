import { ExternalLink } from "lucide-react";
import type { Landing } from "@/app/actions/admin";
import { AdminHeader } from "@/components/admin/shell";
import { buttonClass } from "@/components/ui/button";
import { UnderlineTabs } from "@/components/ui/tabs";
import { requireStaff } from "@/lib/dal";
import { getSetting } from "@/lib/queries/siswa";
import { LandingEditor, PublishButton } from "./landing-editor";

export default async function AdminLandingPage() {
  await requireStaff();
  const [landing, hero] = await Promise.all([getSetting<Landing>("landing"), getSetting<{ title: string; subtitle: string; cta: string; ctaHref: string }>("hero")]);
  const data: Landing = landing ?? { sections: [], changes: [], publishedAt: new Date().toISOString(), publishedBy: "-" };

  return (
    <>
      <AdminHeader
        sub="Atur isi halaman publik. Geser untuk mengubah urutan section."
        actions={
          <>
            <a href="/" target="_blank" rel="noreferrer" className={buttonClass({ variant: "ghost" })}>
              <ExternalLink /> Lihat halaman
            </a>
            <PublishButton disabled={data.changes.length === 0} />
          </>
        }
      />
      <UnderlineTabs
        className="mb-4"
        value="beranda"
        items={[
          { value: "beranda", label: "Beranda", href: "/admin/landing-page" },
          { value: "biaya", label: "Paket & Biaya", href: "/biaya" },
          { value: "prestasi", label: "Siswa Berprestasi", href: "/alumni/rizky" },
          { value: "trial", label: "Quiz Trial", href: "/quiz-trial" },
        ]}
      />
      <LandingEditor initial={data} hero={hero ?? { title: "", subtitle: "", cta: "", ctaHref: "/quiz-trial" }} />
    </>
  );
}
