/**
 * PostgreSQL schema for the legislator repository.
 *
 * Search uses the `unaccent` extension (created in drizzle/0000_init.sql)
 * so LIKE matches `normalizeSearch` in the mock adapter (García = garcia).
 * A trigram index is not used: the current explorer is a small listing,
 * and `unaccent()` is not IMMUTABLE so it cannot sit in a stock Postgres index.
 */
import {
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const camaraEnum = pgEnum("camara", ["diputados", "senadores"]);
export const tipoDeclaracionEnum = pgEnum("tipo_declaracion", [
  "inicial",
  "anual",
  "baja",
]);
export const periodoEnum = pgEnum("periodo_declaracion", ["I", "C"]);
export const identificadorSistemaEnum = pgEnum("identificador_sistema", [
  "cuit",
  "oa_dj",
  "camara",
  "cne",
]);

export const personas = pgTable(
  "personas",
  {
    id: uuid("id").primaryKey(),
    apellido: text("apellido").notNull(),
    nombre: text("nombre").notNull(),
    slug: text("slug").notNull(),
    cuit: text("cuit"),
    fechaNacimiento: date("fecha_nacimiento", { mode: "string" }),
    fotoUrl: text("foto_url"),
  },
  (t) => [
    uniqueIndex("personas_slug_uidx").on(t.slug),
    uniqueIndex("personas_cuit_uidx").on(t.cuit),
    index("personas_apellido_idx").on(t.apellido),
  ],
);

export const mandatos = pgTable(
  "mandatos",
  {
    id: uuid("id").primaryKey(),
    personaId: uuid("persona_id")
      .notNull()
      .references(() => personas.id),
    camara: camaraEnum("camara").notNull(),
    distrito: text("distrito").notNull(),
    inicio: date("inicio", { mode: "string" }).notNull(),
    fin: date("fin", { mode: "string" }),
    bloque: text("bloque"),
    interbloque: text("interbloque"),
    listaElectoral: text("lista_electoral"),
  },
  (t) => [
    index("mandatos_persona_idx").on(t.personaId),
    index("mandatos_camara_idx").on(t.camara),
    index("mandatos_distrito_idx").on(t.distrito),
    index("mandatos_vigentes_idx").on(t.fin),
  ],
);

export const fuentes = pgTable("fuentes", {
  id: uuid("id").primaryKey(),
  nombre: text("nombre").notNull(),
  url: text("url"),
  snapshotDate: date("snapshot_date", { mode: "string" }).notNull(),
  archivo: text("archivo").notNull(),
  archivoHash: text("archivo_hash").notNull(),
});

export const declaraciones = pgTable(
  "declaraciones",
  {
    id: uuid("id").primaryKey(),
    personaId: uuid("persona_id")
      .notNull()
      .references(() => personas.id),
    anioFiscal: integer("anio_fiscal").notNull(),
    tipo: tipoDeclaracionEnum("tipo").notNull(),
    fuenteId: uuid("fuente_id")
      .notNull()
      .references(() => fuentes.id),
    sourceDjId: integer("source_dj_id"),
    rectificativa: integer("rectificativa").notNull().default(0),
    periodo: periodoEnum("periodo").notNull(),
    organismoDeclarado: text("organismo_declarado").notNull(),
    cargoDeclarado: text("cargo_declarado").notNull(),
    bienesInicio: numeric("bienes_inicio", { precision: 18, scale: 2 }).notNull(),
    bienesCierre: numeric("bienes_cierre", { precision: 18, scale: 2 }).notNull(),
    deudasInicio: numeric("deudas_inicio", { precision: 18, scale: 2 }).notNull(),
    deudasCierre: numeric("deudas_cierre", { precision: 18, scale: 2 }).notNull(),
  },
  (t) => [
    index("declaraciones_persona_anio_idx").on(t.personaId, t.anioFiscal),
    uniqueIndex("declaraciones_source_dj_uidx").on(t.sourceDjId),
  ],
);

export const bienes = pgTable(
  "bienes",
  {
    id: uuid("id").primaryKey(),
    declaracionId: uuid("declaracion_id")
      .notNull()
      .references(() => declaraciones.id),
    tipo: text("tipo"),
    descripcion: text("descripcion").notNull(),
    origenFondos: text("origen_fondos"),
    titularidadPct: numeric("titularidad_pct", { precision: 6, scale: 2 }),
    importeArs: numeric("importe_ars", { precision: 18, scale: 2 }).notNull(),
  },
  (t) => [index("bienes_declaracion_idx").on(t.declaracionId)],
);

export const deudas = pgTable(
  "deudas",
  {
    id: uuid("id").primaryKey(),
    declaracionId: uuid("declaracion_id")
      .notNull()
      .references(() => declaraciones.id),
    tipo: text("tipo").notNull(),
    descripcion: text("descripcion").notNull(),
    radicacion: text("radicacion"),
    clasificacion: text("clasificacion"),
    importeArs: numeric("importe_ars", { precision: 18, scale: 2 }).notNull(),
  },
  (t) => [index("deudas_declaracion_idx").on(t.declaracionId)],
);

export const identificadoresExternos = pgTable(
  "identificadores_externos",
  {
    id: uuid("id").primaryKey(),
    personaId: uuid("persona_id")
      .notNull()
      .references(() => personas.id),
    sistema: identificadorSistemaEnum("sistema").notNull(),
    valor: text("valor").notNull(),
  },
  (t) => [
    index("identificadores_persona_idx").on(t.personaId),
    uniqueIndex("identificadores_sistema_valor_uidx").on(t.sistema, t.valor),
  ],
);

export const slugHistory = pgTable("slug_history", {
  slug: text("slug").primaryKey(),
  personaId: uuid("persona_id")
    .notNull()
    .references(() => personas.id),
});

export const seriesMacro = pgTable("series_macro", {
  anio: integer("anio").primaryKey(),
  ipcIndice: numeric("ipc_indice", { precision: 12, scale: 4 }).notNull(),
  usdBcra3500Cierre: numeric("usd_bcra_3500_cierre", {
    precision: 12,
    scale: 4,
  }).notNull(),
});

export const ingestReviewQueue = pgTable("ingest_review_queue", {
  id: uuid("id").primaryKey(),
  reason: text("reason").notNull(),
  payload: text("payload").notNull(),
  createdAt: text("created_at").notNull(),
});
