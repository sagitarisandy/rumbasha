import { and, asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { getDb } from "@/lib/db";
import { packages, questions } from "@/lib/db/schema";
import { TrialQuiz } from "./trial-client";

export const metadata: Metadata = { title: "Quiz Trial Gratis — Rumbasha" };

const shuffled = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

/** Mostly Matematika (TKA), plus a few other mapel. */
function pickTrial<T extends { subject: string }>(pool: T[]) {
  return shuffled([...shuffled(pool.filter((q) => q.subject === "Matematika")).slice(0, 7), ...shuffled(pool.filter((q) => q.subject !== "Matematika")).slice(0, 3)]);
}

const trialDeadline = () => Date.now() + 10 * 60_000;

async function Trial() {
  await connection();
  const db = await getDb();
  const pool = await db.select().from(questions).where(and(eq(questions.type, "pg"), eq(questions.jenjang, "SMP"))).orderBy(asc(questions.id));
  const chosen = pickTrial(pool);
  const [pkg] = await db.select().from(packages).where(eq(packages.highlight, true)).limit(1);
  return (
    <TrialQuiz
      // answer keys stay on the server
      questions={chosen.map((q) => ({ id: q.id, prompt: q.prompt, options: q.options }))}
      deadline={trialDeadline()}
      suggestion={pkg ? { name: pkg.name, price: pkg.price } : null}
    />
  );
}

export default function QuizTrialPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh animate-pulse bg-white" />}>
      <Trial />
    </Suspense>
  );
}
