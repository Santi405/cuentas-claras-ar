import { parseSortField } from "./types";
import type { LegisladorListItem, SortField } from "./types";

function compareNullableNumber(
  a: number | null,
  b: number | null,
  dir: number,
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * dir;
}

export function sortLegisladores(
  items: LegisladorListItem[],
  sort: SortField | string | undefined,
): LegisladorListItem[] {
  const resolved = parseSortField(sort);
  const dir = resolved.startsWith("-") ? -1 : 1;
  const key = resolved.replace("-", "") as "nombre" | "neto" | "anio";
  return [...items].sort((a, b) => {
    if (key === "nombre") {
      return a.nombreCompleto.localeCompare(b.nombreCompleto, "es-AR") * dir;
    }
    if (key === "neto") {
      return compareNullableNumber(a.netoArs, b.netoArs, dir);
    }
    return compareNullableNumber(a.ultimoAnioDeclarado, b.ultimoAnioDeclarado, dir);
  });
}
