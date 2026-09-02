import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { parseCsv } from "./csv";
import {
  isGrupoFamiliarResource,
  hasFamiliarColumns,
  looksLikeLegisladorNacional,
  normalizeNombre,
  padCuit,
} from "./matching";
import {
  djpiBienSchema,
  djpiConsolidadoSchema,
  djpiDeudaSchema,
} from "./schemas";
import type { Persona } from "@/lib/domain/types";

export type IngestPersonaIndex = {
  byCuit: Map<string, Persona>;
  byNombre: Map<string, Persona[]>;
};

export type ReviewItem = {
  reason: string;
  djId: number | null;
  nombre: string;
  cuit: string | null;
  organismo: string;
  cargo: string;
};

export type IngestResult = {
  skippedFiles: string[];
  skippedRows: number;
  acceptedRows: number;
  review: ReviewItem[];
  declaraciones: Array<{
    sourceDjId: number;
    personaId: string;
    anioFiscal: number;
    tipo: "inicial" | "anual" | "baja";
    rectificativa: number;
    organismoDeclarado: string;
    cargoDeclarado: string;
    bienesInicio: number;
    bienesCierre: number;
    deudasInicio: number;
    deudasCierre: number;
    archivo: string;
    archivoHash: string;
  }>;
  bienes: Array<{
    sourceDjId: number;
    tipo: string;
    descripcion: string;
    origenFondos: string;
    titularidadPct: number | null;
    importeArs: number;
  }>;
  deudas: Array<{
    sourceDjId: number;
    tipo: string;
    descripcion: string;
    radicacion: string;
    clasificacion: string;
    importeArs: number;
  }>;
};

function tipoFromDescripcion(value: string | undefined): "inicial" | "anual" | "baja" {
  const v = (value ?? "").toLowerCase();
  if (v.includes("inicial") || v.includes("alta")) return "inicial";
  if (v.includes("baja") || v.includes("cese")) return "baja";
  return "anual";
}

export function buildPersonaIndex(personas: Persona[]): IngestPersonaIndex {
  const byCuit = new Map<string, Persona>();
  const byNombre = new Map<string, Persona[]>();
  for (const p of personas) {
    if (p.cuit) byCuit.set(p.cuit, p);
    const key = normalizeNombre(`${p.apellido} ${p.nombre}`);
    const inverted = normalizeNombre(`${p.nombre} ${p.apellido}`);
    const comma = normalizeNombre(`${p.apellido}, ${p.nombre}`);
    for (const k of [key, inverted, comma]) {
      const list = byNombre.get(k) ?? [];
      if (!list.includes(p)) list.push(p);
      byNombre.set(k, list);
    }
  }
  return { byCuit, byNombre };
}

function matchPersona(
  index: IngestPersonaIndex,
  nombre: string,
  cuit: string | null,
): { persona: Persona | null; reason: string | null } {
  if (cuit && index.byCuit.has(cuit)) {
    return { persona: index.byCuit.get(cuit)!, reason: null };
  }
  const key = normalizeNombre(nombre.replace(",", " "));
  const candidates = index.byNombre.get(key) ?? [];
  if (candidates.length === 1 && !cuit) {
    return {
      persona: null,
      reason: "nombre_sin_cuit",
    };
  }
  if (candidates.length > 1) {
    return { persona: null, reason: "homonimo" };
  }
  if (cuit && !index.byCuit.has(cuit) && candidates.length === 1) {
    return { persona: null, reason: "cuit_nuevo_nombre_conocido" };
  }
  return { persona: null, reason: "sin_match" };
}

export function ingestDjpiFiles(
  files: Array<{ path: string; contents?: string }>,
  index: IngestPersonaIndex,
): IngestResult {
  const result: IngestResult = {
    skippedFiles: [],
    skippedRows: 0,
    acceptedRows: 0,
    review: [],
    declaraciones: [],
    bienes: [],
    deudas: [],
  };

  for (const file of files) {
    const name = basename(file.path);
    if (isGrupoFamiliarResource(name)) {
      result.skippedFiles.push(name);
      continue;
    }
    const contents = file.contents ?? readFileSync(file.path, "utf8");
    const { headers, rows } = parseCsv(contents);
    if (hasFamiliarColumns(headers)) {
      result.skippedFiles.push(name);
      continue;
    }
    const hash = createHash("sha256").update(contents).digest("hex");
    const isBienes = /bienes/i.test(name) || headers.includes("bien_descripcion");
    const isDeudas = /deudas/i.test(name) && headers.includes("deuda_importe");

    if (isBienes) {
      for (const row of rows) {
        const parsed = djpiBienSchema.safeParse(row);
        if (!parsed.success) {
          result.skippedRows += 1;
          continue;
        }
        const titularidad = Number(
          String(parsed.data.bien_titularidad).replace(/[^\d.,]/g, "").replace(",", "."),
        );
        result.bienes.push({
          sourceDjId: parsed.data.dj_id,
          tipo: parsed.data.bien_tipo,
          descripcion: parsed.data.bien_descripcion,
          origenFondos: parsed.data.bien_origen_fondos,
          titularidadPct: Number.isFinite(titularidad) ? titularidad : null,
          importeArs: Number(String(parsed.data.bien_importe).replace(",", ".")) || 0,
        });
      }
      continue;
    }

    if (isDeudas) {
      for (const row of rows) {
        const parsed = djpiDeudaSchema.safeParse(row);
        if (!parsed.success) {
          result.skippedRows += 1;
          continue;
        }
        result.deudas.push({
          sourceDjId: parsed.data.dj_id,
          tipo: parsed.data.deuda_tipo,
          descripcion: parsed.data.deuda_descripcion,
          radicacion: parsed.data.deuda_radicacion_localizacion,
          clasificacion: parsed.data.deuda_clasificacion,
          importeArs: parsed.data.deuda_importe,
        });
      }
      continue;
    }

    for (const row of rows) {
      const parsed = djpiConsolidadoSchema.safeParse(row);
      if (!parsed.success) {
        result.skippedRows += 1;
        continue;
      }
      const d = parsed.data;
      if (!looksLikeLegisladorNacional(d.organismo, d.cargo)) {
        result.skippedRows += 1;
        continue;
      }
      const cuit = padCuit(d.cuit);
      const matched = matchPersona(index, d.funcionario_apellido_nombre, cuit);
      if (!matched.persona) {
        result.review.push({
          reason: matched.reason ?? "sin_match",
          djId: d.dj_id,
          nombre: d.funcionario_apellido_nombre,
          cuit,
          organismo: d.organismo,
          cargo: d.cargo,
        });
        continue;
      }
      result.acceptedRows += 1;
      result.declaraciones.push({
        sourceDjId: d.dj_id,
        personaId: matched.persona.id,
        anioFiscal: d.anio,
        tipo: tipoFromDescripcion(d.tipo_declaracion_jurada_descripcion),
        rectificativa: d.rectificativa ?? 0,
        organismoDeclarado: d.organismo,
        cargoDeclarado: d.cargo,
        bienesInicio: d.total_bienes_inicio,
        bienesCierre: d.total_bienes_final,
        deudasInicio: d.deudas_inicio,
        deudasCierre: d.total_deudas_final,
        archivo: name,
        archivoHash: hash,
      });
    }
  }

  return result;
}

export function newReviewId(): string {
  return randomUUID();
}
