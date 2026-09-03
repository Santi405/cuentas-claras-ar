# DDJJ Congreso

Portal cívico para explorar declaraciones juradas patrimoniales de diputados y senadores nacionales. No es un sitio oficial. Los montos son valores declarados — habitualmente fiscales — y no equivalen a patrimonio de mercado.

El recorte cubre el Congreso nacional. No se muestran datos de grupo familiar.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- Datos mock por defecto (`DATA_SOURCE=mock`)
- PostgreSQL opcional: Neon + Drizzle (`DATA_SOURCE=postgres`)

La UI y `/api/v1` leen `LegisladorRepository`. No ejecutan SQL. El adapter (`mock` o `postgres`) se elige con `DATA_SOURCE`.

## Vercel

La app vive en la **raíz del repositorio** (`package.json` junto a `next.config.ts`), no en `src/`. `src/` solo contiene el código de Next.js (`src/app`).

En el proyecto de Vercel:

1. Settings → General → **Root Directory**: dejalo **vacío** (no pongas `src`, `app` ni `src/app`).
2. Framework Preset: **Next.js** (o autodetectado).
3. Install Command / Build Command: no hace falta override; `vercel.json` usa `npm install` y `npm run build`.
4. Redeploy del commit actual de `main`.

Si Root Directory apunta a `src`, Vercel no ve `next` en `package.json` y falla con *No Next.js version detected*.

Variables (Preview y Production, por separado; nunca en el repo):

| Variable | Mock (default) | Postgres |
| --- | --- | --- |
| `DATA_SOURCE` | `mock` o ausente | `postgres` |
| `DATABASE_URL` | no hace falta | connection string de Neon |
| `DEMO_MODE` | ausente (banner on) | `false` solo cuando haya datos reales |

No hay fallback `postgres → mock` si la base falla: el error debe ser visible.

## Desarrollo (mock)

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

El banner indica que las personas y los montos son ficticios. Con el seed actual de Postgres el banner sigue visible hasta `DEMO_MODE=false`.

## Postgres (Fase 6)

Sigue usando el JSON de demostración. No hay funcionarios reales.

```text
crear DB Neon
↓
aplicar migrations
↓
seed
↓
DATA_SOURCE=postgres
↓
npm run dev
```

1. En un proyecto Vercel vinculado: `vercel integration add neon` (inyecta `DATABASE_URL` en Preview y Production).
2. `vercel env pull .env.local` (o copiá `DATABASE_URL` a `.env.local` a mano).
3. Aplicá el schema versionado (no uses `drizzle-kit push` como flujo permanente):

```bash
npm run db:migrate
npm run db:seed
```

4. En `.env.local`:

```env
DATA_SOURCE=postgres
DATABASE_URL=...
```

5. `npm run dev`

`db:seed` **borra** las tablas de dominio y vuelve a cargar el mock JSON. Es idempotente en el sentido de “recrear el dataset ficticio”. No lo ejecutes contra una base con declaraciones reales.

El cliente Neon se instancia de forma lazy (`getDb()`), para que `next build` no falle sin `DATABASE_URL` mientras `DATA_SOURCE=mock`.

Búsqueda en Postgres: `unaccent` + `LIKE` (equivalente a `normalizeSearch` del mock: sin acentos, sin distinción de mayúsculas). No hay `pg_trgm`, Algolia ni búsqueda vectorial.

## Scripts

- `npm run mock:generate` — regenera JSON de demostración
- `npm test` — contratos de dominio, API, repository e inspect/validación de ingesta (sin base de datos)
- `npm run ingest:inspect -- path/al.csv` — inspección de solo lectura (checksum, schema, stats). No toca PostgreSQL
- `npm run ingest -- fixtures/ingest` — prototipo sobre CSV sintéticos (omite grupo familiar). No persiste salvo `INGEST_ALLOW_PERSIST=true`
- `npm run db:generate` — genera SQL a partir de `src/lib/data/postgres/schema.ts`
- `npm run db:migrate` — aplica `drizzle/*.sql`
- `npm run db:seed` — recrea el mock en Postgres. No usarlo contra declaraciones reales

Documentación de fuentes y pipeline (Fase 7A): `docs/data-sources.md`, `docs/data-ingestion.md`.

Tests de equivalencia mock vs Postgres corren solo si `DATABASE_URL` está definida.

## Ingesta (Fase 7)

Lee CSV DJPI (consolidado, bienes, deudas). Omite archivos o columnas de grupo familiar. Solo acepta filas que parezcan legisladores nacionales. Fusiona por CUIT validado; sin CUIT o sin persona previa manda a cola de revisión (no hay automerge por nombre). El comando de discovery de Fase 7A es `ingest:inspect`, no este prototipo.

## API

`GET /api/v1/legisladores` — query: `q`, `camara`, `distrito`, `estado`, `anio`, `page`, `page_size`, `sort`.

Las páginas del sitio no pasan por la API: leen el repositorio de datos en el servidor. La API no distingue mock de Postgres.

## Licencia

MIT. Los datos de origen deben atribuirse a la Oficina Anticorrupción / Ministerio de Justicia.
