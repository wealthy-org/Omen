import { readFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import { Pool } from "@neondatabase/serverless";

config({ path: [".env.local", ".env"] });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL configuration");

  const pool = new Pool({ connectionString: url });
  try {
    await pool.query(readFileSync(join(__dirname, "seed.sql"), "utf8"));
    console.log("seed applied");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
