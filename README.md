# DDJJ Congreso

Portal cívico para explorar declaraciones juradas patrimoniales de diputados y senadores nacionales. No es un sitio oficial. Los montos son valores declarados — habitualmente fiscales — y no equivalen a patrimonio de mercado.

El recorte cubre el Congreso nacional. No se muestran datos de grupo familiar.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- Datos mock por defecto (`DATA_SOURCE=mock`)
- PostgreSQL opcional: Neon + Drizzle (`DATA_SOURCE=postgres`)

## Desarrollo

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

Mientras `DATA_SOURCE` no sea `postgres`, el banner indica que las personas y los montos son ficticios.

## Scripts

- `npm run mock:generate` — regenera JSON de demostración
- `npm run ingest -- fixtures/ingest` — prueba de ingesta CSV DJPI (omite grupo familiar)
- `npm run db:generate` / `db:migrate` / `db:seed` — schema y seed contra Neon

## Postgres (Fase 6)

1. En un proyecto Vercel vinculado: `vercel integration add neon`
2. `vercel env pull .env.local`
3. `DATA_SOURCE=postgres`
4. `npm run db:migrate && npm run db:seed`

El cliente Neon se instancia de forma lazy (`getDb()`), para que `next build` no falle sin `DATABASE_URL`.

Búsqueda en Postgres: `unaccent` + `ILIKE` y índice `pg_trgm` sobre nombre.

## Ingesta (Fase 7)

Lee CSV DJPI (consolidado, bienes, deudas). Omite archivos o columnas de grupo familiar. Solo acepta filas que parezcan legisladores nacionales. Fusiona por CUIT; sin CUIT manda a cola de revisión (no hay automerge por nombre).

## API

`GET /api/v1/legisladores` — query: `q`, `camara`, `distrito`, `estado`, `anio`, `cuit`, `page`, `page_size`, `sort`.

Las páginas del sitio no pasan por la API: leen el repositorio de datos en el servidor.

## Licencia

MIT. Los datos de origen deben atribuirse a la Oficina Anticorrupción / Ministerio de Justicia.
