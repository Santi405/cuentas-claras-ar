import type { EvolucionAnual } from "@/lib/domain/types";

function hasNeto(
  punto: EvolucionAnual,
): punto is EvolucionAnual & { neto: number } {
  return punto.neto !== null;
}

export function Sparkline({
  puntos,
}: {
  puntos: EvolucionAnual[];
}) {
  const valores = puntos.filter(hasNeto);
  if (valores.length < 2) return null;
  const min = Math.min(...valores.map((p) => p.neto));
  const max = Math.max(...valores.map((p) => p.neto));
  const span = max - min || 1;
  const w = 160;
  const h = 36;
  const coords = valores
    .map((p, i) => {
      const x = (i / (valores.length - 1)) * w;
      const y = h - ((p.neto - min) / span) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="text-accent motion-reduce:hidden"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={coords}
      />
    </svg>
  );
}
