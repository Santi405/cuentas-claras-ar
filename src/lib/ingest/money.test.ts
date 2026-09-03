import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { moneyEquals, moneyToCents, parseMoney } from "./money";

describe("parseMoney", () => {
  it("parses OA consolidado hyphen decimals", () => {
    const parsed = parseMoney("35278884-41");
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.canonical, "35278884.41");
      assert.equal(parsed.format, "hyphen_decimal");
    }
  });

  it("parses explicit zero as -00", () => {
    const parsed = parseMoney("-00");
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.canonical, "0.00");
      assert.equal(parsed.format, "hyphen_zero");
    }
  });

  it("parses bienes/deudas dot decimals", () => {
    const parsed = parseMoney("1050000.00");
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(parsed.canonical, "1050000.00");
  });

  it("parses integer zeros from older snapshots", () => {
    const parsed = parseMoney("0");
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.canonical, "0");
      assert.equal(parsed.format, "integer");
    }
  });

  it("does not convert empty or invalid strings to zero", () => {
    assert.equal(parseMoney("").ok, false);
    assert.equal(parseMoney("n/a").ok, false);
    assert.notEqual(Number("52992760-62"), Number("52992760.62"));
    assert.equal(Number.isNaN(Number("52992760-62")), true);
    const parsed = parseMoney("52992760-62");
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(parsed.canonical, "52992760.62");
  });

  it("treats equivalent hyphen and dot encodings as equal", () => {
    const a = parseMoney("76523796-65");
    const b = parseMoney("76523796.65");
    assert.equal(a.ok && b.ok, true);
    if (a.ok && b.ok) {
      assert.equal(moneyEquals(a.canonical, b.canonical), true);
    }
  });

  it("detects the -00 vs dotted 10x serialization conflict", () => {
    const a = parseMoney("9727054-00");
    const b = parseMoney("97270540.00");
    assert.equal(a.ok && b.ok, true);
    if (a.ok && b.ok) {
      assert.equal(moneyEquals(a.canonical, b.canonical), false);
      assert.equal(moneyToCents(a.canonical), "972705400");
      assert.equal(moneyToCents(b.canonical), "9727054000");
    }
  });
});
