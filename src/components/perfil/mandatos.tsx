import Link from "next/link";
import {
  formatCamara,
  formatMonthYear,
} from "@/lib/domain/formatters";
import type { Mandato } from "@/lib/domain/types";

export function TimelineMandatos({ mandatos }: { mandatos: Mandato[] }) {
  if (mandatos.length === 0) {
    return (
      <p className="text-sm text-ink-muted">No hay mandatos cargados para esta persona.</p>
    );
  }
  return (
    <ol className="space-y-3 border-l-2 border-line pl-4">
      {mandatos.map((m) => (
        <li key={m.id} className="relative">
          <span
            aria-hidden
            className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full bg-accent"
          />
          <p className="font-medium">
            {formatCamara(m.camara)} · {m.distrito}
          </p>
          <p className="text-sm text-ink-muted">
            {formatMonthYear(m.inicio)} — {m.fin ? formatMonthYear(m.fin) : "vigente"}
            {m.bloque ? ` · ${m.bloque}` : ""}
            {m.interbloque ? ` · ${m.interbloque}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function AniosNav({
  slug,
  anios,
  seleccionado,
  vista,
}: {
  slug: string;
  anios: number[];
  seleccionado: number;
  vista: string;
}) {
  return (
    <nav aria-label="Año fiscal" className="flex flex-wrap gap-2">
      {anios.map((anio) => {
        const active = anio === seleccionado;
        const href = `/legisladores/${slug}?anio=${anio}${vista !== "nominal" ? `&vista=${vista}` : ""}`;
        return (
          <Link
            key={anio}
            href={href}
            aria-current={active ? "true" : undefined}
            className={
              active
                ? "inline-flex min-h-11 items-center bg-accent px-3 py-2 text-sm text-paper-raised"
                : "inline-flex min-h-11 items-center border border-line px-3 py-2 text-sm hover:bg-accent-soft"
            }
          >
            {anio}
          </Link>
        );
      })}
    </nav>
  );
}
