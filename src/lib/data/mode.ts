import type { DataMode } from "@/lib/domain/types";

export function getDataSource(): DataMode {
  return process.env.DATA_SOURCE === "postgres" ? "postgres" : "mock";
}

export function isMockMode(): boolean {
  return getDataSource() === "mock";
}
