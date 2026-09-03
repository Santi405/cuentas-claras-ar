import { isVistaMonto, type VistaMonto } from "./types";

export type PerfilQuery = {
  anioParam: string | undefined;
  anioSolicitado: number | undefined;
  vistaParam: string | undefined;
  vista: VistaMonto;
  vistaInvalida: boolean;
};

function first(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = sp[key];
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

export function parsePerfilQuery(
  sp: Record<string, string | string[] | undefined>,
): PerfilQuery {
  const anioParam = first(sp, "anio");
  const parsed = anioParam !== undefined ? Number(anioParam) : undefined;
  const anioSolicitado =
    parsed !== undefined && Number.isInteger(parsed) ? parsed : undefined;
  const vistaRaw = first(sp, "vista");
  const vistaValida = isVistaMonto(vistaRaw);
  return {
    anioParam,
    anioSolicitado,
    vistaParam: vistaRaw,
    vista: vistaValida ? vistaRaw : "nominal",
    vistaInvalida: vistaRaw !== undefined && !vistaValida,
  };
}

export function resolverAnioDeclaracion(
  anios: number[],
  anioSolicitado: number | undefined,
  pidioAnio: boolean,
): { anio: number | null; anioInvalido: boolean } {
  if (anios.length === 0) {
    return { anio: null, anioInvalido: pidioAnio };
  }
  if (!pidioAnio) {
    return { anio: anios.at(-1) ?? null, anioInvalido: false };
  }
  if (anioSolicitado === undefined || !anios.includes(anioSolicitado)) {
    return { anio: anios.at(-1) ?? null, anioInvalido: true };
  }
  return { anio: anioSolicitado, anioInvalido: false };
}

export function perfilHref(
  slug: string,
  anio: number | null,
  vista: VistaMonto,
): string {
  const usp = new URLSearchParams();
  if (anio != null) usp.set("anio", String(anio));
  if (vista !== "nominal") usp.set("vista", vista);
  const qs = usp.toString();
  return qs ? `/legisladores/${slug}?${qs}` : `/legisladores/${slug}`;
}
