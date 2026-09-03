import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { paginationWindow } from "./pagination";

describe("paginationWindow", () => {
  it("clamps a page past the last page", () => {
    const window = paginationWindow(99, 12, 20);
    assert.equal(window.page, 2);
    assert.equal(window.totalPages, 2);
    assert.equal(window.offset, 12);
    assert.equal(window.pageSize, 12);
  });

  it("returns page 1 when there are no rows", () => {
    const window = paginationWindow(3, 12, 0);
    assert.equal(window.page, 1);
    assert.equal(window.totalPages, 0);
    assert.equal(window.offset, 0);
  });
});
