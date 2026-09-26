import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export { schema };

export type Db = ReturnType<typeof createDb>;

let db: Db | null = null;

const createDb = (url: string) => drizzle({ client: neon(url), schema });

export const getDb = (): Db => {
  if (db) return db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing DATABASE_URL configuration");
  }

  db = createDb(url);
  return db;
};

export const resetDb = () => {
  db = null;
};
