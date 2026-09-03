import type { Persona } from "@/lib/domain/types";
import { parseCuit } from "./cuit";
import { looksLikeLegisladorNacional, normalizeNombre } from "./matching";

export type MatchAction = "auto_match" | "review" | "skip";

export type MatchDecision = {
  action: MatchAction;
  reason: string;
  personId?: string;
  cuitCanonical?: string;
};

export function personaNameKeys(persona: Persona): string[] {
  return [
    normalizeNombre(`${persona.apellido} ${persona.nombre}`),
    normalizeNombre(`${persona.nombre} ${persona.apellido}`),
    normalizeNombre(`${persona.apellido}, ${persona.nombre}`),
  ];
}

function namesAlign(funcionarioApellidoNombre: string, persona: Persona): boolean {
  const key = normalizeNombre(funcionarioApellidoNombre.replace(/,/g, " "));
  return personaNameKeys(persona).includes(key);
}

/**
 * Deterministic matching for a DJPI row against an existing person index.
 * Name similarity is never sufficient for auto-match.
 * A valid CUIT only auto-matches an existing person with that same CUIT
 * whose name also aligns. Filling a null CUIT, merging, or changing a slug
 * is always review.
 */
export function decideMatch(input: {
  funcionarioApellidoNombre: string;
  organismo: string;
  cargo: string;
  cuitRaw: string | number | null | undefined;
  existingByCuit: Persona | null;
  nameCandidates: Persona[];
}): MatchDecision {
  if (!looksLikeLegisladorNacional(input.organismo, input.cargo)) {
    return { action: "skip", reason: "fuera_de_recorte_congreso" };
  }

  const parsed = parseCuit(input.cuitRaw);
  if (!parsed.ok && parsed.reason === "empty") {
    return { action: "review", reason: "cuit_ausente" };
  }
  if (!parsed.ok) {
    return { action: "review", reason: `cuit_${parsed.reason}` };
  }

  const person = input.existingByCuit;
  if (!person) {
    return {
      action: "review",
      reason: "cuit_sin_persona",
      cuitCanonical: parsed.canonical,
    };
  }
  if (!person.cuit || person.cuit !== parsed.canonical) {
    return {
      action: "review",
      reason: "contradiccion_cuit",
      personId: person.id,
      cuitCanonical: parsed.canonical,
    };
  }
  if (!namesAlign(input.funcionarioApellidoNombre, person)) {
    return {
      action: "review",
      reason: "cuit_nombre_discrepante",
      personId: person.id,
      cuitCanonical: parsed.canonical,
    };
  }
  return {
    action: "auto_match",
    reason: "cuit_exacto",
    personId: person.id,
    cuitCanonical: parsed.canonical,
  };
}

export function nameOnlyNeverAutoMatch(nameCandidates: Persona[]): MatchDecision {
  if (nameCandidates.length > 1) {
    return { action: "review", reason: "homonimo" };
  }
  if (nameCandidates.length === 1) {
    return { action: "review", reason: "cuit_ausente" };
  }
  return { action: "review", reason: "sin_match" };
}
