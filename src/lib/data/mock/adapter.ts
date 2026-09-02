import {
  construirEvolucion,
  elegirDeclaracionesVisibles,
  montosSegunTipo,
  toResumen,
  variacionInteranual,
} from "@/lib/domain/calculos";
import { nombreCompleto } from "@/lib/domain/formatters";
import { normalizeSearch } from "@/lib/domain/slugs";
import type {
  Bien,
  Declaracion,
  DeclaracionDetalle,
  Deuda,
  EstadoLegislador,
  Fuente,
  IdentificadorExterno,
  LegisladorDetalle,
  LegisladorListItem,
  LegisladorSearchParams,
  Mandato,
  Paginated,
  Persona,
  SerieMacro,
  SlugRedirect,
} from "@/lib/domain/types";
import type { LegisladorRepository } from "@/lib/data/repository";
import bienesJson from "./bienes.json";
import declaracionesJson from "./declaraciones.json";
import deudasJson from "./deudas.json";
import fuentesJson from "./fuentes.json";
import identificadoresJson from "./identificadores.json";
import mandatosJson from "./mandatos.json";
import personasJson from "./personas.json";
import seriesJson from "./series-macro.json";
import slugRedirectsJson from "./slug-redirects.json";

const personas = personasJson as Persona[];
const mandatos = mandatosJson as Mandato[];
const declaraciones = declaracionesJson as Declaracion[];
const bienes = bienesJson as Bien[];
const deudasItems = deudasJson as Deuda[];
const fuentes = fuentesJson as Fuente[];
const identificadores = identificadoresJson as IdentificadorExterno[];
const seriesMacro = seriesJson as SerieMacro[];
const slugRedirects = slugRedirectsJson as SlugRedirect[];

const PAGE_SIZE_DEFAULT = 25;
const PAGE_SIZE_MAX = 100;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function mandatoVigente(m: Mandato, today = todayIso()): boolean {
  return m.fin === null || m.fin >= today;
}

function estadoDe(personaId: string): EstadoLegislador {
  return mandatos.some((m) => m.personaId === personaId && mandatoVigente(m))
    ? "en_ejercicio"
    : "historico";
}

function mandatosDe(personaId: string): Mandato[] {
  return mandatos
    .filter((m) => m.personaId === personaId)
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
}

function mandatoActual(personaId: string): Mandato | null {
  const list = mandatosDe(personaId);
  return list.filter((m) => mandatoVigente(m)).at(-1) ?? list.at(-1) ?? null;
}

function declaracionesDe(personaId: string): Declaracion[] {
  return declaraciones.filter((d) => d.personaId === personaId);
}

function toListItem(persona: Persona): LegisladorListItem {
  const actual = mandatoActual(persona.id);
  const visibles = elegirDeclaracionesVisibles(declaracionesDe(persona.id));
  const resumenes = visibles.map(toResumen);
  const evolucion = construirEvolucion(resumenes);
  const ultima = resumenes.at(-1) ?? null;
  return {
    id: persona.id,
    slug: persona.slug,
    nombreCompleto: nombreCompleto(persona.nombre, persona.apellido),
    camaraActual: actual?.camara ?? null,
    distritoActual: actual?.distrito ?? null,
    bloqueActual: actual?.bloque ?? null,
    estado: estadoDe(persona.id),
    ultimoAnioDeclarado: ultima?.anioFiscal ?? null,
    netoArs: ultima?.neto ?? null,
    variacionNominalPct: ultima
      ? variacionInteranual(evolucion, ultima.anioFiscal)
      : null,
  };
}

function matchesSearch(persona: Persona, q?: string): boolean {
  if (!q) return true;
  const needle = normalizeSearch(q);
  const haystack = normalizeSearch(
    `${persona.apellido} ${persona.nombre} ${persona.slug}`,
  );
  return haystack.includes(needle);
}

function buildDetalle(persona: Persona): LegisladorDetalle {
  const visibles = elegirDeclaracionesVisibles(declaracionesDe(persona.id));
  const resumenes = visibles.map(toResumen);
  const cuit =
    identificadores.find(
      (i) => i.personaId === persona.id && i.sistema === "cuit",
    )?.valor ?? persona.cuit;
  return {
    persona: {
      ...persona,
      nombreCompleto: nombreCompleto(persona.nombre, persona.apellido),
    },
    estado: estadoDe(persona.id),
    mandatos: mandatosDe(persona.id),
    declaraciones: resumenes,
    evolucion: construirEvolucion(resumenes),
    cuit,
  };
}

