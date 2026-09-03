import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { listAllLegisladorSlugs } from "./cached";

describe("listAllLegisladorSlugs", () => {
  it("returns unique public slugs including historical and current legislators", async () => {
    const slugs = await listAllLegisladorSlugs();
    assert.ok(slugs.length > 0);
    assert.equal(new Set(slugs).size, slugs.length);
    assert.ok(slugs.includes("ejemplo-ana"));
    assert.ok(slugs.every((slug) => /^[a-z0-9-]+$/.test(slug)));
  });
});
