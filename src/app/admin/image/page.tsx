/* eslint-disable @next/next/no-img-element -- images are served from the database by /api/images */
import { and, count, desc, eq, ilike, type SQL } from "drizzle-orm";
import { LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { deleteEntity } from "@/app/actions/admin";
import { AdminHeader } from "@/components/admin/shell";
import { Pager, Table, Td, Th, TypePill, pageOf, urlWith } from "@/components/admin/table";
import { RowActions, Toolbar } from "@/components/admin/toolbar";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { images } from "@/lib/db/schema";
import { shortDate } from "@/lib/format";
import { CopyLink, UploadButton } from "./upload";

const PER = 15;
const size = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export default async function ImagePage({ searchParams }: { searchParams: Promise<{ q?: string; folder?: string; view?: string; hal?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const page = pageOf(sp.hal);
  const db = await getDb();
  const where: SQL[] = [];
  if (sp.q) where.push(ilike(images.name, `%${sp.q}%`));
  if (sp.folder) where.push(eq(images.folder, sp.folder));
  const cols = { id: images.id, name: images.name, mime: images.mime, size: images.size, folder: images.folder, uploadedBy: images.uploadedBy, createdAt: images.createdAt };
  const [[{ n }], rows] = await Promise.all([
    db.select({ n: count() }).from(images).where(and(...where)),
    db.select(cols).from(images).where(and(...where)).orderBy(desc(images.id)).limit(PER).offset((page - 1) * PER),
  ]);
  const list = sp.view === "list";
  const viewBtn = (v: string, on: boolean, icon: React.ReactNode) => (
    <Link href={urlWith("/admin/image", sp, { view: v === "grid" ? undefined : v })} className={`grid size-8 place-items-center rounded-lg ${on ? "bg-white text-ink shadow-tab" : "text-subtle"}`} aria-label={v}>
      {icon}
    </Link>
  );

  return (
    <>
      <AdminHeader sub="Gambar untuk soal, materi, dan landing page." actions={<UploadButton />} />
      <Toolbar
        placeholder="Cari nama file…"
        filters={[{ key: "folder", label: "Kategori", options: ["Soal", "Materi", "Banner", "Landing"].map((f) => ({ value: f, label: f })) }]}
        right={
          <div className="flex rounded-xl bg-surface p-1">
            {viewBtn("grid", !list, <LayoutGrid className="size-4" />)}
            {viewBtn("list", list, <List className="size-4" />)}
          </div>
        }
      />
      {list ? (
        <Table>
          <thead>
            <tr>
              <Th>File</Th>
              <Th>Kategori</Th>
              <Th>Ukuran</Th>
              <Th>Diupload</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((img) => (
              <tr key={img.id}>
                <Td>
                  <span className="flex items-center gap-3">
                    <img src={`/api/images/${img.id}`} alt="" className="size-10 rounded-lg bg-surface object-contain" />
                    <span className="font-semibold">{img.name}</span>
                  </span>
                </Td>
                <Td>
                  <TypePill>{img.folder}</TypePill>
                </Td>
                <Td className="text-ink-2">{size(img.size)}</Td>
                <Td className="text-ink-2">
                  {img.uploadedBy} · {shortDate(img.createdAt)}
                </Td>
                <Td>
                  <RowActions what={img.name} onDelete={deleteEntity.bind(null, "image", img.id)} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {rows.map((img) => (
            <div key={img.id} className="group">
              <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-surface">
                <img src={`/api/images/${img.id}`} alt={img.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <CopyLink id={img.id} />
                  <RowActions what={img.name} onDelete={deleteEntity.bind(null, "image", img.id)} />
                </div>
              </div>
              <p className="mt-2 truncate text-sm font-semibold text-ink">{img.name}</p>
              <p className="flex justify-between text-xs text-subtle">
                <span>{img.folder}</span>
                <span>{size(img.size)}</span>
              </p>
            </div>
          ))}
        </div>
      )}
      <Pager total={n} page={page} perPage={PER} href={(p) => urlWith("/admin/image", sp, { hal: p })} />
    </>
  );
}
