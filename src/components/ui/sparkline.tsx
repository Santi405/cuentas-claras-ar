import type { EvolucionAnual } from "@/lib/domain/types";

function hasNeto(
  punto: EvolucionAnual,
): punto is EvolucionAnual & { neto: number } {
  return !punto.faltante && punto.neto !== null;
}

export function Sparkline({
  puntos,
}: {
  puntos: EvolucionAnual[];
}) {
  const conDato = puntos.filter(hasNeto);
  if (conDato.length < 2) return null;

  const anios = puntos.map((p) => p.anioFiscal);
  const minAnio = Math.min(...anios);
  const maxAnio = Math.max(...anios);
  const spanAnios = maxAnio - minAnio || 1;
  const valores = conDato.map((p) => p.neto);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const span = max - min || 1;
  const w = 160;
  const h = 36;

  function point(p: EvolucionAnual & { neto: number }) {
    const x = ((p.anioFiscal - minAnio) / spanAnios) * w;
    const y = h - ((p.neto - min) / span) * h;
    return `${x},${y}`;
  }

  const segmentos: string[] = [];
  let actual: string[] = [];
  for (const p of puntos) {
    if (hasNeto(p)) {
      actual.push(point(p));
    } else if (actual.length) {
      if (actual.length >= 2) segmentos.push(actual.join(" "));
      actual = [];
    }
  }
  if (actual.length >= 2) segmentos.push(actual.join(" "));
  if (segmentos.length === 0) return null;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="text-accent motion-reduce:hidden"
      aria-hidden
    >
      {segmentos.map((points) => (
        <polyline
          key={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={points}
        />
      ))}
    </svg>
  );
}
