import { AdminHeader } from "@/components/admin/shell";
import { requireStaff } from "@/lib/dal";
import { MateriForm } from "../materi-form";

export default async function TambahMateriPage() {
  await requireStaff();
  return (
    <>
      <AdminHeader back="/admin/materi" title="Tambah materi" sub="Upload PDF untuk menu Modul siswa." />
      <MateriForm />
    </>
  );
}
