import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mockRepository } from "./mock/adapter";
import { postgresRepository } from "./postgres/adapter";
import type { LegisladorRepository } from "./repository";
import type { LegisladorSearchParams } from "@/lib/domain/types";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

function roundPct(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 1e6) / 1e6;
}

function comparableList(repoResult: Awaited<ReturnType<LegisladorRepository["searchLegisladores"]>>) {
  return {
    meta: repoResult.meta,
    data: repoResult.data.map((item) => ({
      slug: item.slug,
      nombreCompleto: item.nombreCompleto,
      camaraActual: item.camaraActual,
      distritoActual: item.distritoActual,
      bloqueActual: item.bloqueActual,
      estado: item.estado,
      ultimoAnioDeclarado: item.ultimoAnioDeclarado,
      netoArs: item.netoArs,
      variacionNominalPct: roundPct(item.variacionNominalPct),
    })),
  };
}

async function assertSearchEqual(params: LegisladorSearchParams) {
  const [mock, postgres] = await Promise.all([
    mockRepository.searchLegisladores(params),
    postgresRepository.searchLegisladores(params),
  ]);
  assert.deepEqual(comparableList(postgres), comparableList(mock));
}

describeIfDb("mock vs postgres explorer", () => {
  it("matches without filters", async () => {
    await assertSearchEqual({ pageSize: 100, sort: "nombre" });
  });

  it("matches name search", async () => {
    await assertSearchEqual({ q: "ana", pageSize: 100, sort: "nombre" });
  });

  it("matches camara", async () => {
    await assertSearchEqual({
      camara: "senadores",
      pageSize: 100,
      sort: "nombre",
    });
  });

  it("matches estado", async () => {
    await assertSearchEqual({
      estado: "historico",
      pageSize: 100,
      sort: "nombre",
    });
  });

  it("matches distrito", async () => {
    await assertSearchEqual({
      distrito: "santa-fe",
      pageSize: 100,
      sort: "nombre",
    });
  });

  it("matches anio", async () => {
    await assertSearchEqual({ anio: 2024, pageSize: 100, sort: "nombre" });
  });

  it("matches sort by neto", async () => {
    await assertSearchEqual({ sort: "-neto", pageSize: 100 });
  });

  it("matches page 2", async () => {
    await assertSearchEqual({ page: 2, pageSize: 12, sort: "nombre" });
  });

  it("matches a combined query", async () => {
    await assertSearchEqual({
      q: "ana",
      camara: "senadores",
      distrito: "santa-fe",
      anio: 2024,
      sort: "-neto",
      page: 1,
      pageSize: 12,
    });
  });
});

describeIfDb("mock vs postgres profiles", () => {
  it("matches ejemplo-ana including the 2021 gap", async () => {
    const [mock, postgres] = await Promise.all([
      mockRepository.getLegisladorBySlug("ejemplo-ana"),
      postgresRepository.getLegisladorBySlug("ejemplo-ana"),
    ]);
    assert.ok(mock);
    assert.ok(postgres);
    assert.equal(postgres.persona.slug, mock.persona.slug);
    assert.equal(postgres.estado, mock.estado);
    assert.equal(postgres.mandatos.length, mock.mandatos.length);
    assert.deepEqual(
      postgres.declaraciones.map((d) => ({
        anio: d.anioFiscal,
        tipo: d.tipo,
        rectificativa: d.rectificativa,
        neto: d.neto,
      })),
      mock.declaraciones.map((d) => ({
        anio: d.anioFiscal,
        tipo: d.tipo,
        rectificativa: d.rectificativa,
        neto: d.neto,
      })),
    );
    assert.deepEqual(
      postgres.evolucion.map((row) => ({
        anio: row.anioFiscal,
        faltante: row.faltante,
        neto: row.neto,
      })),
      mock.evolucion.map((row) => ({
        anio: row.anioFiscal,
        faltante: row.faltante,
        neto: row.neto,
      })),
    );
  });

  it("returns null for a missing slug", async () => {
    const [mock, postgres] = await Promise.all([
      mockRepository.getLegisladorBySlug("no-existe"),
      postgresRepository.getLegisladorBySlug("no-existe"),
    ]);
    assert.equal(mock, null);
    assert.equal(postgres, null);
  });

  it("matches multiple mandates", async () => {
    const [mock, postgres] = await Promise.all([
      mockRepository.getLegisladorBySlug("demostracion-juan"),
      postgresRepository.getLegisladorBySlug("demostracion-juan"),
    ]);
    assert.deepEqual(
      postgres?.mandatos.map((m) => ({
        camara: m.camara,
        distrito: m.distrito,
        inicio: m.inicio,
        fin: m.fin,
      })),
      mock?.mandatos.map((m) => ({
        camara: m.camara,
        distrito: m.distrito,
        inicio: m.inicio,
        fin: m.fin,
      })),
    );
  });

  it("matches a rectificativa year", async () => {
    const [mock, postgres] = await Promise.all([
      mockRepository.getLegisladorBySlug("ensayo-sofia"),
      postgresRepository.getLegisladorBySlug("ensayo-sofia"),
    ]);
    const mockYear = mock?.declaraciones.find((d) => d.anioFiscal === 2023);
    const pgYear = postgres?.declaraciones.find((d) => d.anioFiscal === 2023);
    assert.equal(pgYear?.rectificativa, 1);
    assert.equal(pgYear?.neto, mockYear?.neto);
  });
});
