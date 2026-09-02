import { readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import personas from "../src/lib/data/mock/personas.json";
import { buildPersonaIndex, ingestDjpiFiles } from "../src/lib/ingest/pipeline";
import type { Persona } from "../src/lib/domain/types";

async function main() {
  const dir = resolve(process.argv[2] ?? "fixtures/ingest");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".csv"))
    .map((f) => ({ path: join(dir, f) }));

  const index = buildPersonaIndex(personas as Persona[]);
  const result = ingestDjpiFiles(files, index);

  const out = join(dir, "ingest-report.json");
  writeFileSync(
    out,
    JSON.stringify(
      {
        disclaimer:
          "Ingesta de demostración. No se leen ni persisten columnas de grupo familiar.",
        ...result,
      },
      null,
      2,
    ) + "\n",
  );

  console.log(
    `Archivos omitidos (familia u otro): ${result.skippedFiles.join(", ") || "ninguno"}`,
  );
  console.log(`Filas aceptadas: ${result.acceptedRows}`);
  console.log(`Filas omitidas (no Congreso / inválidas): ${result.skippedRows}`);
  console.log(`Cola de revisión: ${result.review.length}`);
  console.log(`Reporte: ${out}`);

  if (process.env.DATABASE_URL && process.env.DATA_SOURCE === "postgres") {
    const { persistIngestResult } = await import("../src/lib/ingest/persist");
    await persistIngestResult(result);
    console.log("Persistido en Postgres (revisión + declaraciones matcheadas por CUIT).");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
