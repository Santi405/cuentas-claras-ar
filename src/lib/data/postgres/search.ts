import { SQL, sql } from "drizzle-orm";
import { paginationWindow, PAGE_SIZE_MAX } from "@/lib/domain/pagination";
import { slugifyDistrito, normalizeSearch } from "@/lib/domain/slugs";
import { todayIso } from "@/lib/domain/mandatos";
import {
  isCamara,
  isEstadoLegislador,
  parseSortField,
  type Camara,
  type EstadoLegislador,
  type LegisladorListItem,
  type LegisladorSearchParams,
  type Paginated,
  type SortField,
} from "@/lib/domain/types";
import { getDb } from "./db";
import { parseOptionalAmount, parseOptionalInt } from "./numeric";

const PAGE_SIZE_DEFAULT = 25;

type ExecuteResult<T> = T[] | { rows: T[] };

type ExplorerRow = {
  id: unknown;
  slug: unknown;
  nombre_completo: unknown;
  camara_actual: unknown;
  distrito_actual: unknown;
  bloque_actual: unknown;
  estado: unknown;
  ultimo_anio_declarado: unknown;
  neto_ars: unknown;
  variacion_nominal_pct: unknown;
};

function likeContains(normalized: string): string {
  const compact = normalized.replace(/[%_\\]+/g, " ").trim();
  return `%${compact}%`;
}

function explorerOrderBy(sort: SortField): SQL {
  switch (sort) {
    case "nombre":
      return sql`unaccent(lower(nombre_completo)) ASC, id ASC`;
    case "-nombre":
      return sql`unaccent(lower(nombre_completo)) DESC, id ASC`;
    case "neto":
      return sql`neto_ars ASC NULLS LAST, id ASC`;
    case "-neto":
      return sql`neto_ars DESC NULLS LAST, id ASC`;
    case "anio":
      return sql`ultimo_anio_declarado ASC NULLS LAST, id ASC`;
    case "-anio":
      return sql`ultimo_anio_declarado DESC NULLS LAST, id ASC`;
  }
}

function explorerFilters(params: LegisladorSearchParams): SQL {
  const parts: SQL[] = [];
  const q = params.q
    ? likeContains(normalizeSearch(params.q).replace(/-/g, " "))
    : "";
  if (q && q !== "%%") {
    parts.push(sql`(
      unaccent(lower(apellido || ' ' || nombre)) LIKE ${q}
      OR unaccent(lower(nombre || ' ' || apellido)) LIKE ${q}
      OR unaccent(lower(replace(slug, '-', ' '))) LIKE ${q}
      OR unaccent(lower(nombre_completo)) LIKE ${q}
      OR EXISTS (
        SELECT 1 FROM mandatos m
        WHERE m.persona_id = items.id
          AND unaccent(lower(m.distrito)) LIKE ${q}
      )
    )`);
  }
  if (params.cuit) {
    parts.push(sql`cuit = ${params.cuit}`);
  }
  if (params.camara) {
    parts.push(sql`camara_actual = ${params.camara}`);
  }
  if (params.distrito) {
    const distritoSlug = slugifyDistrito(params.distrito);
    parts.push(sql`
      trim(both '-' from regexp_replace(
        unaccent(lower(coalesce(distrito_actual, ''))),
        '[^a-z0-9]+',
        '-',
        'g'
      )) = ${distritoSlug}
    `);
  }
  if (params.estado) {
    parts.push(sql`estado = ${params.estado}`);
  }
  if (params.anio != null) {
    parts.push(sql`EXISTS (
      SELECT 1 FROM ddjj_visible v
      WHERE v.persona_id = items.id AND v.anio_fiscal = ${params.anio}
    )`);
  }
  if (parts.length === 0) return sql`true`;
  return sql.join(parts, sql` AND `);
}

/**
 * Explorer CTE. Ranking of DDJJ per year matches `elegirDeclaracionesVisibles`.
 * Current mandate matches `mandatoActualDe`. Estado matches `estadoDeMandatos`.
 * `unaccent` exists so search stays accent-insensitive like `normalizeSearch`.
 */
