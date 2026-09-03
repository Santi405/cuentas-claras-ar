import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { join } from "node:path";
import { parseCsv } from "./csv";
import { inspectLocalFile } from "./inspect";

const FIXTURES = join(process.cwd(), "fixtures/ingest/fase-7a");

describe("ingest:inspect", () => {
  it("inspects a synthetic consolidado without touching postgres", async () => {
    const report = await inspectLocalFile(join(FIXTURES, "consolidado-sample.csv"));
    assert.equal(report.kind, "consolidado");
    assert.equal(report.excluded, false);
    assert.equal(report.encoding, "utf-8");
    assert.equal(report.delimiter, ",");
    assert.equal(report.rows, 5);
    assert.equal(report.columns.includes("dj_id"), true);
    assert.equal(report.sha256.length, 64);
    assert.match(report.snapshotKey, /oficina_anticorrupcion_djpi/);
    assert.ok(report.columnStats.some((c) => c.name === "total_bienes_final"));
    assert.equal(report.sampleRows.length > 0, true);
  });

  it("trims spaced bienes headers from the official dump shape", async () => {
    const report = await inspectLocalFile(join(FIXTURES, "bienes-sample.csv"));
    assert.equal(report.kind, "bienes");
    assert.equal(report.columns.includes("bien_importe"), true);
    assert.equal(report.columns.includes(" bien_importe"), false);
  });

  it("excludes grupo familiar and does not print family samples", async () => {
    const report = await inspectLocalFile(
      join(FIXTURES, "grupo-familiar-sample.csv"),
    );
    assert.equal(report.kind, "grupo_familiar");
    assert.equal(report.excluded, true);
    assert.deepEqual(report.sampleRows, []);
    assert.ok(report.issues.some((i) => i.code === "archivo_grupo_familiar"));
  });

  it("rejects familiar columns smuggled into a bienes file", async () => {
    const report = await inspectLocalFile(
      join(FIXTURES, "bienes-con-columnas-familiares.csv"),
    );
    assert.equal(report.excluded, true);
    assert.ok(report.issues.some((i) => i.code === "columnas_grupo_familiar"));
  });

  it("refuses URLs", async () => {
    await assert.rejects(
      () => inspectLocalFile("https://datos.jus.gob.ar/dataset/x.csv"),
      /locales/,
    );
  });
});

describe("csv header trimming", () => {
  it("maps spaced official bienes headers to contract names", () => {
    const { headers, rows } = parseCsv(
      "bien_tipo,bien_descripcion, bien_origen_fondos, bien_titularidad, bien_importe\nInmueble,Casa,Haberes,100.00,1.00\n",
    );
    assert.deepEqual(headers, [
      "bien_tipo",
      "bien_descripcion",
      "bien_origen_fondos",
      "bien_titularidad",
      "bien_importe",
    ]);
    assert.equal(rows[0].bien_importe, "1.00");
  });
});
