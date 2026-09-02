const FAMILIAR_COLUMN_RE = /^familiar_/i;
const GRUPO_FAMILIAR_FILE_RE = /grupo[-_ ]?familiar/i;

export function isGrupoFamiliarResource(filename: string): boolean {
  return GRUPO_FAMILIAR_FILE_RE.test(filename);
}

export function hasFamiliarColumns(headers: string[]): boolean {
  return headers.some((h) => FAMILIAR_COLUMN_RE.test(h));
}

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

export function padCuit(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return null;
  return digits.padStart(11, "0");
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
