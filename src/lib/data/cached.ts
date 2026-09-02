import { getRepository } from "@/lib/data";
import type { Camara, LegisladorSearchParams } from "@/lib/domain/types";

/** Server data access. Pages and API routes use the repository through these helpers. */

export async function searchLegisladores(params: LegisladorSearchParams) {
  return getRepository().searchLegisladores(params);
}

export async function getLegisladorBySlug(slug: string) {
  return getRepository().getLegisladorBySlug(slug);
}

export async function resolveSlugRedirect(slug: string) {
  return getRepository().resolveSlugRedirect(slug);
}

export async function getDeclaracion(personaId: string, anioFiscal: number) {
  return getRepository().getDeclaracion(personaId, anioFiscal);
}

export async function listDistritos() {
  return getRepository().listDistritos();
}

export async function getSeriesMacro() {
  return getRepository().getSeriesMacro();
}

export async function getLegisladorByIdOrSlug(idOrSlug: string) {
  return getRepository().getLegisladorByIdOrSlug(idOrSlug);
}

export async function listMandatos(filters?: {
  camara?: Camara;
  distrito?: string;
  personaId?: string;
}) {
  return getRepository().listMandatos(filters);
}

export async function listDeclaraciones(personaId: string) {
  return getRepository().listDeclaraciones(personaId);
}
