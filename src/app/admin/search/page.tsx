import { ilike, or } from "drizzle-orm";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/shell";
import { MathText } from "@/components/app/math-text";
import { Card } from "@/components/ui/misc";
import { requireStaff } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { materials, questions, quizzes, users } from "@/lib/db/schema";

export default async function AdminSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaff();
  const q = ((await searchParams).q ?? "").trim();
  const like = `%${q}%`;
  const db = await getDb();
  const [u, s, m, z] = q
    ? await Promise.all([
        db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users).where(or(ilike(users.name, like), ilike(users.email, like))).limit(8),
        db.select({ id: questions.id, prompt: questions.prompt, bab: questions.bab }).from(questions).where(or(ilike(questions.prompt, like), ilike(questions.bab, like))).limit(8),
        db.select({ id: materials.id, title: materials.title, bab: materials.bab }).from(materials).where(or(ilike(materials.title, like), ilike(materials.bab, like))).limit(8),
        db.select({ id: quizzes.id, title: quizzes.title, kind: quizzes.kind }).from(quizzes).where(ilike(quizzes.title, like)).limit(8),
      ])
    : [[], [], [], []];
  const groups: [string, { href: string; title: React.ReactNode; sub: string }[]][] = [
    ["User", u.map((x) => ({ href: `/admin/users/${x.id}`, title: x.name, sub: `${x.email} · ${x.role}` }))],
    ["Soal", s.map((x) => ({ href: `/admin/questions/${x.id}`, title: <MathText text={x.prompt} />, sub: `Q-${1000 + x.id} · ${x.bab}` }))],
    ["Materi", m.map((x) => ({ href: `/admin/materials/${x.id}`, title: x.title, sub: x.bab }))],
    ["Quiz", z.map((x) => ({ href: `/admin/quizzes/${x.id}`, title: x.title, sub: x.kind }))],
  ];
  return (
    <>
      <AdminHeader title={q ? `Hasil untuk “${q}”` : "Cari"} sub="User, soal, materi, dan quiz." />
      <form action="/admin/search" className="mb-5 max-w-[480px]">
        <input name="q" defaultValue={q} autoFocus placeholder="Ketik nama, email, judul…" className="h-11 w-full rounded-[22px] bg-surface px-4 text-sm outline-none focus:ring-2 focus:ring-primary/25" />
      </form>
      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map(([label, items]) => (
          <Card key={label} className="p-5">
            <p className="font-semibold text-ink">
              {label} <span className="text-sm font-normal text-subtle">{items.length}</span>
            </p>
            <div className="mt-2 divide-y divide-border-2">
              {items.length === 0 && <p className="py-3 text-sm text-subtle">Tidak ada.</p>}
              {items.map((it) => (
                <Link key={it.href} href={it.href} className="block py-2.5 hover:text-primary">
                  <span className="line-clamp-1 text-sm font-semibold text-ink">{it.title}</span>
                  <span className="text-xs text-subtle">{it.sub}</span>
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
