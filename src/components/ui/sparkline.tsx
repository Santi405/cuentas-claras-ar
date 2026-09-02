import type { EvolucionAnual } from "@/lib/domain/types";

export function Sparkline({
  puntos,
}: {
  puntos: EvolucionAnual[];
}) {
  const valores = puntos.filter((p) => p.neto !== null).map((p) => p.neto as number);
  if (valores.length < 2) return null;
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const span = max - min || 1;
  const w = 160;
  const h = 36;
  const coords = puntos
    .filter((p) => p.neto !== null)
    .map((p, i, arr) => {
      const x = (i / (arr.length - 1)) * w;
      const y = h - ((p.neto! - min) / span) * h;
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
