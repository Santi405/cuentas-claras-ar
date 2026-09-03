import type { EstadoLegislador, Mandato } from "./types";

export function todayIso(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function mandatoVigente(mandato: Mandato, today = todayIso()): boolean {
  return mandato.fin === null || mandato.fin >= today;
}

export function estadoDeMandatos(
  mandatos: Mandato[],
  today = todayIso(),
): EstadoLegislador {
  return mandatos.some((mandato) => mandatoVigente(mandato, today))
    ? "en_ejercicio"
    : "historico";
}

/** Latest-starting current mandate, otherwise latest-starting overall. */
export function mandatoActualDe(
  mandatos: Mandato[],
  today = todayIso(),
): Mandato | null {
  const sorted = [...mandatos].sort((a, b) => a.inicio.localeCompare(b.inicio));
  return (
    sorted.filter((mandato) => mandatoVigente(mandato, today)).at(-1) ??
    sorted.at(-1) ??
    null
  );
}
