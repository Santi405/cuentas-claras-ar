import { getRepository } from "@/lib/data";
import { PAGE_SIZE_MAX } from "@/lib/domain/pagination";
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

export async function listAniosDeclaracion() {
  return getRepository().listAniosDeclaracion();
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

/** Public profile slugs for sitemap and static params. Paginates the repository. */
export async function listAllLegisladorSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await searchLegisladores({ page, pageSize: PAGE_SIZE_MAX });
    slugs.push(...result.data.map((item) => item.slug));
    totalPages = result.meta.totalPages;
    if (totalPages <= 0 || result.data.length === 0) break;
    page += 1;
  }

  return slugs;
}
