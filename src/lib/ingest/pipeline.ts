import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { parseCsv } from "./csv";
import { parseCuit } from "./cuit";
import { identityFromRow } from "./declaration";
import {
  hasFamiliarColumns,
  isGrupoFamiliarResource,
  normalizeNombre,
} from "./matching";
import { decideMatch } from "./matching-rules";
import { moneyToCents, parseMoney } from "./money";
import { interpretBienImporte } from "./ownership";
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

function amountOrSkip(raw: string): number | null {
  const parsed = parseMoney(raw);
  if (!parsed.ok) return null;
  const cents = moneyToCents(parsed.canonical);
  if (cents === null) return null;
  const asNumber = Number(parsed.canonical);
  return Number.isFinite(asNumber) ? asNumber : null;
}

export function buildPersonaIndex(personas: Persona[]): IngestPersonaIndex {
  const byCuit = new Map<string, Persona>();
  const byNombre = new Map<string, Persona[]>();
  for (const p of personas) {
    const parsed = parseCuit(p.cuit);
    if (parsed.ok) byCuit.set(parsed.canonical, p);
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
        const interpreted = interpretBienImporte(
          parsed.data.bien_importe,
          parsed.data.bien_titularidad,
        );
        if (!interpreted.importeParse.ok || interpreted.importeCanonical === null) {
          result.skippedRows += 1;
          continue;
        }
        const cents = moneyToCents(interpreted.importeCanonical);
        if (cents === null) {
          result.skippedRows += 1;
          continue;
        }
        const titularidad = parseMoney(parsed.data.bien_titularidad);
        const djId = Number(parsed.data.dj_id);
        if (!Number.isInteger(djId)) {
          result.skippedRows += 1;
          continue;
        }
        const importeArs = Number(interpreted.importeCanonical);
        if (!Number.isFinite(importeArs)) {
          result.skippedRows += 1;
          continue;
        }
        result.bienes.push({
          sourceDjId: djId,
          tipo: parsed.data.bien_tipo,
          descripcion: parsed.data.bien_descripcion,
          origenFondos: parsed.data.bien_origen_fondos,
          titularidadPct: titularidad.ok ? Number(titularidad.canonical) : null,
          importeArs,
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
        const importe = amountOrSkip(parsed.data.deuda_importe);
        const djId = Number(parsed.data.dj_id);
        if (importe === null || !Number.isInteger(djId)) {
          result.skippedRows += 1;
          continue;
        }
        result.deudas.push({
          sourceDjId: djId,
          tipo: parsed.data.deuda_tipo,
          descripcion: parsed.data.deuda_descripcion,
          radicacion: parsed.data.deuda_radicacion_localizacion,
          clasificacion: parsed.data.deuda_clasificacion,
          importeArs: importe,
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
      const identity = identityFromRow({
        ...row,
        dj_id: d.dj_id,
        anio: d.anio,
        rectificativa: d.rectificativa ?? "",
        tipo_declaracion_jurada_id: d.tipo_declaracion_jurada_id ?? "",
        tipo_declaracion_jurada_descripcion: d.tipo_declaracion_jurada_descripcion ?? "",
        cuit: d.cuit === undefined ? "" : String(d.cuit),
      });
      if (
        identity.identity.sourceDjId === null ||
        identity.identity.anio === null ||
        identity.identity.tipo === null ||
        identity.identity.rectificativa === null
      ) {
        result.skippedRows += 1;
        continue;
      }
      const bienesInicio = amountOrSkip(d.total_bienes_inicio);
      const bienesCierre = amountOrSkip(d.total_bienes_final);
      const deudasInicio = amountOrSkip(d.deudas_inicio);
      const deudasCierre = amountOrSkip(d.total_deudas_final);
      if (
        bienesInicio === null ||
        bienesCierre === null ||
        deudasInicio === null ||
        deudasCierre === null
      ) {
        result.skippedRows += 1;
        continue;
      }

      const nameKey = normalizeNombre(d.funcionario_apellido_nombre.replace(",", " "));
      const parsedCuit = parseCuit(d.cuit);
      const existing = parsedCuit.ok ? (index.byCuit.get(parsedCuit.canonical) ?? null) : null;
      const decision = decideMatch({
        funcionarioApellidoNombre: d.funcionario_apellido_nombre,
        organismo: d.organismo,
        cargo: d.cargo,
        cuitRaw: d.cuit,
        existingByCuit: existing,
        nameCandidates: index.byNombre.get(nameKey) ?? [],
      });
      if (decision.action === "skip") {
        result.skippedRows += 1;
        continue;
      }
      if (decision.action === "review" || !decision.personId) {
        result.review.push({
          reason: decision.reason,
          djId: Number(identity.identity.sourceDjId),
          nombre: d.funcionario_apellido_nombre,
          cuit: decision.cuitCanonical ?? (parsedCuit.ok ? parsedCuit.canonical : null),
          organismo: d.organismo,
          cargo: d.cargo,
        });
        continue;
      }
      result.acceptedRows += 1;
      result.declaraciones.push({
        sourceDjId: Number(identity.identity.sourceDjId),
        personaId: decision.personId,
        anioFiscal: identity.identity.anio,
        tipo: identity.identity.tipo,
        rectificativa: identity.identity.rectificativa,
        organismoDeclarado: d.organismo,
        cargoDeclarado: d.cargo,
        bienesInicio,
        bienesCierre,
        deudasInicio,
        deudasCierre,
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
