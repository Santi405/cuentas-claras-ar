import { loadLocalEnv } from "../src/lib/data/postgres/load-env";

loadLocalEnv();

import { getDb } from "../src/lib/data/postgres/db";
import { amountToNumericString } from "../src/lib/data/postgres/numeric";
import * as t from "../src/lib/data/postgres/schema";
import type { Camara, PeriodoDeclaracion, TipoDeclaracion } from "../src/lib/domain/types";
import personas from "../src/lib/data/mock/personas.json";
import mandatos from "../src/lib/data/mock/mandatos.json";
import declaraciones from "../src/lib/data/mock/declaraciones.json";
import bienes from "../src/lib/data/mock/bienes.json";
import deudas from "../src/lib/data/mock/deudas.json";
import fuentes from "../src/lib/data/mock/fuentes.json";
import identificadores from "../src/lib/data/mock/identificadores.json";
import series from "../src/lib/data/mock/series-macro.json";
import slugRedirects from "../src/lib/data/mock/slug-redirects.json";

/**
 * Recreates the fictional mock dataset in Postgres.
 * Deletes previously seeded rows (not ingest_review_queue) and inserts JSON.
 * Safe for development. Do not run against a database with real filings.
 */
async function seed() {
  const db = getDb();

  await db.delete(t.deudas);
  await db.delete(t.bienes);
  await db.delete(t.declaraciones);
  await db.delete(t.identificadoresExternos);
  await db.delete(t.slugHistory);
  await db.delete(t.mandatos);
  await db.delete(t.personas);
  await db.delete(t.fuentes);
  await db.delete(t.seriesMacro);

  await db.insert(t.fuentes).values(fuentes);
  await db.insert(t.personas).values(personas);
  await db.insert(t.mandatos).values(
    mandatos.map((m) => ({
      ...m,
      camara: m.camara as Camara,
    })),
  );
  await db.insert(t.declaraciones).values(
    declaraciones.map((d) => ({
      ...d,
      tipo: d.tipo as TipoDeclaracion,
      periodo: d.periodo as PeriodoDeclaracion,
      bienesInicio: amountToNumericString(d.bienesInicio, 2),
      bienesCierre: amountToNumericString(d.bienesCierre, 2),
      deudasInicio: amountToNumericString(d.deudasInicio, 2),
      deudasCierre: amountToNumericString(d.deudasCierre, 2),
    })),
  );
  await db.insert(t.bienes).values(
    bienes.map((b) => ({
      ...b,
      titularidadPct:
        b.titularidadPct === null
          ? null
          : amountToNumericString(b.titularidadPct, 2),
      importeArs: amountToNumericString(b.importeArs, 2),
    })),
  );
  await db.insert(t.deudas).values(
    deudas.map((d) => ({
      ...d,
      importeArs: amountToNumericString(d.importeArs, 2),
    })),
  );
  await db.insert(t.identificadoresExternos).values(
    identificadores.map((i) => ({
      ...i,
      sistema: i.sistema as "cuit" | "oa_dj" | "camara" | "cne",
    })),
  );
  await db.insert(t.seriesMacro).values(
    series.map((s) => ({
      anio: s.anio,
      ipcIndice: amountToNumericString(s.ipcIndice, 4),
      usdBcra3500Cierre: amountToNumericString(s.usdBcra3500Cierre, 4),
    })),
  );
  await db.insert(t.slugHistory).values(slugRedirects);

  console.log(
    `Seed completado (mock → Postgres): ${personas.length} personas, ${declaraciones.length} declaraciones.`,
  );
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
