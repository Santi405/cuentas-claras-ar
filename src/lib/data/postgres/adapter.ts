import { and, asc, eq, inArray } from "drizzle-orm";
import {
  construirEvolucion,
  elegirDeclaracionesVisibles,
  montosSegunTipo,
  toResumen,
} from "@/lib/domain/calculos";
import { nombreCompleto } from "@/lib/domain/formatters";
import { estadoDeMandatos } from "@/lib/domain/mandatos";
import { slugifyDistrito } from "@/lib/domain/slugs";
import type {
  Bien,
  Declaracion,
  DeclaracionDetalle,
  Deuda,
  Fuente,
  LegisladorDetalle,
  LegisladorSearchParams,
  Mandato,
  Persona,
  SerieMacro,
} from "@/lib/domain/types";
import type { LegisladorRepository } from "@/lib/data/repository";
import { getDb } from "./db";
import { withPostgres } from "./errors";
import { parseAmount, parseOptionalAmount } from "./numeric";
import * as t from "./schema";
import { searchLegisladoresSql } from "./search";

function mapPersona(row: typeof t.personas.$inferSelect): Persona {
  return {
    id: row.id,
    apellido: row.apellido,
    nombre: row.nombre,
    slug: row.slug,
    cuit: row.cuit,
    fechaNacimiento: row.fechaNacimiento,
    fotoUrl: row.fotoUrl,
  };
}

function mapMandato(row: typeof t.mandatos.$inferSelect): Mandato {
  return {
    id: row.id,
    personaId: row.personaId,
    camara: row.camara,
    distrito: row.distrito,
    inicio: row.inicio,
    fin: row.fin,
    bloque: row.bloque,
    interbloque: row.interbloque,
    listaElectoral: row.listaElectoral,
  };
}

function mapDeclaracion(row: typeof t.declaraciones.$inferSelect): Declaracion {
  return {
    id: row.id,
    personaId: row.personaId,
    anioFiscal: row.anioFiscal,
    tipo: row.tipo,
    fuenteId: row.fuenteId,
    sourceDjId: row.sourceDjId,
    rectificativa: row.rectificativa,
    periodo: row.periodo,
    organismoDeclarado: row.organismoDeclarado,
    cargoDeclarado: row.cargoDeclarado,
    bienesInicio: parseAmount(row.bienesInicio),
    bienesCierre: parseAmount(row.bienesCierre),
    deudasInicio: parseAmount(row.deudasInicio),
    deudasCierre: parseAmount(row.deudasCierre),
  };
}

function mapFuente(row: typeof t.fuentes.$inferSelect): Fuente {
  return {
    id: row.id,
    nombre: row.nombre,
    url: row.url,
    snapshotDate: row.snapshotDate,
    archivo: row.archivo,
    archivoHash: row.archivoHash,
  };
}

function mapBien(row: typeof t.bienes.$inferSelect): Bien {
  return {
    id: row.id,
    declaracionId: row.declaracionId,
    tipo: row.tipo,
    descripcion: row.descripcion,
    origenFondos: row.origenFondos,
    titularidadPct: parseOptionalAmount(row.titularidadPct),
    importeArs: parseAmount(row.importeArs),
  };
}

function mapDeuda(row: typeof t.deudas.$inferSelect): Deuda {
  return {
    id: row.id,
    declaracionId: row.declaracionId,
    tipo: row.tipo,
    descripcion: row.descripcion,
    radicacion: row.radicacion,
    clasificacion: row.clasificacion,
    importeArs: parseAmount(row.importeArs),
  };
}

async function declaracionesPersona(personaId: string): Promise<Declaracion[]> {
  const rows = await getDb()
    .select()
    .from(t.declaraciones)
    .where(eq(t.declaraciones.personaId, personaId));
  return rows.map(mapDeclaracion);
}

async function mandatosPersona(personaId: string): Promise<Mandato[]> {
  const rows = await getDb()
    .select()
    .from(t.mandatos)
    .where(eq(t.mandatos.personaId, personaId))
    .orderBy(asc(t.mandatos.inicio), asc(t.mandatos.id));
  return rows.map(mapMandato);
}

async function hydrateDeclaraciones(
  declaraciones: Declaracion[],
): Promise<DeclaracionDetalle[]> {
  if (declaraciones.length === 0) return [];
  const db = getDb();
  const ids = declaraciones.map((d) => d.id);
  const fuenteIds = [...new Set(declaraciones.map((d) => d.fuenteId))];
  const [fuenteRows, bienRows, deudaRows] = await Promise.all([
    db.select().from(t.fuentes).where(inArray(t.fuentes.id, fuenteIds)),
    db.select().from(t.bienes).where(inArray(t.bienes.declaracionId, ids)),
    db.select().from(t.deudas).where(inArray(t.deudas.declaracionId, ids)),
  ]);
  const fuentes = new Map(fuenteRows.map((row) => [row.id, mapFuente(row)]));
  const bienesByDecl = new Map<string, Bien[]>();
  for (const row of bienRows) {
    const item = mapBien(row);
    const list = bienesByDecl.get(item.declaracionId) ?? [];
    list.push(item);
    bienesByDecl.set(item.declaracionId, list);
  }
  const deudasByDecl = new Map<string, Deuda[]>();
  for (const row of deudaRows) {
    const item = mapDeuda(row);
    const list = deudasByDecl.get(item.declaracionId) ?? [];
    list.push(item);
    deudasByDecl.set(item.declaracionId, list);
  }
  return declaraciones.map((d) => {
    const fuente = fuentes.get(d.fuenteId);
    if (!fuente) throw new Error(`Fuente no encontrada: ${d.fuenteId}`);
    const montos = montosSegunTipo(d);
    return {
      ...d,
      fuente,
      bienesItems: bienesByDecl.get(d.id) ?? [],
      deudasItems: deudasByDecl.get(d.id) ?? [],
      bienesMostrados: montos.bienes,
      deudasMostradas: montos.deudas,
      neto: montos.neto,
    };
  });
}

