import type { DataMode } from "@/lib/domain/types";

export function getDataSource(): DataMode {
  return process.env.DATA_SOURCE === "postgres" ? "postgres" : "mock";
}

export function isMockMode(): boolean {
  return getDataSource() === "mock";
}

/**
 * Seeded Postgres still uses the fictional mock dataset.
 * Hide the demo banner only when DEMO_MODE=false (future real ingest).
 */
export function isFictionalData(): boolean {
  if (isMockMode()) return true;
  return process.env.DEMO_MODE !== "false";
}
