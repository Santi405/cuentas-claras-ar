import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { amountToNumericString, parseAmount } from "./numeric";

describe("parseAmount", () => {
  it("reads numeric strings without using them as identifiers", () => {
    assert.equal(parseAmount("105600000.00"), 105600000);
    assert.equal(parseAmount("12.50"), 12.5);
  });

  it("rejects non-decimal input", () => {
    assert.throws(() => parseAmount("1e6"));
    assert.throws(() => parseAmount("12,5"));
  });
});

describe("amountToNumericString", () => {
  it("formats JSON numbers to a fixed scale", () => {
    assert.equal(amountToNumericString(105600000, 2), "105600000.00");
    assert.equal(amountToNumericString("12.5", 2), "12.50");
  });
});
