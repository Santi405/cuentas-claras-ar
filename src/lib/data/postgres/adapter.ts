import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  construirEvolucion,
  elegirDeclaracionesVisibles,
  montosSegunTipo,
  toResumen,
  variacionInteranual,
} from "@/lib/domain/calculos";
import { nombreCompleto } from "@/lib/domain/formatters";
import { paginate, PAGE_SIZE_MAX } from "@/lib/domain/pagination";
import { sameDistrito, slugifyDistrito } from "@/lib/domain/slugs";
import { sortLegisladores } from "@/lib/domain/sort";
import type {
  Bien,
  Declaracion,
  DeclaracionDetalle,
  Deuda,
  EstadoLegislador,
  Fuente,
  LegisladorDetalle,
  LegisladorListItem,
  LegisladorSearchParams,
  Mandato,
  Persona,
  SerieMacro,
} from "@/lib/domain/types";
import type { LegisladorRepository } from "@/lib/data/repository";
import { getDb } from "./db";
import * as t from "./schema";

const PAGE_SIZE_DEFAULT = 25;

function num(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

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
    bienesInicio: num(row.bienesInicio),
    bienesCierre: num(row.bienesCierre),
    deudasInicio: num(row.deudasInicio),
    deudasCierre: num(row.deudasCierre),
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

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function mandatoVigente(m: Mandato, today = todayIso()): boolean {
  return m.fin === null || m.fin >= today;
}

function estadoDe(ms: Mandato[]): EstadoLegislador {
  return ms.some((m) => mandatoVigente(m)) ? "en_ejercicio" : "historico";
}

function mandatoActual(ms: Mandato[]): Mandato | null {
  const sorted = [...ms].sort((a, b) => a.inicio.localeCompare(b.inicio));
  return sorted.filter((m) => mandatoVigente(m)).at(-1) ?? sorted.at(-1) ?? null;
}

async function declaracionesPersona(personaId: string): Promise<Declaracion[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(t.declaraciones)
    .where(eq(t.declaraciones.personaId, personaId));
  return rows.map(mapDeclaracion);
}

async function mandatosPersona(personaId: string): Promise<Mandato[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(t.mandatos)
    .where(eq(t.mandatos.personaId, personaId));
  return rows.map(mapMandato).sort((a, b) => a.inicio.localeCompare(b.inicio));
}

async function hydrateDeclaracion(d: Declaracion): Promise<DeclaracionDetalle> {
  const db = getDb();
  const [fuenteRow] = await db.select().from(t.fuentes).where(eq(t.fuentes.id, d.fuenteId));
  if (!fuenteRow) throw new Error(`Fuente no encontrada: ${d.fuenteId}`);
  const bienRows = await db.select().from(t.bienes).where(eq(t.bienes.declaracionId, d.id));
  const deudaRows = await db.select().from(t.deudas).where(eq(t.deudas.declaracionId, d.id));
  const montos = montosSegunTipo(d);
  const bienesItems: Bien[] = bienRows.map((b) => ({
    id: b.id,
    declaracionId: b.declaracionId,
    tipo: b.tipo,
    descripcion: b.descripcion,
    origenFondos: b.origenFondos,
    titularidadPct: b.titularidadPct === null ? null : num(b.titularidadPct),
    importeArs: num(b.importeArs),
  }));
  const deudasItems: Deuda[] = deudaRows.map((x) => ({
    id: x.id,
    declaracionId: x.declaracionId,
    tipo: x.tipo,
    descripcion: x.descripcion,
    radicacion: x.radicacion,
    clasificacion: x.clasificacion,
    importeArs: num(x.importeArs),
  }));
  return {
    ...d,
    fuente: mapFuente(fuenteRow),
    bienesItems,
    deudasItems,
    bienesMostrados: montos.bienes,
    deudasMostradas: montos.deudas,
    neto: montos.neto,
  };
}

async function buildDetalle(persona: Persona): Promise<LegisladorDetalle> {
  const db = getDb();
  const ms = await mandatosPersona(persona.id);
  const visibles = elegirDeclaracionesVisibles(await declaracionesPersona(persona.id));
  const resumenes = visibles.map(toResumen);
  const [cuitRow] = await db
    .select()
    .from(t.identificadoresExternos)
    .where(
      and(
        eq(t.identificadoresExternos.personaId, persona.id),
        eq(t.identificadoresExternos.sistema, "cuit"),
      ),
    );
  return {
    persona: { ...persona, nombreCompleto: nombreCompleto(persona.nombre, persona.apellido) },
    estado: estadoDe(ms),
    mandatos: ms,
    declaraciones: resumenes,
    evolucion: construirEvolucion(resumenes),
    cuit: cuitRow?.valor ?? persona.cuit,
  };
}

export const postgresRepository: LegisladorRepository = {
  mode() {
    return "postgres";
  },

  async searchLegisladores(params: LegisladorSearchParams) {
    const db = getDb();
    const pageSize = Math.min(params.pageSize ?? PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX);
    const page = Math.max(params.page ?? 1, 1);

    const conditions = [];
    if (params.q) {
      const q = `%${params.q}%`;
      conditions.push(
        or(
          ilike(t.personas.apellido, q),
          ilike(t.personas.nombre, q),
          ilike(t.personas.slug, q),
          sql`unaccent(lower(${t.personas.apellido} || ' ' || ${t.personas.nombre})) ilike unaccent(lower(${q}))`,
          sql`unaccent(lower(${t.personas.nombre} || ' ' || ${t.personas.apellido})) ilike unaccent(lower(${q}))`,
          sql`exists (select 1 from mandatos m where m.persona_id = ${t.personas.id} and unaccent(lower(m.distrito)) ilike unaccent(lower(${q})))`,
        ),
      );
    }
    if (params.cuit) {
      conditions.push(eq(t.personas.cuit, params.cuit));
    }

    const personaRows = await db
      .select()
      .from(t.personas)
      .where(conditions.length ? and(...conditions) : undefined);

    const items: LegisladorListItem[] = [];
    for (const row of personaRows) {
      const persona = mapPersona(row);
      const ms = await mandatosPersona(persona.id);
      const actual = mandatoActual(ms);
      const estado = estadoDe(ms);
      if (params.camara && actual?.camara !== params.camara) continue;
      if (params.distrito && !sameDistrito(actual?.distrito, params.distrito)) {
        continue;
      }
      if (params.estado && estado !== params.estado) continue;
      const visibles = elegirDeclaracionesVisibles(await declaracionesPersona(persona.id));
      if (params.anio != null && !visibles.some((d) => d.anioFiscal === params.anio)) {
        continue;
      }
      const resumenes = visibles.map(toResumen);
      const evolucion = construirEvolucion(resumenes);
      const ultima = resumenes.at(-1) ?? null;
      items.push({
        id: persona.id,
        slug: persona.slug,
        nombreCompleto: nombreCompleto(persona.nombre, persona.apellido),
        camaraActual: actual?.camara ?? null,
        distritoActual: actual?.distrito ?? null,
        bloqueActual: actual?.bloque ?? null,
        estado,
        ultimoAnioDeclarado: ultima?.anioFiscal ?? null,
        netoArs: ultima?.neto ?? null,
        variacionNominalPct: ultima
          ? variacionInteranual(evolucion, ultima.anioFiscal)
          : null,
      });
    }

    return paginate(sortLegisladores(items, params.sort), page, pageSize);
  },

  async getLegisladorBySlug(slug: string) {
    const db = getDb();
    const [row] = await db.select().from(t.personas).where(eq(t.personas.slug, slug));
    if (!row) return null;
    return buildDetalle(mapPersona(row));
  },

  async getLegisladorByIdOrSlug(idOrSlug: string) {
    const db = getDb();
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );
    if (isUuid) {
      const [byId] = await db.select().from(t.personas).where(eq(t.personas.id, idOrSlug));
      if (byId) return buildDetalle(mapPersona(byId));
    }
    const [bySlug] = await db.select().from(t.personas).where(eq(t.personas.slug, idOrSlug));
    if (!bySlug) return null;
    return buildDetalle(mapPersona(bySlug));
  },

  async resolveSlugRedirect(slug: string) {
    const db = getDb();
    const [hit] = await db.select().from(t.slugHistory).where(eq(t.slugHistory.slug, slug));
    if (!hit) return null;
    const [persona] = await db.select().from(t.personas).where(eq(t.personas.id, hit.personaId));
    return persona?.slug ?? null;
  },

  async getDeclaracion(personaId: string, anioFiscal: number) {
    const visibles = elegirDeclaracionesVisibles(await declaracionesPersona(personaId));
    const d = visibles.find((x) => x.anioFiscal === anioFiscal);
    if (!d) return null;
    return hydrateDeclaracion(d);
  },

  async listDeclaraciones(personaId: string) {
    const visibles = elegirDeclaracionesVisibles(await declaracionesPersona(personaId));
    return Promise.all(visibles.map(hydrateDeclaracion));
  },

  async listMandatos(filters) {
    const db = getDb();
    const conditions = [];
    if (filters?.camara) conditions.push(eq(t.mandatos.camara, filters.camara));
    if (filters?.distrito) conditions.push(eq(t.mandatos.distrito, filters.distrito));
    if (filters?.personaId) conditions.push(eq(t.mandatos.personaId, filters.personaId));
    const rows = await db
      .select()
      .from(t.mandatos)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(t.mandatos.inicio));
    return rows.map(mapMandato);
  },

  async listDistritos() {
    const db = getDb();
    const rows = await db
      .selectDistinct({ distrito: t.mandatos.distrito })
      .from(t.mandatos);
    return rows
      .map((r) => r.distrito)
      .sort((a, b) => a.localeCompare(b, "es-AR"))
      .map((nombre) => ({ nombre, slug: slugifyDistrito(nombre) }));
  },

  async listAniosDeclaracion() {
    const db = getDb();
    const rows = await db
      .selectDistinct({ anioFiscal: t.declaraciones.anioFiscal })
      .from(t.declaraciones);
    return rows.map((r) => r.anioFiscal).sort((a, b) => b - a);
  },

  async getSeriesMacro(): Promise<SerieMacro[]> {
    const db = getDb();
    const rows = await db.select().from(t.seriesMacro);
    return rows.map((r) => ({
      anio: r.anio,
      ipcIndice: num(r.ipcIndice),
      usdBcra3500Cierre: num(r.usdBcra3500Cierre),
    }));
  },
};
