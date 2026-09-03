import { createHash } from "node:crypto";
import { createReadStream, realpathSync, statSync } from "node:fs";
import { basename, isAbsolute, resolve } from "node:path";
import { CsvParser, detectDelimiter, rowFromFields, type Delimiter } from "./csv";
import { identityFromRow, parseAnio, parseDjId, parseRectificativa } from "./declaration";
import { issue, type Issue } from "./issues";
import { parseMoney } from "./money";
import {
  detectResourceKind,
  validateHeaders,
  type DjpiResourceKind,
} from "./schema-contract";
import {
  datasetFromFilename,
  fiscalYearFromFilename,
  snapshotId,
  type SnapshotIdentity,
} from "./snapshot";

export const MAX_INSPECT_BYTES = 600 * 1024 * 1024;
const DISTINCT_CAP = 5_000;
const SAMPLE_ROWS = 3;
const PEEK_BYTES = 64 * 1024;

const IDENTITY_DISTINCT_COLUMNS = [
  "dj_id",
  "cuit",
  "anio",
  "tipo_declaracion_jurada_id",
  "tipo_declaracion_jurada_descripcion",
  "rectificativa",
  "funcionario_apellido_nombre",
  "periodo_inicio_cierre",
  "organismo",
  "cargo",
] as const;

const MONEY_COLUMNS = [
  "total_bienes_inicio",
  "deudas_inicio",
  "total_bienes_final",
  "total_deudas_final",
  "bien_importe",
  "deuda_importe",
  "bien_titularidad",
] as const;

export type ColumnStats = {
  name: string;
  empty: number;
  guessedType: string;
  distinct: number | "capped";
};

export type InspectReport = {
  source: string;
  filename: string;
  path: string;
  snapshot: SnapshotIdentity;
  snapshotKey: string;
  encoding: string;
  delimiter: Delimiter;
  byteSize: number;
  sha256: string;
  rows: number;
  columns: string[];
  kind: DjpiResourceKind;
  excluded: boolean;
  issues: Issue[];
  columnStats: ColumnStats[];
  sampleRows: Record<string, string>[];
  fieldCountMismatches: number;
  fieldsTooLong: number;
};

function guessType(values: { empty: number; hyphen: number; dot: number; int: number; other: number; total: number }): string {
  if (values.total === 0) return "empty";
  if (values.empty === values.total) return "empty";
  if (values.hyphen > 0 && values.dot > 0) return "mixed_money";
  if (values.hyphen + values.empty === values.total) return "hyphen_decimal";
  if (values.dot + values.empty === values.total) return "dot_decimal";
  if (values.int + values.empty === values.total) return "integer";
  return "string";
}

function detectEncoding(peek: Buffer): { encoding: "utf-8" | "latin1"; bom: boolean; warning?: Issue } {
  if (peek.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]))) {
    return { encoding: "utf-8", bom: true };
  }
  const slice = peek.subarray(0, Math.max(0, peek.length - 3));
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(slice);
    return { encoding: "utf-8", bom: false };
  } catch {
    return {
      encoding: "latin1",
      bom: false,
      warning: issue(
        "WARNING",
        "encoding_latin1",
        "El archivo no es UTF-8 válido; se inspecciona como latin1",
      ),
    };
  }
}

function firstLine(text: string): string {
  const nl = text.search(/\r?\n/);
  return nl === -1 ? text : text.slice(0, nl);
}

export function assertSafeInspectPath(inputPath: string, cwd = process.cwd()): string {
  if (!inputPath || inputPath.includes("\0")) {
    throw new Error("Ruta de archivo inválida");
  }
  if (/^https?:\/\//i.test(inputPath)) {
    throw new Error("ingest:inspect solo lee archivos locales; no descarga URLs");
  }
  const resolved = isAbsolute(inputPath) ? inputPath : resolve(cwd, inputPath);
  let real: string;
  try {
    real = realpathSync(resolved);
  } catch {
    throw new Error(`El archivo no existe: ${resolved}`);
  }
  const stat = statSync(real);
  if (!stat.isFile()) {
    throw new Error(`No es un archivo regular: ${real}`);
  }
  if (stat.size === 0) {
    throw new Error("El archivo está vacío");
  }
  if (stat.size > MAX_INSPECT_BYTES) {
    throw new Error(
      `Archivo demasiado grande (${stat.size} bytes). Límite de inspección: ${MAX_INSPECT_BYTES}`,
    );
  }
  return real;
}

