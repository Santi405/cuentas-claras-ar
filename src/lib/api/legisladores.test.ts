import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GET as getLegislador } from "@/app/api/v1/legisladores/[id]/route";
import { GET as getLegisladores } from "@/app/api/v1/legisladores/route";

async function readJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("GET /api/v1/legisladores", () => {
  it("returns 200 with data and pagination meta", async () => {
    const response = await getLegisladores(
      new Request("http://localhost/api/v1/legisladores"),
    );
    assert.equal(response.status, 200);
    const body = await readJson(response);
    const data = body.data as unknown[];
    const meta = body.meta as Record<string, unknown>;
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);
    assert.equal(meta.page, 1);
    assert.equal(meta.page_size, 20);
    assert.equal(typeof meta.total, "number");
    assert.equal(typeof meta.total_pages, "number");
    const first = data[0] as Record<string, unknown>;
    assert.equal("cuit" in first, false);
  });

  it("returns 400 for an invalid sort", async () => {
    const response = await getLegisladores(
      new Request("http://localhost/api/v1/legisladores?sort=invalid"),
    );
    assert.equal(response.status, 400);
    const body = await readJson(response);
    const error = body.error as Record<string, unknown>;
    assert.equal(error.code, "INVALID_QUERY");
    assert.equal(error.message, "El parámetro sort no es válido.");
  });

  it("returns 400 for a negative page", async () => {
    const response = await getLegisladores(
      new Request("http://localhost/api/v1/legisladores?page=-5"),
    );
    assert.equal(response.status, 400);
    const body = await readJson(response);
    const error = body.error as Record<string, unknown>;
    assert.equal(error.code, "INVALID_QUERY");
    assert.equal(error.message, "El parámetro page no es válido.");
  });

  it("returns 400 when page_size exceeds the maximum", async () => {
    const response = await getLegisladores(
      new Request("http://localhost/api/v1/legisladores?page_size=999999"),
    );
    assert.equal(response.status, 400);
    const body = await readJson(response);
    const error = body.error as Record<string, unknown>;
    assert.equal(error.code, "INVALID_QUERY");
    assert.equal(error.message, "El parámetro page_size no es válido.");
  });
});

describe("GET /api/v1/legisladores/[id]", () => {
  it("returns 200 for a public slug without exposing CUIT", async () => {
    const response = await getLegislador(
      new Request("http://localhost/api/v1/legisladores/ejemplo-ana"),
      { params: Promise.resolve({ id: "ejemplo-ana" }) },
    );
    assert.equal(response.status, 200);
    const body = await readJson(response);
    const data = body.data as Record<string, unknown>;
    assert.equal(data.slug, "ejemplo-ana");
    assert.equal("cuit" in data, false);
  });

  it("returns 404 for an unknown slug", async () => {
    const response = await getLegislador(
      new Request("http://localhost/api/v1/legisladores/no-existe"),
      { params: Promise.resolve({ id: "no-existe" }) },
    );
    assert.equal(response.status, 404);
    const body = await readJson(response);
    const error = body.error as Record<string, unknown>;
    assert.equal(error.code, "NOT_FOUND");
  });
});
