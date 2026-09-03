import { PAGE_SIZE_MAX } from "./pagination";

/** Shared query bounds for the explorer UI and the public API. */
export const ANIO_MIN = 1990;
export const ANIO_MAX = 2100;
export const PAGE_MIN = 1;
export { PAGE_SIZE_MAX };

export const Q_MAX_LENGTH = 200;
export const DISTRITO_MAX_LENGTH = 80;
export const PUBLIC_ID_MAX_LENGTH = 80;

export const API_DEFAULT_PAGE = 1;
export const API_DEFAULT_PAGE_SIZE = 20;
export const API_DEFAULT_SORT = "nombre" as const;

export function isAnioFiscal(value: number): boolean {
  return Number.isInteger(value) && value >= ANIO_MIN && value <= ANIO_MAX;
}
