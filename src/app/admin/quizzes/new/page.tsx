import { AdminHeader } from "@/components/admin/shell";
import { requireStaff } from "@/lib/dal";
import { bankForBuilder } from "../bank";
import { QuizBuilder } from "../quiz-builder";

export default async function BuatQuizPage() {
  await requireStaff();
  return (
    <>
      <AdminHeader back="/admin/quizzes" title="Buat quiz" sub="Tiga langkah: info, pilih soal, lalu jadwal dan kode akses." />
      <QuizBuilder bank={await bankForBuilder()} />
    </>
  );
}
