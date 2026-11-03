import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/shell";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import { VideoForm } from "../video-form";

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const db = await getDb();
  const [v] = await db.select().from(videos).where(eq(videos.id, Number(id)));
  if (!v) notFound();
  return (
    <>
      <AdminHeader back="/admin/rumath" title="Edit video" sub={`${v.bidang} · video ${v.position}`} />
      <VideoForm initial={v} />
    </>
  );
}
