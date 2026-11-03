import { AdminHeader } from "@/components/admin/shell";
import { requireStaff } from "@/lib/dal";
import { SoalForm } from "../soal-form";

export default async function TambahSoalPage({ searchParams }: { searchParams: Promise<{ tipe?: string }> }) {
  await requireStaff();
  const { tipe } = await searchParams;
  return (
    <>
      <AdminHeader back="/admin/questions" title="Tambah soal" sub="Satu soal per halaman. Untuk banyak soal, pakai Import Excel." />
      <SoalForm defaultType={tipe === "isian" ? "isian" : "pg"} />
    </>
  );
}
