import {
  isCamara,
  isEstadoLegislador,
  isSortField,
  parseSortField,
  type Camara,
  type EstadoLegislador,
  type SortField,
} from "./types";
import { ANIO_MAX, ANIO_MIN, PAGE_MIN } from "./query";
import { slugifyDistrito } from "./slugs";

export const EXPLORER_DEFAULT_PAGE = 1;
export const EXPLORER_DEFAULT_PAGE_SIZE = 12;
export const EXPLORER_DEFAULT_SORT: SortField = "nombre";
export const EXPLORER_PAGE_SIZE_MAX = 100;

export type ExplorerQuery = {
  q?: string;
  camara?: Camara;
  estado?: EstadoLegislador;
  distrito?: string;
  anio?: number;
  sort: SortField;
  page: number;
  pageSize: number;
};

export type SearchParamsInput = Record<
  string,
  string | string[] | undefined
>;

function first(sp: SearchParamsInput, key: string): string | undefined {
  const value = sp[key];
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

function parsePage(value: string | undefined): number {
  if (!value) return EXPLORER_DEFAULT_PAGE;
  const n = Number(value);
  if (!Number.isInteger(n) || n < PAGE_MIN) return EXPLORER_DEFAULT_PAGE;
  return n;
}

function parsePageSize(value: string | undefined): number {
  if (!value) return EXPLORER_DEFAULT_PAGE_SIZE;
  const n = Number(value);
  if (!Number.isInteger(n) || n < PAGE_MIN) return EXPLORER_DEFAULT_PAGE_SIZE;
  return Math.min(n, EXPLORER_PAGE_SIZE_MAX);
}

function parseAnio(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n < ANIO_MIN || n > ANIO_MAX) return undefined;
  return n;
}

function parseOptionalEnum<T>(
  value: string | undefined,
  guard: (v: unknown) => v is T,
): T | undefined {
  if (!value || value === "todos") return undefined;
  return guard(value) ? value : undefined;
}

export function parseExplorerQuery(sp: SearchParamsInput): ExplorerQuery {
  const q = first(sp, "q");
  const camara = parseOptionalEnum(first(sp, "camara"), isCamara);
  const estado = parseOptionalEnum(first(sp, "estado"), isEstadoLegislador);
  const distritoRaw = first(sp, "distrito");
  const distrito =
    !distritoRaw || distritoRaw === "todos"
      ? undefined
      : slugifyDistrito(distritoRaw);
  const anio = parseAnio(first(sp, "anio"));
  const sort = parseSortField(first(sp, "sort"));
  const page = parsePage(first(sp, "page"));
  const pageSize = parsePageSize(first(sp, "page_size") ?? first(sp, "pageSize"));

  return {
    q,
    camara,
    estado,
    distrito,
    anio,
    sort,
    page,
    pageSize,
  };
}

export function explorerHref(query: {
  q?: string;
  camara?: string;
  estado?: string;
  distrito?: string;
  anio?: number | string;
  sort?: string;
  page?: number;
  pageSize?: number;
}): string {
  const parsed = parseExplorerQuery({
    q: query.q,
    camara: query.camara,
    estado: query.estado,
    distrito: query.distrito,
    anio: query.anio != null ? String(query.anio) : undefined,
    sort: query.sort,
    page: query.page != null ? String(query.page) : undefined,
    page_size: query.pageSize != null ? String(query.pageSize) : undefined,
  });

  const usp = new URLSearchParams();
  if (parsed.q) usp.set("q", parsed.q);
  if (parsed.camara) usp.set("camara", parsed.camara);
  if (parsed.estado) usp.set("estado", parsed.estado);
  if (parsed.distrito) usp.set("distrito", parsed.distrito);
  if (parsed.anio != null) usp.set("anio", String(parsed.anio));
  if (parsed.sort !== EXPLORER_DEFAULT_SORT) usp.set("sort", parsed.sort);
  if (parsed.page !== EXPLORER_DEFAULT_PAGE) usp.set("page", String(parsed.page));
  if (parsed.pageSize !== EXPLORER_DEFAULT_PAGE_SIZE) {
    usp.set("page_size", String(parsed.pageSize));
  }
  const qs = usp.toString();
  return qs ? `/?${qs}` : "/";
}

const IGNORED_PARAM_LABELS: Record<string, string> = {
  camara: "cámara",
  estado: "estado",
  anio: "año",
  sort: "orden",
  page: "página",
  page_size: "tamaño de página",
  pageSize: "tamaño de página",
};

export function ignoredExplorerParamLabels(sp: SearchParamsInput): string[] {
  const labels: string[] = [];
  const camara = first(sp, "camara");
  if (camara && camara !== "todos" && !isCamara(camara)) {
    labels.push(IGNORED_PARAM_LABELS.camara);
  }
  const estado = first(sp, "estado");
  if (estado && estado !== "todos" && !isEstadoLegislador(estado)) {
    labels.push(IGNORED_PARAM_LABELS.estado);
  }
  const anio = first(sp, "anio");
  if (anio && parseAnio(anio) === undefined) {
    labels.push(IGNORED_PARAM_LABELS.anio);
  }
  const sort = first(sp, "sort");
  if (sort && !isSortField(sort)) {
    labels.push(IGNORED_PARAM_LABELS.sort);
  }
  const page = first(sp, "page");
  if (page) {
    const n = Number(page);
    if (!Number.isInteger(n) || n < PAGE_MIN) {
      labels.push(IGNORED_PARAM_LABELS.page);
    }
  }
  const pageSize = first(sp, "page_size") ?? first(sp, "pageSize");
  if (pageSize) {
    const n = Number(pageSize);
    if (!Number.isInteger(n) || n < PAGE_MIN) {
      labels.push(IGNORED_PARAM_LABELS.page_size);
    }
  }
  return labels;
}

export function hasActiveFilters(query: ExplorerQuery): boolean {
  return Boolean(
    query.q || query.camara || query.estado || query.distrito || query.anio,
  );
}

export function toggleSort(
  current: SortField,
  field: "nombre" | "neto" | "anio",
): SortField {
  const asc = field;
  const desc = `-${field}` as SortField;
  if (current === asc) return desc;
  if (current === desc) return asc;
  return field === "nombre" ? asc : desc;
}

export function formatSortLabel(sort: SortField): string {
  switch (sort) {
    case "nombre":
      return "Nombre A–Z";
    case "-nombre":
      return "Nombre Z–A";
    case "neto":
      return "Patrimonio neto, menor a mayor";
    case "-neto":
      return "Patrimonio neto, mayor a menor";
    case "anio":
      return "Año de declaración, más antiguo";
    case "-anio":
      return "Año de declaración, más reciente";
  }
}

export function toSearchParams(query: ExplorerQuery) {
  return {
    q: query.q,
    camara: query.camara,
    distrito: query.distrito,
    estado: query.estado,
    anio: query.anio,
    sort: query.sort,
    page: query.page,
    pageSize: query.pageSize,
  };
}
