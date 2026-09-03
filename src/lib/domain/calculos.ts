import type {
  Declaracion,
  DeclaracionResumen,
  EvolucionAnual,
  SerieMacro,
  TipoDeclaracion,
  VistaMonto,
} from "./types";

export function montosSegunTipo(declaracion: {
  tipo: TipoDeclaracion;
  bienesInicio: number;
  bienesCierre: number;
  deudasInicio: number;
  deudasCierre: number;
}): { bienes: number; deudas: number; neto: number } {
  const usarInicio = declaracion.tipo === "inicial";
  const bienes = usarInicio ? declaracion.bienesInicio : declaracion.bienesCierre;
  const deudas = usarInicio ? declaracion.deudasInicio : declaracion.deudasCierre;
  return { bienes, deudas, neto: bienes - deudas };
}

export function esComparableAnual(declaracion: {
  tipo: TipoDeclaracion;
  periodo: string;
  rectificativa: number;
}): boolean {
  return declaracion.tipo === "anual";
}

/** Keep the highest rectificativa per year, preferring anual/cierre. */
export function elegirDeclaracionesVisibles(
  declaraciones: Declaracion[],
): Declaracion[] {
  const byYear = new Map<number, Declaracion[]>();
  for (const d of declaraciones) {
    const list = byYear.get(d.anioFiscal) ?? [];
    list.push(d);
    byYear.set(d.anioFiscal, list);
  }

  const chosen: Declaracion[] = [];
  for (const [, list] of byYear) {
    const sorted = [...list].sort((a, b) => {
      const tipoRank = (t: TipoDeclaracion) =>
        t === "anual" ? 0 : t === "inicial" ? 1 : 2;
      if (tipoRank(a.tipo) !== tipoRank(b.tipo)) {
        return tipoRank(a.tipo) - tipoRank(b.tipo);
      }
      if (b.rectificativa !== a.rectificativa) {
        return b.rectificativa - a.rectificativa;
      }
      if (a.periodo !== b.periodo) {
        return a.periodo === "C" ? -1 : 1;
      }
      return 0;
    });
    chosen.push(sorted[0]);
  }
  return chosen.sort((a, b) => a.anioFiscal - b.anioFiscal);
}

export function toResumen(declaracion: Declaracion): DeclaracionResumen {
  const montos = montosSegunTipo(declaracion);
  return {
    id: declaracion.id,
    anioFiscal: declaracion.anioFiscal,
    tipo: declaracion.tipo,
    rectificativa: declaracion.rectificativa,
    periodo: declaracion.periodo,
    bienes: montos.bienes,
    deudas: montos.deudas,
    neto: montos.neto,
    fuenteId: declaracion.fuenteId,
    sourceDjId: declaracion.sourceDjId,
  };
}

export function construirEvolucion(
  resumenes: DeclaracionResumen[],
): EvolucionAnual[] {
  if (resumenes.length === 0) return [];
  const byYear = new Map(resumenes.map((r) => [r.anioFiscal, r]));
  const years = resumenes.map((r) => r.anioFiscal);
  const min = Math.min(...years);
  const max = Math.max(...years);
  const rows: EvolucionAnual[] = [];
  for (let anio = min; anio <= max; anio += 1) {
    const row = byYear.get(anio);
    rows.push({
      anioFiscal: anio,
      bienes: row?.bienes ?? null,
      deudas: row?.deudas ?? null,
      neto: row?.neto ?? null,
      comparable: row ? esComparableAnual(row) : false,
      faltante: !row,
      rectificativa: row?.rectificativa ?? 0,
      tipo: row?.tipo ?? null,
    });
  }
  return rows;
}

export function variacionNominalPct(
  actual: number | null,
  previa: number | null,
): number | null {
  if (actual === null || previa === null || previa === 0) return null;
  return ((actual - previa) / Math.abs(previa)) * 100;
}

export function variacionInteranual(
  evolucion: EvolucionAnual[],
  anio: number,
): number | null {
  const actual = evolucion.find((e) => e.anioFiscal === anio);
  const previa = evolucion.find((e) => e.anioFiscal === anio - 1);
  if (!actual || !previa) return null;
  if (actual.faltante || previa.faltante) return null;
  if (!actual.comparable || !previa.comparable) return null;
  return variacionNominalPct(actual.neto, previa.neto);
}

export function convertirMonto(
  montoArs: number,
  anio: number,
  vista: VistaMonto,
  series: SerieMacro[],
  anioBaseIpc = 2024,
): number | null {
  if (vista === "nominal") return montoArs;
  const serieAnio = series.find((s) => s.anio === anio);
  if (!serieAnio) return null;
  if (vista === "ipc") {
    const base = series.find((s) => s.anio === anioBaseIpc);
    if (!base || serieAnio.ipcIndice === 0) return null;
    return montoArs * (base.ipcIndice / serieAnio.ipcIndice);
  }
  if (serieAnio.usdBcra3500Cierre === 0) return null;
  return montoArs / serieAnio.usdBcra3500Cierre;
}

export const IPC_ANIO_BASE = 2024;
