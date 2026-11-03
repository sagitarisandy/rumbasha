import { createHash } from "node:crypto";
import { sql, type SQL } from "drizzle-orm";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { DDL } from "./ddl";
import * as schema from "./schema";
import { seed } from "./seed";

export type DB = PgliteDatabase<typeof schema>;

// One connection per server process. Next dev reloads modules, so the promise lives on globalThis.
const store = globalThis as unknown as { __rumbashaDb?: Promise<DB> };

/**
 * DATABASE_URL set (e.g. Neon on Vercel) → real Postgres, data persists.
 * Not set → embedded PGlite: on disk in .data/ locally, in memory on Vercel (resets on cold start).
 */
export function getDb(): Promise<DB> {
  store.__rumbashaDb ??= connect().catch((err) => {
    store.__rumbashaDb = undefined;
    throw err;
  });
  return store.__rumbashaDb;
}

// Bump-free schema versioning: the hash of the DDL. A preview database built from an older DDL
// is dropped and re-seeded (CREATE TABLE IF NOT EXISTS would not add new columns).
const SCHEMA_VERSION = createHash("sha1").update(DDL).digest("hex").slice(0, 12);
const META = `CREATE TABLE IF NOT EXISTS rb_meta (key text PRIMARY KEY, value text NOT NULL);`;

async function connect(): Promise<DB> {
  const url = process.env.DATABASE_URL;
  let db: DB;
  if (url) {
    const { default: postgres } = await import("postgres");
    const client = postgres(url, { max: Number(process.env.PG_POOL_MAX ?? 5), prepare: false, onnotice: () => {} });
    // One transaction + advisory lock, so parallel cold starts don't migrate at the same time.
    await client.begin(async (tx) => {
      await tx`SELECT pg_advisory_xact_lock(424241)`;
      await tx.unsafe(META);
      const [row] = await tx<{ value: string }[]>`SELECT value FROM rb_meta WHERE key = 'schema'`;
      // Never touch a database this app didn't create (no rb_meta row but other tables present).
      if (!row && (await tx`SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'rb_meta'`).length > 0) {
        throw new Error("DATABASE_URL points to a database that already has other tables. Use an empty database for Rumbasha.");
      }
      if (row && row.value !== SCHEMA_VERSION) await tx.unsafe(`DROP SCHEMA public CASCADE; CREATE SCHEMA public; ${META}`);
      await tx.unsafe(DDL);
      await tx`INSERT INTO rb_meta (key, value) VALUES ('schema', ${SCHEMA_VERSION}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
    });
    db = drizzlePostgres(client, { schema }) as unknown as DB;
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    // PGLITE_DIR=memory forces an in-memory database (e.g. a local `next start` next to `next dev`).
    const dir = process.env.PGLITE_DIR ?? (process.env.VERCEL ? "memory" : ".data/pglite");
    if (dir !== "memory") (await import("node:fs")).mkdirSync(dir, { recursive: true });
    const client = new PGlite(dir === "memory" ? undefined : dir);
    await client.exec(META);
    const { rows } = await client.query<{ value: string }>(`SELECT value FROM rb_meta WHERE key = 'schema'`);
    const stale = rows[0] ? rows[0].value !== SCHEMA_VERSION : (await client.query(`SELECT 1 FROM pg_tables WHERE tablename = 'users'`)).rows.length > 0;
    if (stale) await client.exec(`DROP SCHEMA public CASCADE; CREATE SCHEMA public; ${META}`);
    await client.exec(DDL);
    await client.query(`INSERT INTO rb_meta (key, value) VALUES ('schema', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [SCHEMA_VERSION]);
    db = drizzlePglite(client, { schema });
  }
  await seedOnce(db);
  return db;
}

async function seedOnce(db: DB) {
  // Several serverless instances can boot at once against the same Postgres; the advisory lock
  // makes the first one seed and the rest see a filled database.
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(424242)`);
    const [{ count }] = await tx.select({ count: sql<number>`count(*)::int` }).from(schema.users);
    if (count === 0) await seed(tx as unknown as DB);
  });
}

export { schema };

/** Rows of a raw `db.execute()`: PGlite returns { rows }, postgres.js returns the array itself. */
export async function queryRows<T>(query: SQL): Promise<T[]> {
  const db = await getDb();
  const res = (await db.execute(query)) as unknown as { rows?: T[] } | T[];
  return Array.isArray(res) ? res : (res.rows ?? []);
}

/** Wipes everything and seeds the demo data again (dev, or the super admin "Reset data demo"). */
export async function resetDatabase() {
  const db = await getDb();
  await db.execute(sql`drop schema public cascade`);
  await db.execute(sql`create schema public`);
  for (const stmt of `${META}${DDL}`.split(";").map((s) => s.trim()).filter(Boolean)) await db.execute(sql.raw(stmt));
  await db.execute(sql`insert into rb_meta (key, value) values ('schema', ${SCHEMA_VERSION})`);
  await seedOnce(db);
}
