import { AdminHeader } from "@/components/admin/shell";
import { requireStaff } from "@/lib/dal";
import { VideoForm } from "../video-form";

export default async function TambahVideoPage() {
  await requireStaff();
  return (
    <>
      <AdminHeader back="/admin/rumath" title="Tambah video" sub="Video materi RUMATH per jenis soal." />
      <VideoForm />
    </>
  );
}
