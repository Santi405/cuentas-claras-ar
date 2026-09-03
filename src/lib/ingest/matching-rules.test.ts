import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Persona } from "@/lib/domain/types";
import { decideMatch, nameOnlyNeverAutoMatch } from "./matching-rules";

const ana: Persona = {
  id: "persona-ana",
  apellido: "Ejemplo",
  nombre: "Ana",
  slug: "ejemplo-ana",
  cuit: "20000000028",
  fechaNacimiento: null,
  fotoUrl: null,
};

describe("matching rules", () => {
  it("auto-matches only a valid CUIT that already belongs to the person", () => {
    const decision = decideMatch({
      funcionarioApellidoNombre: "Ejemplo, Ana",
      organismo: "H. Camara de Diputados de la Nacion",
      cargo: "Diputada nacional",
      cuitRaw: "20000000028",
      existingByCuit: ana,
      nameCandidates: [ana],
    });
    assert.equal(decision.action, "auto_match");
    assert.equal(decision.reason, "cuit_exacto");
    assert.equal(decision.personId, ana.id);
  });

  it("never auto-matches on name alone", () => {
    const missing = decideMatch({
      funcionarioApellidoNombre: "Ejemplo, Ana",
      organismo: "H. Camara de Diputados de la Nacion",
      cargo: "Diputada nacional",
      cuitRaw: "",
      existingByCuit: null,
      nameCandidates: [ana],
    });
    assert.equal(missing.action, "review");
    assert.equal(missing.reason, "cuit_ausente");
    assert.equal(nameOnlyNeverAutoMatch([ana]).action, "review");
  });

  it("does not auto-match an invalid CUIT", () => {
    const decision = decideMatch({
      funcionarioApellidoNombre: "Ejemplo, Ana",
      organismo: "H. Camara de Diputados de la Nacion",
      cargo: "Diputada nacional",
      cuitRaw: "20123456789",
      existingByCuit: ana,
      nameCandidates: [ana],
    });
    assert.equal(decision.action, "review");
    assert.equal(decision.reason, "cuit_invalid_checksum");
  });

  it("sends unknown valid CUITs to review instead of creating a person", () => {
    const decision = decideMatch({
      funcionarioApellidoNombre: "Ejemplo, Ana",
      organismo: "H. Camara de Diputados de la Nacion",
      cargo: "Diputada nacional",
      cuitRaw: "20-00000002-8",
      existingByCuit: null,
      nameCandidates: [ana],
    });
    assert.equal(decision.action, "review");
    assert.equal(decision.reason, "cuit_sin_persona");
  });

  it("reviews CUIT matches whose names do not align", () => {
    const other: Persona = { ...ana, apellido: "Otra", nombre: "Persona" };
    const decision = decideMatch({
      funcionarioApellidoNombre: "Ejemplo, Ana",
      organismo: "H. Camara de Diputados de la Nacion",
      cargo: "Diputada nacional",
      cuitRaw: "20000000028",
      existingByCuit: other,
      nameCandidates: [other],
    });
    assert.equal(decision.action, "review");
    assert.equal(decision.reason, "cuit_nombre_discrepante");
  });

  it("skips rows outside the congressional recorte", () => {
    const decision = decideMatch({
      funcionarioApellidoNombre: "Ministerio, Persona",
      organismo: "Ministerio de Economia",
      cargo: "Directora nacional",
      cuitRaw: "20000000028",
      existingByCuit: ana,
      nameCandidates: [ana],
    });
    assert.equal(decision.action, "skip");
    assert.equal(decision.reason, "fuera_de_recorte_congreso");
  });
});
