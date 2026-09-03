import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BIEN_IMPORTE_INCLUDES_TITULARIDAD,
  declaredAmountForTitularidad,
  interpretBienImporte,
} from "./ownership";

describe("titularidad / bien_importe", () => {
  it("documents that bien_importe already includes ownership share", () => {
    assert.equal(BIEN_IMPORTE_INCLUDES_TITULARIDAD, true);
  });

  it("does not multiply importe by titularidad percentage", () => {
    const interpreted = interpretBienImporte("800000.00", "50.00");
    assert.equal(interpreted.multipliedByTitularidad, false);
    assert.equal(interpreted.importeCanonical, "800000.00");
    assert.equal(declaredAmountForTitularidad("800000.00"), "800000.00");
    assert.notEqual(
      declaredAmountForTitularidad("800000.00"),
      String(800000 * (50 / 100)),
    );
  });
});