function hydrateDeclaracion(d: Declaracion): DeclaracionDetalle {
  const fuente = fuentes.find((f) => f.id === d.fuenteId);
  if (!fuente) {
    throw new Error(`Fuente no encontrada: ${d.fuenteId}`);
  }
  const montos = montosSegunTipo(d);
  return {
    ...d,
    fuente,
    bienesItems: bienes.filter((b) => b.declaracionId === d.id),
    deudasItems: deudasItems.filter((x) => x.declaracionId === d.id),
    bienesMostrados: montos.bienes,
    deudasMostradas: montos.deudas,
    neto: montos.neto,
  };
}

function paginate<T>(items: T[], page: number, pageSize: number): Paginated<T> {
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    meta: { page, pageSize, total: items.length },
  };
}

export const mockRepository: LegisladorRepository = {
  mode() {
    return "mock";
  },

  async searchLegisladores(params: LegisladorSearchParams) {
    const pageSize = Math.min(params.pageSize ?? PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX);
    const page = Math.max(params.page ?? 1, 1);
    let items = personas.map(toListItem).filter((item) => {
      const persona = personas.find((p) => p.id === item.id)!;
      if (params.cuit && persona.cuit !== params.cuit) return false;
      if (!matchesSearch(persona, params.q)) return false;
      if (params.camara && item.camaraActual !== params.camara) return false;
      if (params.distrito && item.distritoActual !== params.distrito) return false;
      if (params.estado && item.estado !== params.estado) return false;
      if (params.anio && item.ultimoAnioDeclarado !== params.anio) {
        const years = elegirDeclaracionesVisibles(declaracionesDe(item.id)).map(
          (d) => d.anioFiscal,
        );
        if (!years.includes(params.anio)) return false;
      }
      return true;
    });

    const sort = params.sort ?? "nombre";
    const dir = sort.startsWith("-") ? -1 : 1;
    const key = sort.replace("-", "") as "nombre" | "neto" | "anio";
    items = [...items].sort((a, b) => {
      let cmp = 0;
      if (key === "nombre") cmp = a.nombreCompleto.localeCompare(b.nombreCompleto, "es-AR");
      if (key === "neto") cmp = (a.netoArs ?? -Infinity) - (b.netoArs ?? -Infinity);
      if (key === "anio") {
        cmp = (a.ultimoAnioDeclarado ?? 0) - (b.ultimoAnioDeclarado ?? 0);
      }
      return cmp * dir;
    });

    return paginate(items, page, pageSize);
  },

  async getLegisladorBySlug(slug: string) {
    const persona = personas.find((p) => p.slug === slug);
    if (!persona) return null;
    return buildDetalle(persona);
  },

  async getLegisladorByIdOrSlug(idOrSlug: string) {
    const persona = personas.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    if (!persona) return null;
    return buildDetalle(persona);
  },

  async resolveSlugRedirect(slug: string) {
    const hit = slugRedirects.find((s) => s.slug === slug);
    if (!hit) return null;
    return personas.find((p) => p.id === hit.personaId)?.slug ?? null;
  },

  async getDeclaracion(personaId: string, anioFiscal: number) {
    const visibles = elegirDeclaracionesVisibles(declaracionesDe(personaId));
    const d = visibles.find((x) => x.anioFiscal === anioFiscal);
    if (!d) return null;
    return hydrateDeclaracion(d);
  },

  async listDeclaraciones(personaId: string) {
    return elegirDeclaracionesVisibles(declaracionesDe(personaId)).map(hydrateDeclaracion);
  },

  async listMandatos(filters) {
    return mandatos.filter((m) => {
      if (filters?.camara && m.camara !== filters.camara) return false;
      if (filters?.distrito && m.distrito !== filters.distrito) return false;
      if (filters?.personaId && m.personaId !== filters.personaId) return false;
      return true;
    });
  },

  async listDistritos() {
    return [...new Set(mandatos.map((m) => m.distrito))].sort((a, b) =>
      a.localeCompare(b, "es-AR"),
    );
  },

  async getSeriesMacro() {
    return seriesMacro;
  },
};
