"use client";

import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/app/visuals";
import { Segmented } from "@/components/ui/tabs";
import { num } from "@/lib/format";

export type RankRow = { id: number; name: string; school: string | null; avatar: number; score: number; rank: number };
export type BoardData = { top: RankRow[]; me: RankRow | null; delta: number; unit: string };

const MEDAL = ["bg-[#f5b301] text-white", "bg-[#a3a6c2] text-white", "bg-[#e0874a] text-white"];

function RankItem({ r, me, data }: { r: RankRow; me?: boolean; data: BoardData }) {
  return (
    <li className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${me ? "bg-primary-soft" : ""}`}>
      {r.rank <= 3 ? (
        <span className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${MEDAL[r.rank - 1]}`}>{r.rank}</span>
      ) : (
        <span className="w-6 shrink-0 text-center text-[13px] font-semibold text-ink-2">{r.rank}</span>
      )}
      <Avatar n={r.avatar} className="size-10" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-ink">{me ? "Kamu" : r.name}</p>
        {me && data.delta > 0 ? (
          <p className="flex items-center gap-1 text-xs text-success">
            <TrendingUp className="size-3" /> Naik {data.delta} minggu ini
          </p>
        ) : (
          <p className="truncate text-xs text-subtle">{r.school}</p>
        )}
      </div>
      <p className="shrink-0 text-right text-[15px] font-semibold text-ink">
        {num(r.score)} <span className="text-xs font-normal text-subtle">{data.unit}</span>
      </p>
    </li>
  );
}

export function RankList({ data, meId, limit = 3 }: { data: BoardData; meId: number; limit?: number }) {
  const rows = data.top.slice(0, limit);
  const showMe = data.me && !rows.some((r) => r.id === meId);
  return (
    <ul className="flex flex-col gap-1">
      {rows.map((r) => (
        <RankItem key={r.id} r={r} me={r.id === meId} data={data} />
      ))}
      {showMe && data.me && <RankItem r={data.me} me data={data} />}
    </ul>
  );
}

export function RankCard({ boards, meId, title = "Peringkat kamu" }: { boards: Record<"daily" | "ujikom" | "tryout", BoardData>; meId: number; title?: string }) {
  const [tab, setTab] = useState<"daily" | "ujikom" | "tryout">("daily");
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
        <Link href={`/student/leaderboard?papan=${tab}`} className="text-[13px] font-semibold text-primary">
          Lihat semua
        </Link>
      </div>
      <Segmented
        className="mb-3"
        value={tab}
        onChange={setTab}
        items={[
          { value: "daily", label: "Daily Quiz" },
          { value: "ujikom", label: "Uji Kom" },
          { value: "tryout", label: "Tryout" },
        ]}
      />
      <RankList data={boards[tab]} meId={meId} />
    </section>
  );
}
