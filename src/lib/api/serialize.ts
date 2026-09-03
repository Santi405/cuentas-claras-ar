import type {
  Bien,
  DeclaracionDetalle,
  DeclaracionResumen,
  Deuda,
  EvolucionAnual,
  Fuente,
  LegisladorDetalle,
  LegisladorListItem,
  Mandato,
} from "@/lib/domain/types";

function publicFuente(fuente: Fuente) {
  return {
    nombre: fuente.nombre,
    url: fuente.url,
    snapshot_date: fuente.snapshotDate,
    archivo: fuente.archivo,
    archivo_hash: fuente.archivoHash,
  };
}

function publicBien(item: Bien) {
  return {
    id: item.id,
    tipo: item.tipo,
    descripcion: item.descripcion,
    titularidad_pct: item.titularidadPct,
    importe_ars: item.importeArs,
  };
}

function publicDeuda(item: Deuda) {
  return {
    id: item.id,
    tipo: item.tipo,
    descripcion: item.descripcion,
    radicacion: item.radicacion,
    importe_ars: item.importeArs,
  };
}

export function publicLegisladorListItem(item: LegisladorListItem) {
  return {
    id: item.id,
    slug: item.slug,
    nombre_completo: item.nombreCompleto,
    camara_actual: item.camaraActual,
    distrito_actual: item.distritoActual,
    estado: item.estado,
    ultimo_anio_declarado: item.ultimoAnioDeclarado,
    neto_ars: item.netoArs,
  };
}

export function publicMandato(mandato: Mandato) {
  return {
    id: mandato.id,
    camara: mandato.camara,
    distrito: mandato.distrito,
    inicio: mandato.inicio,
    fin: mandato.fin,
    bloque: mandato.bloque,
    interbloque: mandato.interbloque,
    lista_electoral: mandato.listaElectoral,
  };
}

export function publicDeclaracionResumen(declaracion: DeclaracionResumen) {
  return {
    id: declaracion.id,
    anio_fiscal: declaracion.anioFiscal,
    tipo: declaracion.tipo,
    rectificativa: declaracion.rectificativa,
    periodo: declaracion.periodo,
    bienes: declaracion.bienes,
    deudas: declaracion.deudas,
    neto: declaracion.neto,
    source_dj_id: declaracion.sourceDjId,
  };
}

export function publicEvolucion(row: EvolucionAnual) {
  return {
    anio_fiscal: row.anioFiscal,
    neto: row.neto,
    comparable: row.comparable,
    faltante: row.faltante,
  };
}

export function publicLegisladorDetalle(legislador: LegisladorDetalle) {
  return {
    id: legislador.persona.id,
    slug: legislador.persona.slug,
    nombre: legislador.persona.nombre,
    apellido: legislador.persona.apellido,
    nombre_completo: legislador.persona.nombreCompleto,
    estado: legislador.estado,
    mandatos: legislador.mandatos.map(publicMandato),
    declaraciones: legislador.declaraciones.map(publicDeclaracionResumen),
    evolucion: legislador.evolucion.map(publicEvolucion),
  };
}

export function publicDeclaracionDetalle(declaracion: DeclaracionDetalle) {
  return {
    id: declaracion.id,
    anio_fiscal: declaracion.anioFiscal,
    tipo: declaracion.tipo,
    rectificativa: declaracion.rectificativa,
    periodo: declaracion.periodo,
    bienes: declaracion.bienesMostrados,
    deudas: declaracion.deudasMostradas,
    neto: declaracion.neto,
    source_dj_id: declaracion.sourceDjId,
    procedencia: publicFuente(declaracion.fuente),
    bienes_items: declaracion.bienesItems.map(publicBien),
    deudas_items: declaracion.deudasItems.map(publicDeuda),
  };
}

export function publicMeta(meta: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}) {
  return {
    page: meta.page,
    page_size: meta.pageSize,
    total: meta.total,
    total_pages: meta.totalPages,
  };
}
