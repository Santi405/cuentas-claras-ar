const FAMILIAR_COLUMN_RE = /^familiar_/i;
const GRUPO_FAMILIAR_FILE_RE = /grupo[-_ ]?familiar/i;

/** Official OA resource names and any path that looks like the family dump. */
export const GRUPO_FAMILIAR_FILENAME_EXAMPLES = [
  "declaraciones-juradas-grupo-familiar-2024-consolidado-al-20251222.csv",
] as const;

export function isGrupoFamiliarResource(filename: string): boolean {
  return GRUPO_FAMILIAR_FILE_RE.test(filename);
}

export function isFamiliarColumn(header: string): boolean {
  return FAMILIAR_COLUMN_RE.test(header.trim());
}

export function hasFamiliarColumns(headers: string[]): boolean {
  return headers.some((h) => isFamiliarColumn(h));
}

export function familiarColumns(headers: string[]): string[] {
  return headers.filter((h) => isFamiliarColumn(h));
}

/**
 * Hard stop: family resources and family columns must never enter
 * the public consolidado/bienes/deudas path.
 */
export function familyExclusionReason(
  filename: string,
  headers: string[],
): string | null {
  if (isGrupoFamiliarResource(filename)) {
    return "archivo_grupo_familiar";
  }
  if (hasFamiliarColumns(headers)) {
    return "columnas_grupo_familiar";
  }
  return null;
}
