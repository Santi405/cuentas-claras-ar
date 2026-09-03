import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  familyExclusionReason,
  hasFamiliarColumns,
  isGrupoFamiliarResource,
} from "./family";

describe("grupo familiar exclusion", () => {
  it("detects the official family filename", () => {
    assert.equal(
      isGrupoFamiliarResource(
        "declaraciones-juradas-grupo-familiar-2024-consolidado-al-20251222.csv",
      ),
      true,
    );
    assert.equal(
      isGrupoFamiliarResource(
        "declaraciones-juradas-bienes-2024-consolidado-al-20251222.csv",
      ),
      false,
    );
  });

  it("detects familiar_* columns even on a bienes file", () => {
    assert.equal(
      hasFamiliarColumns(["dj_id", "bien_importe", "familiar_cuit"]),
      true,
    );
    assert.equal(hasFamiliarColumns(["dj_id", "bien_importe"]), false);
  });

  it("returns an explicit exclusion reason", () => {
    assert.equal(
      familyExclusionReason("grupo-familiar-2024.csv", ["dj_id"]),
      "archivo_grupo_familiar",
    );
    assert.equal(
      familyExclusionReason("bienes.csv", ["bien_importe", "familiar_apellido_nombre"]),
      "columnas_grupo_familiar",
    );
    assert.equal(familyExclusionReason("bienes.csv", ["bien_importe"]), null);
  });
});