async function buildDetalle(persona: Persona): Promise<LegisladorDetalle> {
  const db = getDb();
  const [ms, declaraciones, cuitRow] = await Promise.all([
    mandatosPersona(persona.id),
    declaracionesPersona(persona.id),
    db
      .select()
      .from(t.identificadoresExternos)
      .where(
        and(
          eq(t.identificadoresExternos.personaId, persona.id),
          eq(t.identificadoresExternos.sistema, "cuit"),
        ),
      )
      .then((rows) => rows[0]),
  ]);
  const visibles = elegirDeclaracionesVisibles(declaraciones);
  const resumenes = visibles.map(toResumen);
  return {
    persona: { ...persona, nombreCompleto: nombreCompleto(persona.nombre, persona.apellido) },
    estado: estadoDeMandatos(ms),
    mandatos: ms,
    declaraciones: resumenes,
    evolucion: construirEvolucion(resumenes),
    cuit: cuitRow?.valor ?? persona.cuit,
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const postgresRepository: LegisladorRepository = {
  mode() {
    return "postgres";
  },

  searchLegisladores(params: LegisladorSearchParams) {
    return withPostgres(() => searchLegisladoresSql(params));
  },

  getLegisladorBySlug(slug: string) {
    return withPostgres(async () => {
      const [row] = await getDb()
        .select()
        .from(t.personas)
        .where(eq(t.personas.slug, slug));
      if (!row) return null;
      return buildDetalle(mapPersona(row));
    });
  },

  getLegisladorByIdOrSlug(idOrSlug: string) {
    return withPostgres(async () => {
      const db = getDb();
      if (UUID_RE.test(idOrSlug)) {
        const [byId] = await db
          .select()
          .from(t.personas)
          .where(eq(t.personas.id, idOrSlug));
        if (byId) return buildDetalle(mapPersona(byId));
      }
      const [bySlug] = await db
        .select()
        .from(t.personas)
        .where(eq(t.personas.slug, idOrSlug));
      if (!bySlug) return null;
      return buildDetalle(mapPersona(bySlug));
    });
  },

  resolveSlugRedirect(slug: string) {
    return withPostgres(async () => {
      const db = getDb();
      const [hit] = await db
        .select()
        .from(t.slugHistory)
        .where(eq(t.slugHistory.slug, slug));
      if (!hit) return null;
      const [persona] = await db
        .select()
        .from(t.personas)
        .where(eq(t.personas.id, hit.personaId));
      return persona?.slug ?? null;
    });
  },

  getDeclaracion(personaId: string, anioFiscal: number) {
    return withPostgres(async () => {
      const visibles = elegirDeclaracionesVisibles(
        await declaracionesPersona(personaId),
      );
      const d = visibles.find((x) => x.anioFiscal === anioFiscal);
      if (!d) return null;
      const [detalle] = await hydrateDeclaraciones([d]);
      return detalle ?? null;
    });
  },

  listDeclaraciones(personaId: string) {
    return withPostgres(async () => {
      const visibles = elegirDeclaracionesVisibles(
        await declaracionesPersona(personaId),
      );
      return hydrateDeclaraciones(visibles);
    });
  },

  listMandatos(filters) {
    return withPostgres(async () => {
      const conditions = [];
      if (filters?.camara) conditions.push(eq(t.mandatos.camara, filters.camara));
      if (filters?.distrito) {
        conditions.push(eq(t.mandatos.distrito, filters.distrito));
      }
      if (filters?.personaId) {
        conditions.push(eq(t.mandatos.personaId, filters.personaId));
      }
      const rows = await getDb()
        .select()
        .from(t.mandatos)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(asc(t.mandatos.inicio), asc(t.mandatos.id));
      return rows.map(mapMandato);
    });
  },

  listDistritos() {
    return withPostgres(async () => {
      const rows = await getDb()
        .selectDistinct({ distrito: t.mandatos.distrito })
        .from(t.mandatos);
      return rows
        .map((r) => r.distrito)
        .sort((a, b) => a.localeCompare(b, "es-AR"))
        .map((nombre) => ({ nombre, slug: slugifyDistrito(nombre) }));
    });
  },

  listAniosDeclaracion() {
    return withPostgres(async () => {
      const rows = await getDb()
        .selectDistinct({ anioFiscal: t.declaraciones.anioFiscal })
        .from(t.declaraciones);
      return rows.map((r) => r.anioFiscal).sort((a, b) => b - a);
    });
  },

  getSeriesMacro(): Promise<SerieMacro[]> {
    return withPostgres(async () => {
      const rows = await getDb().select().from(t.seriesMacro);
      return rows.map((r) => ({
        anio: r.anio,
        ipcIndice: parseAmount(r.ipcIndice),
        usdBcra3500Cierre: parseAmount(r.usdBcra3500Cierre),
      }));
    });
  },
};
