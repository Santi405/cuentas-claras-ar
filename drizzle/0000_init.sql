CREATE EXTENSION IF NOT EXISTS unaccent;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE TYPE "public"."camara" AS ENUM('diputados', 'senadores');--> statement-breakpoint
CREATE TYPE "public"."identificador_sistema" AS ENUM('cuit', 'oa_dj', 'camara', 'cne');--> statement-breakpoint
CREATE TYPE "public"."periodo_declaracion" AS ENUM('I', 'C');--> statement-breakpoint
CREATE TYPE "public"."tipo_declaracion" AS ENUM('inicial', 'anual', 'baja');--> statement-breakpoint
CREATE TABLE "bienes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"declaracion_id" uuid NOT NULL,
	"tipo" text,
	"descripcion" text NOT NULL,
	"origen_fondos" text,
	"titularidad_pct" numeric(6, 2),
	"importe_ars" numeric(18, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "declaraciones" (
	"id" uuid PRIMARY KEY NOT NULL,
	"persona_id" uuid NOT NULL,
	"anio_fiscal" integer NOT NULL,
	"tipo" "tipo_declaracion" NOT NULL,
	"fuente_id" uuid NOT NULL,
	"source_dj_id" integer,
	"rectificativa" integer DEFAULT 0 NOT NULL,
	"periodo" "periodo_declaracion" NOT NULL,
	"organismo_declarado" text NOT NULL,
	"cargo_declarado" text NOT NULL,
	"bienes_inicio" numeric(18, 2) NOT NULL,
	"bienes_cierre" numeric(18, 2) NOT NULL,
	"deudas_inicio" numeric(18, 2) NOT NULL,
	"deudas_cierre" numeric(18, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deudas" (
	"id" uuid PRIMARY KEY NOT NULL,
	"declaracion_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"descripcion" text NOT NULL,
	"radicacion" text,
	"clasificacion" text,
	"importe_ars" numeric(18, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuentes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"url" text,
	"snapshot_date" text NOT NULL,
	"archivo" text NOT NULL,
	"archivo_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identificadores_externos" (
	"id" uuid PRIMARY KEY NOT NULL,
	"persona_id" uuid NOT NULL,
	"sistema" "identificador_sistema" NOT NULL,
	"valor" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingest_review_queue" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reason" text NOT NULL,
	"payload" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mandatos" (
	"id" uuid PRIMARY KEY NOT NULL,
	"persona_id" uuid NOT NULL,
	"camara" "camara" NOT NULL,
	"distrito" text NOT NULL,
	"inicio" text NOT NULL,
	"fin" text,
	"bloque" text,
	"interbloque" text,
	"lista_electoral" text
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" uuid PRIMARY KEY NOT NULL,
	"apellido" text NOT NULL,
	"nombre" text NOT NULL,
	"slug" text NOT NULL,
	"cuit" text,
	"fecha_nacimiento" text,
	"foto_url" text
);
--> statement-breakpoint
CREATE TABLE "series_macro" (
	"anio" integer PRIMARY KEY NOT NULL,
	"ipc_indice" numeric(12, 4) NOT NULL,
	"usd_bcra_3500_cierre" numeric(12, 4) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slug_history" (
	"slug" text PRIMARY KEY NOT NULL,
	"persona_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bienes" ADD CONSTRAINT "bienes_declaracion_id_declaraciones_id_fk" FOREIGN KEY ("declaracion_id") REFERENCES "public"."declaraciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "declaraciones" ADD CONSTRAINT "declaraciones_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "declaraciones" ADD CONSTRAINT "declaraciones_fuente_id_fuentes_id_fk" FOREIGN KEY ("fuente_id") REFERENCES "public"."fuentes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deudas" ADD CONSTRAINT "deudas_declaracion_id_declaraciones_id_fk" FOREIGN KEY ("declaracion_id") REFERENCES "public"."declaraciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identificadores_externos" ADD CONSTRAINT "identificadores_externos_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandatos" ADD CONSTRAINT "mandatos_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slug_history" ADD CONSTRAINT "slug_history_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bienes_declaracion_idx" ON "bienes" USING btree ("declaracion_id");--> statement-breakpoint
CREATE INDEX "declaraciones_persona_anio_idx" ON "declaraciones" USING btree ("persona_id","anio_fiscal");--> statement-breakpoint
CREATE UNIQUE INDEX "declaraciones_source_dj_uidx" ON "declaraciones" USING btree ("source_dj_id");--> statement-breakpoint
CREATE INDEX "deudas_declaracion_idx" ON "deudas" USING btree ("declaracion_id");--> statement-breakpoint
CREATE INDEX "identificadores_persona_idx" ON "identificadores_externos" USING btree ("persona_id");--> statement-breakpoint
CREATE UNIQUE INDEX "identificadores_sistema_valor_uidx" ON "identificadores_externos" USING btree ("sistema","valor");--> statement-breakpoint
CREATE INDEX "mandatos_persona_idx" ON "mandatos" USING btree ("persona_id");--> statement-breakpoint
CREATE INDEX "mandatos_camara_idx" ON "mandatos" USING btree ("camara");--> statement-breakpoint
CREATE INDEX "mandatos_distrito_idx" ON "mandatos" USING btree ("distrito");--> statement-breakpoint
CREATE INDEX "mandatos_vigentes_idx" ON "mandatos" USING btree ("fin");--> statement-breakpoint
CREATE UNIQUE INDEX "personas_slug_uidx" ON "personas" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "personas_cuit_uidx" ON "personas" USING btree ("cuit");--> statement-breakpoint
CREATE INDEX "personas_apellido_idx" ON "personas" USING btree ("apellido");--> statement-breakpoint
CREATE INDEX "personas_nombre_trgm_idx" ON "personas" USING gin ((unaccent(lower(apellido || ' ' || nombre))) gin_trgm_ops);