import { Download, Pencil } from "lucide-react";
import { saveLeaderboard, setPoints } from "@/app/actions/admin";
import { CreateButton, EditRow, type FieldDef } from "@/components/admin/form-dialog";
import { AdminHeader } from "@/components/admin/shell";
import { Pager, Table, Td, Th, pageOf, urlWith } from "@/components/admin/table";
import { Toolbar } from "@/components/admin/toolbar";
import { Avatar } from "@/components/app/visuals";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { SEKOLAH_SMP } from "@/lib/catalog";
import { requireStaff } from "@/lib/dal";
import { num } from "@/lib/format";
import { getSetting, rankBoard, type Board } from "@/lib/queries/siswa";

type Rule = { periode: string; reset: string; poin: string; top: number; hadiah: string };
const BOARDS: [Board | "rumath", string][] = [
  ["daily", "Daily Quiz"],
  ["ujikom", "Uji Kom"],
  ["tryout", "Tryout"],
  ["rumath", "RUMATH"],
];
const RULE_FIELDS: FieldDef[] = [
  { name: "periode", label: "Periode", type: "select", options: ["Mingguan", "Bulanan", "Per sesi", "Per tryout"].map((v) => ({ value: v, label: v })) },
  { name: "reset", label: "Reset", placeholder: "Senin 00.00" },
  { name: "poin", label: "Aturan poin", wide: true, placeholder: "Nilai ÷ 2 per quiz" },
  { name: "top", label: "Tampilkan teratas", type: "number" },
  { name: "hadiah", label: "Hadiah", placeholder: "50 coin untuk 3 teratas" },
];
const PER = 15;

export default async function AdminLeaderboardPage({ searchParams }: { searchParams: Promise<{ papan?: string; periode?: string; kelas?: string; sekolah?: string; q?: string; hal?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const board: Board = sp.papan === "ujikom" || sp.papan === "tryout" ? sp.papan : "daily";
  const period = sp.periode === "minggu" || sp.periode === "bulan" ? sp.periode : "semua";
  const page = pageOf(sp.hal);
  const [rules, ranked] = await Promise.all([
    getSetting<Record<string, Rule>>("leaderboard"),
    rankBoard({ board, period, jenjang: null, grade: sp.kelas ? Number(sp.kelas) : null, school: sp.sekolah || null }),
  ]);
  const all = sp.q ? ranked.filter((r) => r.name.toLowerCase().includes(sp.q!.toLowerCase())) : ranked;
  const top = ranked.filter((r) => r.rank <= (rules?.[board]?.top ?? 1000));
  const rows = all.slice((page - 1) * PER, page * PER);
  const label = BOARDS.find(([b]) => b === board)?.[1];

  return (
    <>
      <AdminHeader sub="Atur poin, periode, dan hadiah tiap papan peringkat." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {BOARDS.map(([b, name]) => {
          const r = rules?.[b];
          return (
            <Card key={b} className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-[15px] font-semibold text-ink">{name}</p>
                <CreateButton label="Edit" title={`Atur leaderboard ${name}`} fields={RULE_FIELDS} values={r} action={saveLeaderboard.bind(null, b)} variant="secondary" size="sm" icon={<Pencil />} />
              </div>
              <dl className="mt-3 grid grid-cols-[72px_1fr] gap-y-1.5 text-[13px]">
                <dt className="text-subtle">Periode</dt>
                <dd className="text-right font-semibold text-ink">{r?.periode ?? "–"}</dd>
                <dt className="text-subtle">Reset</dt>
                <dd className="text-right font-semibold text-ink">{r?.reset ?? "–"}</dd>
                <dt className="text-subtle">Poin</dt>
                <dd className="text-right font-semibold text-ink">{r?.poin ?? "–"}</dd>
                <dt className="text-subtle">Hadiah</dt>
                <dd className="text-right font-semibold text-ink">{r?.hadiah ?? "–"}</dd>
              </dl>
            </Card>
          );
        })}
      </div>

      <div className="mb-3 mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[17px] font-semibold text-ink">
            {label} · {period === "minggu" ? "minggu ini" : period === "bulan" ? "bulan ini" : "semua waktu"}
          </p>
          <p className="text-[13px] text-subtle">{num(all.length)} siswa · {num(top.length)} tampil di aplikasi</p>
        </div>
        <Segmented
          size="sm"
          className="w-[320px]"
          value={board}
          items={(["daily", "ujikom", "tryout"] as const).map((b) => ({ value: b, label: BOARDS.find(([x]) => x === b)![1], href: urlWith("/admin/leaderboard", { periode: sp.periode }, { papan: b }) }))}
        />
      </div>
      <Toolbar
        placeholder="Cari siswa…"
        filters={[
          { key: "periode", label: "Periode", options: [{ value: "minggu", label: "Minggu ini" }, { value: "bulan", label: "Bulan ini" }] },
          { key: "kelas", label: "Kelas", options: ["7", "8", "9"].map((k) => ({ value: k, label: `Kelas ${k}` })) },
          { key: "sekolah", label: "Sekolah", options: SEKOLAH_SMP.map((s) => ({ value: s, label: s })) },
        ]}
        right={
          <a href={`/api/admin/export?jenis=leaderboard&papan=${board}`} className={buttonClass({ variant: "ghost", size: "sm" })}>
            <Download /> Export
          </a>
        }
      />
      <Table>
        <thead>
          <tr>
            <Th>Peringkat</Th>
            <Th>Siswa</Th>
            <Th>Asal sekolah</Th>
            <Th>{board === "daily" && period === "semua" ? "Poin" : "Skor"}</Th>
            <Th className="text-right">Aksi</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-sidebar">
              <Td className="font-semibold">#{r.rank}</Td>
              <Td>
                <span className="flex items-center gap-3">
                  <Avatar n={r.avatar} className="size-8" />
                  <span className="font-semibold">{r.name}</span>
                </span>
              </Td>
              <Td className="text-ink-2">{r.school}</Td>
              <Td className="font-semibold">{num(r.score)}</Td>
              <Td>
                {board === "daily" && period === "semua" ? (
                  <EditRow what={r.name} title={`Koreksi poin ${r.name}`} fields={[{ name: "points", label: "Poin Daily Quiz", type: "number", hint: "Dipakai bila ada kecurangan atau salah input." }]} values={{ points: r.score }} action={setPoints.bind(null, r.id)} />
                ) : (
                  <span className="block text-right text-xs text-subtle">dari nilai quiz</span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pager total={all.length} page={page} perPage={PER} href={(p) => urlWith("/admin/leaderboard", sp, { hal: p })} />
    </>
  );
}