export async function inspectLocalFile(
  inputPath: string,
  options?: { retrievedAt?: string; cwd?: string },
): Promise<InspectReport> {
  const path = assertSafeInspectPath(inputPath, options?.cwd);
  const filename = basename(path);
  const stat = statSync(path);
  const retrievedAt = options?.retrievedAt ?? new Date().toISOString();

  const peekFd = createReadStream(path, { start: 0, end: PEEK_BYTES - 1 });
  const peekChunks: Buffer[] = [];
  for await (const chunk of peekFd) {
    peekChunks.push(chunk as Buffer);
  }
  const peek = Buffer.concat(peekChunks);
  const enc = detectEncoding(peek);
  const peekText =
    enc.encoding === "utf-8"
      ? peek.subarray(enc.bom ? 3 : 0).toString("utf8")
      : peek.toString("latin1");
  const headerLine = firstLine(peekText);
  const delimiter = detectDelimiter(headerLine);
  const headerOnly = new CsvParser(delimiter);
  const headerPush = headerOnly.push(`${headerLine}\n`);
  const headerFields = headerPush.rows[0] ?? headerOnly.flush()[0] ?? [];
  const headers = headerFields.map((h) => h.trim());

  const issues: Issue[] = [...(enc.warning ? [enc.warning] : [])];
  const headerCheck = validateHeaders(filename, headers);
  issues.push(...headerCheck.issues);
  const excluded = headerCheck.excluded;
  const kind = headerCheck.kind === "grupo_familiar"
    ? "grupo_familiar"
    : detectResourceKind(filename, headers);

  const hash = createHash("sha256");
  const parser = new CsvParser(delimiter);
  let rows = 0;
  let fieldCountMismatches = 0;
  let fieldsTooLong = 0;
  const emptyCounts = new Map<string, number>();
  const typeCounters = new Map<
    string,
    { empty: number; hyphen: number; dot: number; int: number; other: number; total: number }
  >();
  const distinct = new Map<string, Set<string>>();
  const sampleRows: Record<string, string>[] = [];

  for (const h of headers) {
    emptyCounts.set(h, 0);
    typeCounters.set(h, { empty: 0, hyphen: 0, dot: 0, int: 0, other: 0, total: 0 });
    if ((IDENTITY_DISTINCT_COLUMNS as readonly string[]).includes(h)) {
      distinct.set(h, new Set());
    }
  }

  const stream = createReadStream(path);

  const decoder =
    enc.encoding === "utf-8"
      ? new TextDecoder("utf-8")
      : new TextDecoder("latin1");
  let skipBom = enc.bom;
  let skippedHeader = false;

  const consumeRows = (rawRows: string[][], tooLong: boolean) => {
    if (tooLong) fieldsTooLong += 1;
    for (const cols of rawRows) {
      if (!skippedHeader) {
        skippedHeader = true;
        continue;
      }
      rows += 1;
      if (cols.length !== headers.length) {
        fieldCountMismatches += 1;
        issues.push(
          issue(
            "ERROR",
            "campos_por_fila",
            `Fila ${rows} tiene ${cols.length} campos; el encabezado tiene ${headers.length}`,
            { row: rows },
          ),
        );
        continue;
      }
      const rec = rowFromFields(headers, cols);
      if (!excluded && sampleRows.length < SAMPLE_ROWS) {
        sampleRows.push(truncateRow(rec));
      }
      if (excluded) continue;

      const identity = identityFromRow(rec);
      for (const item of identity.issues) {
        if (item.level === "ERROR" && rows <= 20) {
          issues.push({ ...item, row: rows });
        }
      }

      for (const h of headers) {
        const raw = rec[h] ?? "";
        const trimmed = raw.trim();
        const counter = typeCounters.get(h)!;
        counter.total += 1;
        if (trimmed === "") {
          emptyCounts.set(h, (emptyCounts.get(h) ?? 0) + 1);
          counter.empty += 1;
        } else if ((MONEY_COLUMNS as readonly string[]).includes(h)) {
          const parsed = parseMoney(trimmed);
          if (!parsed.ok) {
            counter.other += 1;
            if (rows <= 20) {
              issues.push(
                issue("ERROR", "importe_invalido", `No se pudo parsear ${h}: ${trimmed}`, {
                  row: rows,
                  column: h,
                }),
              );
            }
          } else if (parsed.format === "hyphen_decimal" || parsed.format === "hyphen_zero") {
            counter.hyphen += 1;
            if (parsed.warning) {
              issues.push(
                issue("WARNING", parsed.warning, `Importe ${h} con formato ambiguo ${trimmed}`, {
                  row: rows,
                  column: h,
                }),
              );
            }
          } else if (parsed.format === "dot_decimal") {
            counter.dot += 1;
          } else {
            counter.int += 1;
          }
        } else if (/^-?\d+$/.test(trimmed)) {
          counter.int += 1;
        } else {
          counter.other += 1;
        }
        const set = distinct.get(h);
        if (set && set.size <= DISTINCT_CAP) {
          set.add(trimmed);
        }
      }

      if (kind === "consolidado" || kind === "bienes" || kind === "deudas") {
        const anio = parseAnio(rec.anio ?? "");
        const dj = parseDjId(rec.dj_id ?? "");
        const rect = parseRectificativa(rec.rectificativa ?? "");
        if (anio.anio === null && rows <= 5) issues.push(...anio.issues.map((i) => ({ ...i, row: rows })));
        if (dj.djId === null && rows <= 5) issues.push(...dj.issues.map((i) => ({ ...i, row: rows })));
        if (rect.rectificativa === null && rows <= 5) {
          issues.push(...rect.issues.map((i) => ({ ...i, row: rows })));
        }
      }
    }
  };

  for await (const chunk of stream) {
    let buf = chunk as Buffer;
    hash.update(buf);
    if (skipBom && buf.length >= 3) {
      if (buf.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]))) {
        buf = buf.subarray(3);
      }
      skipBom = false;
    }
    const text = decoder.decode(buf, { stream: true });
    const pushed = parser.push(text);
    consumeRows(pushed.rows, pushed.fieldTooLong);
  }
  const tail = decoder.decode();
  if (tail) {
    const pushed = parser.push(tail);
    consumeRows(pushed.rows, pushed.fieldTooLong);
  }
  consumeRows(parser.flush(), false);

  if (!skippedHeader) {
    issues.push(issue("ERROR", "sin_encabezado", "No se pudo leer el encabezado"));
  }
  if (rows === 0 && !excluded) {
    issues.push(issue("WARNING", "sin_filas", "El CSV no tiene filas de datos"));
  }
  if (fieldCountMismatches > 20) {
    issues.push(
      issue(
        "WARNING",
        "demasiados_desfases",
        `${fieldCountMismatches} filas con cantidad de campos distinta del encabezado`,
      ),
    );
  }

  const sha256 = hash.digest("hex");
  const snapshot: SnapshotIdentity = {
    source: "oficina_anticorrupcion_djpi",
    dataset: datasetFromFilename(filename),
    fiscalYear: fiscalYearFromFilename(filename),
    retrievedAt,
    sourceUrl: null,
    sha256,
    filename,
    byteSize: stat.size,
  };

  const columnStats: ColumnStats[] = headers.map((name) => {
    const counter = typeCounters.get(name) ?? {
      empty: 0,
      hyphen: 0,
      dot: 0,
      int: 0,
      other: 0,
      total: 0,
    };
    const set = distinct.get(name);
    return {
      name,
      empty: emptyCounts.get(name) ?? 0,
      guessedType: guessType(counter),
      distinct: set ? (set.size > DISTINCT_CAP ? "capped" : set.size) : 0,
    };
  });

  return {
    source: snapshot.source,
    filename,
    path,
    snapshot,
    snapshotKey: snapshotId(snapshot),
    encoding: enc.bom ? "utf-8-sig" : enc.encoding,
    delimiter,
    byteSize: stat.size,
    sha256,
    rows,
    columns: headers,
    kind,
    excluded,
    issues: dedupeIssues(issues),
    columnStats,
    sampleRows: excluded ? [] : sampleRows,
    fieldCountMismatches,
    fieldsTooLong,
  };
}

