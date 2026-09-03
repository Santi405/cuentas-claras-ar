import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL no está definida. Usá DATA_SOURCE=mock o configurá Neon (vercel integration add neon).",
    );
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

let _db: ReturnType<typeof createDb> | null = null;

/** Lazy singleton. Build stays possible without DATABASE_URL until a query runs. */
export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}