function explorerCtes(today: string): SQL {
  return sql`
    mandato_ranked AS (
      SELECT
        m.*,
        CASE WHEN m.fin IS NULL OR m.fin >= ${today} THEN 0 ELSE 1 END AS historico_rank
      FROM mandatos m
    ),
    mandato_actual AS (
      SELECT DISTINCT ON (persona_id)
        persona_id, camara, distrito, bloque
      FROM mandato_ranked
      ORDER BY persona_id, historico_rank ASC, inicio DESC
    ),
    estado AS (
      SELECT
        p.id AS persona_id,
        CASE WHEN EXISTS (
          SELECT 1 FROM mandatos m
          WHERE m.persona_id = p.id
            AND (m.fin IS NULL OR m.fin >= ${today})
        ) THEN 'en_ejercicio' ELSE 'historico' END AS estado
      FROM personas p
    ),
    ddjj_ranked AS (
      SELECT
        d.*,
        CASE
          WHEN d.tipo = 'inicial' THEN d.bienes_inicio - d.deudas_inicio
          ELSE d.bienes_cierre - d.deudas_cierre
        END AS neto,
        row_number() OVER (
          PARTITION BY d.persona_id, d.anio_fiscal
          ORDER BY
            CASE d.tipo WHEN 'anual' THEN 0 WHEN 'inicial' THEN 1 ELSE 2 END,
            d.rectificativa DESC,
            CASE d.periodo WHEN 'C' THEN 0 ELSE 1 END,
            d.id
        ) AS rn
      FROM declaraciones d
    ),
    ddjj_visible AS (
      SELECT * FROM ddjj_ranked WHERE rn = 1
    ),
    ultima AS (
      SELECT DISTINCT ON (persona_id)
        persona_id, anio_fiscal, tipo, neto
      FROM ddjj_visible
      ORDER BY persona_id, anio_fiscal DESC
    ),
    items AS (
      SELECT
        p.id,
        p.slug,
        p.apellido,
        p.nombre,
        p.cuit,
        (p.apellido || ', ' || p.nombre) AS nombre_completo,
        ma.camara AS camara_actual,
        ma.distrito AS distrito_actual,
        ma.bloque AS bloque_actual,
        e.estado,
        u.anio_fiscal AS ultimo_anio_declarado,
        u.neto AS neto_ars,
        CASE
          WHEN u.tipo = 'anual' AND prev.tipo = 'anual' AND prev.neto <> 0
          THEN ((u.neto - prev.neto) / abs(prev.neto)) * 100
          ELSE NULL
        END AS variacion_nominal_pct
      FROM personas p
      LEFT JOIN mandato_actual ma ON ma.persona_id = p.id
      INNER JOIN estado e ON e.persona_id = p.id
      LEFT JOIN ultima u ON u.persona_id = p.id
      LEFT JOIN ddjj_visible prev
        ON prev.persona_id = p.id AND prev.anio_fiscal = u.anio_fiscal - 1
    )
  `;
}

async function executeRows<T>(query: SQL): Promise<T[]> {
  const result = (await getDb().execute(query)) as ExecuteResult<T>;
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.rows)) return result.rows;
  throw new Error("No se pudieron leer los datos.");
}

function mapExplorerRow(row: ExplorerRow): LegisladorListItem {
  const camara = row.camara_actual;
  const estado = row.estado;
  if (typeof row.id !== "string" || typeof row.slug !== "string") {
    throw new Error("Fila de explorador inválida");
  }
  if (typeof row.nombre_completo !== "string") {
    throw new Error("Fila de explorador inválida");
  }
  if (camara !== null && camara !== undefined && !isCamara(camara)) {
    throw new Error("Fila de explorador inválida");
  }
  if (!isEstadoLegislador(estado)) {
    throw new Error("Fila de explorador inválida");
  }
  return {
    id: row.id,
    slug: row.slug,
    nombreCompleto: row.nombre_completo,
    camaraActual: camara === undefined ? null : (camara as Camara | null),
    distritoActual:
      typeof row.distrito_actual === "string" ? row.distrito_actual : null,
    bloqueActual: typeof row.bloque_actual === "string" ? row.bloque_actual : null,
    estado: estado as EstadoLegislador,
    ultimoAnioDeclarado: parseOptionalInt(row.ultimo_anio_declarado),
    netoArs: parseOptionalAmount(row.neto_ars),
    variacionNominalPct: parseOptionalAmount(row.variacion_nominal_pct),
  };
}

export async function searchLegisladoresSql(
  params: LegisladorSearchParams,
): Promise<Paginated<LegisladorListItem>> {
  const pageSize = Math.min(params.pageSize ?? PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX);
  const page = Math.max(params.page ?? 1, 1);
  const sort = parseSortField(params.sort);
  const today = todayIso();
  const ctes = explorerCtes(today);
  const where = explorerFilters(params);

  const [countRow] = await executeRows<{ total: number | string }>(sql`
    WITH ${ctes}
    SELECT count(*)::int AS total
    FROM items
    WHERE ${where}
  `);
  const total = parseOptionalInt(countRow?.total) ?? 0;
  const window = paginationWindow(page, pageSize, total);
  if (total === 0) {
    return {
      data: [],
      meta: {
        page: window.page,
        pageSize: window.pageSize,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const rows = await executeRows<ExplorerRow>(sql`
    WITH ${ctes}
    SELECT
      id,
      slug,
      nombre_completo,
      camara_actual,
      distrito_actual,
      bloque_actual,
      estado,
      ultimo_anio_declarado,
      neto_ars,
      variacion_nominal_pct
    FROM items
    WHERE ${where}
    ORDER BY ${explorerOrderBy(sort)}
    LIMIT ${window.pageSize} OFFSET ${window.offset}
  `);

  return {
    data: rows.map(mapExplorerRow),
    meta: {
      page: window.page,
      pageSize: window.pageSize,
      total: window.total,
      totalPages: window.totalPages,
    },
  };
}