function truncateRow(row: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = v.length > 200 ? `${v.slice(0, 197)}...` : v;
  }
  return out;
}

function dedupeIssues(issues: Issue[]): Issue[] {
  const seen = new Set<string>();
  const out: Issue[] = [];
  for (const item of issues) {
    const key = `${item.level}:${item.code}:${item.column ?? ""}:${item.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function formatInspectReport(report: InspectReport): string {
  const lines: string[] = [];
  lines.push(`source: ${report.source}`);
  lines.push(`filename: ${report.filename}`);
  lines.push(`snapshot: ${report.snapshotKey}`);
  lines.push(`encoding: ${report.encoding}`);
  lines.push(`delimiter: ${JSON.stringify(report.delimiter)}`);
  lines.push(`bytes: ${report.byteSize}`);
  lines.push(`sha256: ${report.sha256}`);
  lines.push(`kind: ${report.kind}${report.excluded ? " (EXCLUIDO)" : ""}`);
  lines.push(`rows: ${report.rows}`);
  lines.push(`columns (${report.columns.length}): ${report.columns.join(" | ")}`);
  lines.push("column types:");
  for (const col of report.columnStats) {
    const distinct =
      col.distinct === "capped" ? `>=${DISTINCT_CAP}` : String(col.distinct);
    lines.push(
      `  - ${col.name}: type=${col.guessedType} empty=${col.empty} distinct=${distinct}`,
    );
  }
  if (report.sampleRows.length > 0) {
    lines.push("sample rows:");
    for (const [i, row] of report.sampleRows.entries()) {
      lines.push(`  [${i + 1}] ${JSON.stringify(row)}`);
    }
  } else if (report.excluded) {
    lines.push("sample rows: omitidas (grupo familiar)");
  }
  lines.push("schema warnings / issues:");
  if (report.issues.length === 0) {
    lines.push("  (ninguno)");
  } else {
    for (const item of report.issues) {
      const loc = [
        item.row !== undefined ? `row=${item.row}` : null,
        item.column ? `col=${item.column}` : null,
      ]
        .filter(Boolean)
        .join(" ");
      lines.push(`  ${item.level} ${item.code}${loc ? ` ${loc}` : ""}: ${item.message}`);
    }
  }
  lines.push(`field_count_mismatches: ${report.fieldCountMismatches}`);
  return `${lines.join("\n")}\n`;
}
