import { cacheLife, cacheTag } from "next/cache";
import { getRepository } from "@/lib/data";
import type { Camara, LegisladorSearchParams } from "@/lib/domain/types";

export async function searchLegisladores(params: LegisladorSearchParams) {
  "use cache";
  cacheLife("hours");
  cacheTag("legisladores");
  return getRepository().searchLegisladores(params);
}

export async function getLegisladorBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("legisladores");
  cacheTag(`legislador:${slug}`);
  return getRepository().getLegisladorBySlug(slug);
}

export async function resolveSlugRedirect(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("legisladores");
  return getRepository().resolveSlugRedirect(slug);
}

export async function getDeclaracion(personaId: string, anioFiscal: number) {
  "use cache";
  cacheLife("hours");
  cacheTag("legisladores");
  cacheTag(`persona:${personaId}`);
  return getRepository().getDeclaracion(personaId, anioFiscal);
}

export async function listDistritos() {
  "use cache";
  cacheLife("hours");
  cacheTag("legisladores");
  return getRepository().listDistritos();
}

export async function getSeriesMacro() {
  "use cache";
  cacheLife("hours");
  cacheTag("macro");
  return getRepository().getSeriesMacro();
}

export async function getLegisladorByIdOrSlug(idOrSlug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("legisladores");
  return getRepository().getLegisladorByIdOrSlug(idOrSlug);
}

export async function listMandatos(filters?: {
  camara?: Camara;
  distrito?: string;
  personaId?: string;
}) {
  "use cache";
  cacheLife("hours");
  cacheTag("legisladores");
  return getRepository().listMandatos(filters);
}

export async function listDeclaraciones(personaId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`persona:${personaId}`);
  return getRepository().listDeclaraciones(personaId);
}
