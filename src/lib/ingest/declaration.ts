import type { TipoDeclaracion } from "@/lib/domain/types";
import { parseCuit } from "./cuit";
import { issue, type Issue } from "./issues";
import { moneyEquals, parseMoney } from "./money";

export type DeclarationIdentity = {
  sourceDjId: string | null;
  anio: number | null;
  tipo: TipoDeclaracion | null;
  tipoIdRaw: string;
  tipoDescripcionRaw: string;
  rectificativa: number | null;
  cuitRaw: string;
  cuitCanonical: string | null;
};

const TIPO_BY_DESCRIPCION: Record<string, TipoDeclaracion> = {
  anual: "anual",
  inicial: "inicial",
  alta: "inicial",
  baja: "baja",
  cese: "baja",
};

/**
 * Metadata OA documents tipo_id 0=inicial, 1=baja, 2=anual.
 * The 2024 CSV contradicts that: 0=Inicial, 1=Anual, 2=Baja.
 * Trust the description when it is a known label.
 */
export function tipoFromSource(
  tipoIdRaw: string,
  tipoDescripcionRaw: string,
): { tipo: TipoDeclaracion | null; issues: Issue[] } {
  const issues: Issue[] = [];
  const desc = tipoDescripcionRaw.trim().toLowerCase();
  const tipo = TIPO_BY_DESCRIPCION[desc] ?? null;
  const id = tipoIdRaw.trim();

  if (!tipo) {
    issues.push(
      issue(
        "ERROR",
        "tipo_desconocido",
        `tipo_declaracion_jurada_descripcion no reconocida: ${tipoDescripcionRaw}`,
        { column: "tipo_declaracion_jurada_descripcion" },
      ),
    );
  }

  const metadataMap: Record<string, TipoDeclaracion> = {
    "0": "inicial",
    "1": "baja",
    "2": "anual",
  };
  const observed2024Map: Record<string, TipoDeclaracion> = {
    "0": "inicial",
    "1": "anual",
    "2": "baja",
  };
  if (tipo && metadataMap[id] && metadataMap[id] !== tipo) {
    issues.push(
      issue(
        "INFO",
        "tipo_id_no_sigue_metadata",
        `tipo_id=${id} (${observed2024Map[id] ?? "desconocido"} observado en 2024) vs metadata OA (0 inicial / 1 baja / 2 anual). Se usa la descripción.`,
        { column: "tipo_declaracion_jurada_id" },
      ),
    );
  }
  return { tipo, issues };
}

export function parseAnio(raw: string): { anio: number | null; issues: Issue[] } {
  const v = raw.trim();
  if (!/^\d{4}$/.test(v)) {
    return {
      anio: null,
      issues: [
        issue("ERROR", "anio_invalido", `año fiscal no parseable: ${raw}`, {
          column: "anio",
        }),
      ],
    };
  }
  const anio = Number(v);
  if (anio < 1990 || anio > 2100) {
    return {
      anio: null,
      issues: [
        issue("ERROR", "anio_fuera_de_rango", `año fiscal fuera de rango: ${v}`, {
          column: "anio",
        }),
      ],
    };
  }
  return { anio, issues: [] };
}

export function parseRectificativa(raw: string): {
  rectificativa: number | null;
  issues: Issue[];
} {
  const v = raw.trim();
  if (v === "") {
    return {
      rectificativa: null,
      issues: [
        issue("ERROR", "rectificativa_ausente", "rectificativa vacía", {
          column: "rectificativa",
        }),
      ],
    };
  }
  if (!/^\d+$/.test(v)) {
    return {
      rectificativa: null,
      issues: [
        issue(
          "ERROR",
          "rectificativa_malformada",
          `rectificativa no es un entero: ${raw}`,
          { column: "rectificativa" },
        ),
      ],
    };
  }
  return { rectificativa: Number(v), issues: [] };
}

export function parseDjId(raw: string): { djId: string | null; issues: Issue[] } {
  const v = raw.trim();
  if (v === "") {
    return {
      djId: null,
      issues: [
        issue("ERROR", "dj_id_ausente", "dj_id vacío", { column: "dj_id" }),
      ],
    };
  }
  if (!/^\d+$/.test(v)) {
    return {
      djId: null,
      issues: [
        issue("ERROR", "dj_id_invalido", `dj_id no es un entero: ${raw}`, {
          column: "dj_id",
        }),
      ],
    };
  }
  return { djId: v, issues: [] };
}

export function identityFromRow(row: Record<string, string>): {
  identity: DeclarationIdentity;
  issues: Issue[];
} {
  const issues: Issue[] = [];
  const dj = parseDjId(row.dj_id ?? "");
  issues.push(...dj.issues);
  const anio = parseAnio(row.anio ?? "");
  issues.push(...anio.issues);
  const rect = parseRectificativa(row.rectificativa ?? "");
  issues.push(...rect.issues);
  const tipo = tipoFromSource(
    row.tipo_declaracion_jurada_id ?? "",
    row.tipo_declaracion_jurada_descripcion ?? "",
  );
  issues.push(...tipo.issues);
  const cuitRaw = (row.cuit ?? "").trim();
  const cuit = parseCuit(cuitRaw === "" ? "" : cuitRaw);
  if (!cuit.ok && cuit.reason !== "empty") {
    issues.push(
      issue("WARNING", `cuit_${cuit.reason}`, `CUIT no válido para matching: ${cuitRaw}`, {
        column: "cuit",
      }),
    );
  }
  return {
    identity: {
      sourceDjId: dj.djId,
      anio: anio.anio,
      tipo: tipo.tipo,
      tipoIdRaw: row.tipo_declaracion_jurada_id ?? "",
      tipoDescripcionRaw: row.tipo_declaracion_jurada_descripcion ?? "",
      rectificativa: rect.rectificativa,
      cuitRaw,
      cuitCanonical: cuit.ok ? cuit.canonical : null,
    },
    issues,
  };
}

export type SerializationDup =
  | { kind: "equivalent"; keepIndex: number; dropIndex: number }
  | { kind: "conflict"; indexA: number; indexB: number };

/**
 * 2024 consolidado repeats some dj_id with hyphen vs dot money encodings.
 * Some pairs are equivalent; some (especially `-00` vs a dotted value) are not.
 * Never pick a row silently when the normalized amounts differ.
 */
export function compareSerializationPair(
  rowA: Record<string, string>,
  rowB: Record<string, string>,
  amountColumns: string[],
): SerializationDup {
  let allEqual = true;
  for (const col of amountColumns) {
    const a = parseMoney(rowA[col] ?? "");
    const b = parseMoney(rowB[col] ?? "");
    if (!a.ok || !b.ok || !moneyEquals(a.canonical, b.canonical)) {
      allEqual = false;
      break;
    }
  }
  if (allEqual) {
    return { kind: "equivalent", keepIndex: 0, dropIndex: 1 };
  }
  return { kind: "conflict", indexA: 0, indexB: 1 };
}

export const CONSOLIDADO_AMOUNT_COLUMNS = [
  "total_bienes_inicio",
  "deudas_inicio",
  "total_bienes_final",
  "total_deudas_final",
] as const;
