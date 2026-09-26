import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { sql } from "drizzle-orm";
import { vi } from "vitest";
import * as dbLib from "@/lib/db";
import { schema, type Db } from "@/lib/db";

export { schema };

const MIGRATIONS_FOLDER = path.resolve(import.meta.dirname, "../../db/migrations");

const TABLES = [
  "oracle_snapshots",
  "creator_confirmations",
  "creator_profiles",
  "market_settlements",
  "market_resolutions",
  "market_events",
  "market_positions",
  "markets",
  "belief_sources",
  "beliefs",
  "users",
];

export function useTestDb() {
  const client = new PGlite();
  const db = drizzle({ client, schema });
  const ready = migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

  const handle = {
    db: db as unknown as Db,
    async reset() {
      await ready;
      await db.execute(sql.raw(`TRUNCATE ${TABLES.join(", ")} CASCADE`));
      vi.spyOn(dbLib, "getDb").mockReturnValue(handle.db);
    },
  };

  return handle;
}

export function failingDb(message: string) {
  vi.spyOn(dbLib, "getDb").mockImplementation(() => {
    throw new Error(message);
  });
}
