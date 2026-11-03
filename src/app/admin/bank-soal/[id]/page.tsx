import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/shell";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { SoalForm } from "../soal-form";

export default async function EditSoalPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const db = await getDb();
  const [q] = await db.select().from(questions).where(eq(questions.id, Number(id)));
  if (!q) notFound();
  return (
    <>
      <AdminHeader back="/admin/bank-soal" title={`Edit soal Q-${1000 + q.id}`} sub={`${q.subject} › ${q.bab} · ${q.level}`} />
      <SoalForm initial={q} />
    </>
  );
}
