import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Load `.env.local` / `.env` for Drizzle Kit and seed scripts (Next.js already loads them). */
export function loadLocalEnv(cwd = process.cwd()): void {
  for (const name of [".env.local", ".env"]) {
    const file = resolve(cwd, name);
    if (!existsSync(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const rawLine of text.split("\n")) {
      const line = rawLine.replace(/\r$/, "").trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      if (!key || process.env[key] !== undefined) continue;
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}
