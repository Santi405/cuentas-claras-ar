import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isValidCuitChecksum, parseCuit } from "./cuit";

describe("parseCuit", () => {
  it("keeps an 11-digit valid CUIT as text", () => {
    const parsed = parseCuit("20000000028");
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.canonical, "20000000028");
      assert.equal(parsed.raw, "20000000028");
    }
  });

  it("normalizes the demonstrated dashed form without dropping the original", () => {
    const parsed = parseCuit("20-00000002-8");
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.canonical, "20000000028");
      assert.equal(parsed.raw, "20-00000002-8");
    }
  });

  it("does not pad short digit strings", () => {
    const parsed = parseCuit("123");
    assert.equal(parsed.ok, false);
    if (!parsed.ok) assert.equal(parsed.reason, "invalid_length");
  });

  it("rejects empty values instead of inventing a CUIT", () => {
    assert.equal(parseCuit("").ok, false);
    assert.equal(parseCuit(null).ok, false);
  });

  it("rejects a checksum mismatch", () => {
    const parsed = parseCuit("20123456789");
    assert.equal(parsed.ok, false);
    if (!parsed.ok) assert.equal(parsed.reason, "invalid_checksum");
  });

  it("never uses a number type that would drop leading zeros", () => {
    const parsed = parseCuit("20000000028");
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(typeof parsed.canonical, "string");
  });

  it("validates the AFIP module-11 digit", () => {
    assert.equal(isValidCuitChecksum("20000000028"), true);
    assert.equal(isValidCuitChecksum("20123456789"), false);
  });
});
