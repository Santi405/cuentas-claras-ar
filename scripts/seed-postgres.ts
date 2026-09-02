import { getDb } from "../src/lib/data/postgres/db";
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

async function seed() {
  const db = getDb();

  await db.insert(t.fuentes).values(fuentes).onConflictDoNothing();
  await db.insert(t.personas).values(personas).onConflictDoNothing();
  await db
    .insert(t.mandatos)
    .values(
      mandatos.map((m) => ({
        ...m,
        camara: m.camara as Camara,
      })),
    )
    .onConflictDoNothing();
  await db
    .insert(t.declaraciones)
    .values(
      declaraciones.map((d) => ({
        ...d,
        tipo: d.tipo as TipoDeclaracion,
        periodo: d.periodo as PeriodoDeclaracion,
        bienesInicio: String(d.bienesInicio),
        bienesCierre: String(d.bienesCierre),
        deudasInicio: String(d.deudasInicio),
        deudasCierre: String(d.deudasCierre),
      })),
    )
    .onConflictDoNothing();
  await db
    .insert(t.bienes)
    .values(
      bienes.map((b) => ({
        ...b,
        titularidadPct: b.titularidadPct === null ? null : String(b.titularidadPct),
        importeArs: String(b.importeArs),
      })),
    )
    .onConflictDoNothing();
  await db
    .insert(t.deudas)
    .values(deudas.map((d) => ({ ...d, importeArs: String(d.importeArs) })))
    .onConflictDoNothing();
  await db
    .insert(t.identificadoresExternos)
    .values(
      identificadores.map((i) => ({
        ...i,
        sistema: i.sistema as "cuit" | "oa_dj" | "camara" | "cne",
      })),
    )
    .onConflictDoNothing();
  await db
    .insert(t.seriesMacro)
    .values(
      series.map((s) => ({
        anio: s.anio,
        ipcIndice: String(s.ipcIndice),
        usdBcra3500Cierre: String(s.usdBcra3500Cierre),
      })),
    )
    .onConflictDoNothing();
  await db.insert(t.slugHistory).values(slugRedirects).onConflictDoNothing();

  console.log("Seed completado (mock → Postgres).");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
