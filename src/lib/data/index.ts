import { getDataSource } from "@/lib/data/mode";
import { mockRepository } from "@/lib/data/mock/adapter";
import { postgresRepository } from "@/lib/data/postgres/adapter";
import type { LegisladorRepository } from "@/lib/data/repository";

export function getRepository(): LegisladorRepository {
  return getDataSource() === "postgres" ? postgresRepository : mockRepository;
}

export { getDataSource, isMockMode } from "@/lib/data/mode";
