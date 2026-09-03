import { inspectLocalFile, formatInspectReport } from "../src/lib/ingest/inspect";

function printHelp(): void {
  console.log(`Uso: npm run ingest:inspect -- <archivo.csv>

Inspección de solo lectura. No escribe PostgreSQL, no descarga URLs y no
publica datos. Calcula checksum, encoding, delimitador, filas, columnas,
tipos observados y advertencias de schema.

Ejemplo:
  npm run ingest:inspect -- fixtures/ingest/fase-7a/consolidado-sample.csv
`);
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  if (args.includes("-h") || args.includes("--help") || args.length === 0) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }
  const json = args.includes("--json");
  const file = args.find((a) => !a.startsWith("-"));
  if (!file) {
    printHelp();
    process.exit(1);
  }
  const report = await inspectLocalFile(file);
  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    process.stdout.write(formatInspectReport(report));
  }
  const fatal = report.issues.some((i) => i.level === "ERROR");
  if (report.excluded || fatal) {
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
