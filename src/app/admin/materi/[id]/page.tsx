import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/shell";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { materials } from "@/lib/db/schema";
import { MateriForm } from "../materi-form";

export default async function EditMateriPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const db = await getDb();
  const [m] = await db.select().from(materials).where(eq(materials.id, Number(id)));
  if (!m) notFound();
  return (
    <>
      <AdminHeader back="/admin/materi" title="Edit materi" sub={`${m.subject} › ${m.bidang} › ${m.bab}`} />
      <MateriForm initial={m} />
    </>
  );
}
