import type {
  Camara,
  DataMode,
  DeclaracionDetalle,
  LegisladorDetalle,
  LegisladorListItem,
  LegisladorSearchParams,
  Mandato,
  Paginated,
  SerieMacro,
} from "@/lib/domain/types";

export type LegisladorRepository = {
  mode(): DataMode;
  searchLegisladores(
    params: LegisladorSearchParams,
  ): Promise<Paginated<LegisladorListItem>>;
  getLegisladorBySlug(slug: string): Promise<LegisladorDetalle | null>;
  getLegisladorByIdOrSlug(idOrSlug: string): Promise<LegisladorDetalle | null>;
  resolveSlugRedirect(slug: string): Promise<string | null>;
  getDeclaracion(
    personaId: string,
    anioFiscal: number,
  ): Promise<DeclaracionDetalle | null>;
  listDeclaraciones(personaId: string): Promise<DeclaracionDetalle[]>;
  listMandatos(filters?: {
    camara?: Camara;
    distrito?: string;
    personaId?: string;
  }): Promise<Mandato[]>;
  listDistritos(): Promise<string[]>;
  getSeriesMacro(): Promise<SerieMacro[]>;
};
