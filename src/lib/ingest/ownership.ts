import { parseMoney, type MoneyParse } from "./money";

/**
 * Official OA metadata (bienes.bien_importe):
 * "El número expresado es sobre el porcentaje de la titularidad."
 *
 * Confirmed against that documentation. The pipeline must not multiply
 * `bien_importe × bien_titularidad`.
 */
export const BIEN_IMPORTE_INCLUDES_TITULARIDAD = true;

export type BienImporteInterpretation = {
  titularidadRaw: string;
  importeRaw: string;
  importeCanonical: string | null;
  importeParse: MoneyParse;
  multipliedByTitularidad: false;
};

export function interpretBienImporte(
  importeRaw: string,
  titularidadRaw: string,
): BienImporteInterpretation {
  const importeParse = parseMoney(importeRaw);
  return {
    titularidadRaw,
    importeRaw,
    importeCanonical: importeParse.ok ? importeParse.canonical : null,
    importeParse,
    multipliedByTitularidad: false,
  };
}

/** Guard used by tests and future aggregations. Never multiply. */
export function declaredAmountForTitularidad(importeCanonical: string): string {
  if (!BIEN_IMPORTE_INCLUDES_TITULARIDAD) {
    throw new Error("La regla de titularidad no está confirmada");
  }
  return importeCanonical;
}
