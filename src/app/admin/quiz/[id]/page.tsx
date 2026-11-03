import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/shell";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { quizzes } from "@/lib/db/schema";
import { bankForBuilder } from "../bank";
import { QuizBuilder } from "../quiz-builder";

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const db = await getDb();
  const [q] = await db.select().from(quizzes).where(eq(quizzes.id, Number(id)));
  if (!q) notFound();
  return (
    <>
      <AdminHeader back="/admin/quiz" title="Edit quiz" sub={q.title} />
      <QuizBuilder bank={await bankForBuilder()} initial={q} />
    </>
  );
}
