import { parseCuit } from "./cuit";

export {
  hasFamiliarColumns,
  isGrupoFamiliarResource,
} from "./family";

export function looksLikeLegisladorNacional(
  organismo: string,
  cargo: string,
): boolean {
  const text = `${organismo} ${cargo}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const cargoHint = /\b(diputad[oa]s?|senador(?:a|es)?)\b/.test(text);
  const cuerpoHint =
    /camara de diputados|h\.?\s*camara|senado de la nacion|congreso de la nacion|poder legislativo nacional/.test(
      text,
    );
  const excluded = /\b(asesor|empleado|secretario administrativo|personal)\b/.test(
    text,
  );
  return cargoHint && (cuerpoHint || cargoHint) && !excluded;
}

/** Canonical 11-digit CUIT or null. Does not pad short values. */
export function padCuit(value: string | number | null | undefined): string | null {
  const parsed = parseCuit(value);
  return parsed.ok ? parsed.canonical : null;
}

export function normalizeNombre(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
