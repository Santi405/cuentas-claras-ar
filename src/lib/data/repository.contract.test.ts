import assert from "node:assert/strict";
import { describe, it } from "node:test";
import declaracionesJson from "./mock/declaraciones.json";
import { mockRepository } from "./mock/adapter";
import { slugifyDistrito } from "@/lib/domain/slugs";
import { listAllLegisladorSlugs } from "./cached";

describe("repository explorer", () => {
  it("returns everyone without filters", async () => {
    const result = await mockRepository.searchLegisladores({ pageSize: 100 });
    assert.equal(result.meta.page, 1);
    assert.ok(result.data.length >= 20);
    assert.ok(result.data.some((item) => item.slug === "ejemplo-ana"));
  });

  it("filters by name", async () => {
    const result = await mockRepository.searchLegisladores({
      q: "ana",
      pageSize: 100,
    });
    assert.ok(result.data.some((item) => item.slug === "ejemplo-ana"));
  });

  it("filters by camara", async () => {
    const result = await mockRepository.searchLegisladores({
      camara: "senadores",
      pageSize: 100,
    });
    assert.ok(result.data.length > 0);
    assert.ok(result.data.every((item) => item.camaraActual === "senadores"));
  });

  it("filters by estado", async () => {
    const result = await mockRepository.searchLegisladores({
      estado: "historico",
      pageSize: 100,
    });
    assert.ok(result.data.every((item) => item.estado === "historico"));
  });

  it("filters by distrito", async () => {
    const result = await mockRepository.searchLegisladores({
      distrito: "santa-fe",
      pageSize: 100,
    });
    assert.ok(result.data.length > 0);
    assert.ok(
      result.data.every(
        (item) =>
          item.distritoActual != null &&
          slugifyDistrito(item.distritoActual) === "santa-fe",
      ),
    );
  });

  it("filters by anio", async () => {
    const result = await mockRepository.searchLegisladores({
      anio: 2024,
      pageSize: 100,
    });
    assert.ok(result.data.length > 0);
    for (const item of result.data) {
      const detalle = await mockRepository.getLegisladorBySlug(item.slug);
      assert.ok(detalle?.declaraciones.some((d) => d.anioFiscal === 2024));
    }
  });

  it("sorts by patrimonio neto descending", async () => {
    const result = await mockRepository.searchLegisladores({
      sort: "-neto",
      pageSize: 100,
    });
    const netos = result.data
      .map((item) => item.netoArs)
      .filter((n): n is number => n != null);
    for (let i = 1; i < netos.length; i += 1) {
      assert.ok(netos[i - 1] >= netos[i]);
    }
  });

  it("paginates page 2", async () => {
    const result = await mockRepository.searchLegisladores({
      page: 2,
      pageSize: 12,
      sort: "nombre",
    });
    assert.equal(result.meta.page, 2);
    assert.equal(result.meta.pageSize, 12);
    assert.ok(result.data.length > 0);
    const first = await mockRepository.searchLegisladores({
      page: 1,
      pageSize: 12,
      sort: "nombre",
    });
    assert.notEqual(result.data[0]?.slug, first.data[0]?.slug);
  });
});

describe("repository detail", () => {
  it("loads an existing person", async () => {
    const ana = await mockRepository.getLegisladorBySlug("ejemplo-ana");
    assert.ok(ana);
    assert.equal(ana.persona.slug, "ejemplo-ana");
    assert.ok(ana.mandatos.length >= 1);
    assert.ok(ana.declaraciones.length >= 1);
  });

  it("returns null for a missing person", async () => {
    const missing = await mockRepository.getLegisladorBySlug("no-existe");
    assert.equal(missing, null);
  });

  it("keeps multiple mandates on distinct chambers", async () => {
    const juan = await mockRepository.getLegisladorBySlug("demostracion-juan");
    assert.ok(juan);
    const camaras = new Set(juan.mandatos.map((m) => m.camara));
    assert.ok(camaras.has("diputados"));
    assert.ok(camaras.has("senadores"));
  });

  it("records a year gap as faltante", async () => {
    const ana = await mockRepository.getLegisladorBySlug("ejemplo-ana");
    const hueco = ana?.evolucion.find((row) => row.anioFiscal === 2021);
    assert.ok(hueco);
    assert.equal(hueco.faltante, true);
    assert.equal(hueco.neto, null);
  });
});

describe("repository DDJJ", () => {
  it("keeps the latest rectificativa as the visible year", async () => {
    const sofia = await mockRepository.getLegisladorBySlug("ensayo-sofia");
    const visible = sofia?.declaraciones.find((d) => d.anioFiscal === 2023);
    assert.equal(visible?.rectificativa, 1);
    const detalle = await mockRepository.getDeclaracion(
      sofia?.persona.id ?? "",
      2023,
    );
    assert.equal(detalle?.rectificativa, 1);
    assert.ok((detalle?.bienesItems.length ?? 0) > 0);
  });

  it("lists visible declaraciones for a person", async () => {
    const ana = await mockRepository.getLegisladorBySlug("ejemplo-ana");
    assert.ok(ana);
    const list = await mockRepository.listDeclaraciones(ana.persona.id);
    assert.equal(list.length, ana.declaraciones.length);
  });
});

describe("repository mandatos", () => {
  it("filters mandates by camara", async () => {
    const rows = await mockRepository.listMandatos({ camara: "senadores" });
    assert.ok(rows.length > 0);
    assert.ok(rows.every((m) => m.camara === "senadores"));
  });

  it("resolves a historical slug", async () => {
    const current = await mockRepository.resolveSlugRedirect("ejemplo-ana-viejo");
    assert.equal(current, "ejemplo-ana");
  });
});

describe("mock dataset constraints", () => {
  it("keeps unique source_dj_id values so Postgres can unique-index them", () => {
    const ids = declaracionesJson.map((d) => d.sourceDjId);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("listAllLegisladorSlugs matches a full unfiltered search", async () => {
    const slugs = await listAllLegisladorSlugs();
    const search = await mockRepository.searchLegisladores({ pageSize: 100 });
    assert.deepEqual(
      [...slugs].sort(),
      [...search.data.map((item) => item.slug)].sort(),
    );
  });
});
