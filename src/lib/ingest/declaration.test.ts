import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  compareSerializationPair,
  CONSOLIDADO_AMOUNT_COLUMNS,
  identityFromRow,
  parseRectificativa,
  tipoFromSource,
} from "./declaration";
import {
  BIENES_2024_COLUMNS,
  CONSOLIDADO_2024_COLUMNS,
  DEUDAS_2024_COLUMNS,
  FAMILIAR_2024_COLUMNS,
  validateHeaders,
} from "./schema-contract";

describe("schema contract 2024", () => {
  it("uses the observed official column counts", () => {
    assert.equal(CONSOLIDADO_2024_COLUMNS.length, 57);
    assert.equal(BIENES_2024_COLUMNS.length, 13);
    assert.equal(DEUDAS_2024_COLUMNS.length, 13);
    assert.equal(FAMILIAR_2024_COLUMNS.length, 12);
  });

  it("rejects family resources before any other schema check", () => {
    const result = validateHeaders("grupo-familiar.csv", [...FAMILIAR_2024_COLUMNS]);
    assert.equal(result.excluded, true);
    assert.equal(result.kind, "grupo_familiar");
    assert.ok(result.issues.some((i) => i.level === "ERROR"));
  });

  it("rejects familiar columns inside a bienes-shaped file", () => {
    const result = validateHeaders("bienes.csv", [
      "dj_id",
      "bien_importe",
      "familiar_cuit",
    ]);
    assert.equal(result.excluded, true);
    assert.ok(result.issues.some((i) => i.code === "columnas_grupo_familiar"));
  });

  it("flags missing required consolidado columns", () => {
    const result = validateHeaders("declaraciones-juradas-2024-consolidado.csv", [
      "dj_id",
      "cuit",
    ]);
    assert.equal(result.excluded, false);
    assert.ok(result.issues.some((i) => i.code === "columna_requerida_ausente"));
  });

  it("trims-equivalent unexpected columns are warnings, not silent accepts of family", () => {
    const result = validateHeaders("bienes.csv", [...BIENES_2024_COLUMNS, "extra"]);
    assert.equal(result.excluded, false);
    assert.ok(result.issues.some((i) => i.code === "columna_inesperada"));
  });
});

describe("DDJJ identity", () => {
  it("identifies a declaration by dj_id, year, type, rectificativa and CUIT", () => {
    const { identity, issues } = identityFromRow({
      dj_id: "824859",
      cuit: "20000000028",
      anio: "2024",
      tipo_declaracion_jurada_id: "1",
      tipo_declaracion_jurada_descripcion: "Anual",
      rectificativa: "2",
    });
    assert.equal(identity.sourceDjId, "824859");
    assert.equal(identity.anio, 2024);
    assert.equal(identity.tipo, "anual");
    assert.equal(identity.rectificativa, 2);
    assert.equal(identity.cuitCanonical, "20000000028");
    assert.ok(issues.some((i) => i.code === "tipo_id_no_sigue_metadata"));
  });

  it("does not assume metadata tipo_id mapping", () => {
    const annual = tipoFromSource("1", "Anual");
    assert.equal(annual.tipo, "anual");
    const baja = tipoFromSource("2", "Baja");
    assert.equal(baja.tipo, "baja");
  });

  it("does not treat 1 CSV row as 1 unique dj_id", () => {
    const dup = compareSerializationPair(
      {
        total_bienes_inicio: "1000000-00",
        deudas_inicio: "-00",
        total_bienes_final: "1200000-00",
        total_deudas_final: "-00",
      },
      {
        total_bienes_inicio: "1000000.00",
        deudas_inicio: "0.00",
        total_bienes_final: "1200000.00",
        total_deudas_final: "0.00",
      },
      [...CONSOLIDADO_AMOUNT_COLUMNS],
    );
    assert.equal(dup.kind, "equivalent");
  });
});

describe("rectificativa", () => {
  it("parses integer amendment counts including zero", () => {
    assert.equal(parseRectificativa("0").rectificativa, 0);
    assert.equal(parseRectificativa("1").rectificativa, 1);
    assert.equal(parseRectificativa("2").rectificativa, 2);
  });

  it("rejects dotted values instead of coercing 0.00 to 0", () => {
    const parsed = parseRectificativa("0.00");
    assert.equal(parsed.rectificativa, null);
    assert.ok(parsed.issues.some((i) => i.code === "rectificativa_malformada"));
  });
});
