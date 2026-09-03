import { defineConfig } from "drizzle-kit";
import { loadLocalEnv } from "./src/lib/data/postgres/load-env";

loadLocalEnv();

export default defineConfig({
  schema: "./src/lib/data/postgres/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://localhost/ddjj",
  },
});
