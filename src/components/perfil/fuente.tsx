import Link from "next/link";
import type { DeclaracionDetalle, VistaMonto } from "@/lib/domain/types";

export function FuenteDeclaracion({
  declaracion,
}: {
  declaracion: DeclaracionDetalle;
}) {
  return (
    <section className="border border-line bg-paper-raised p-4 text-sm">
      <h2 className="font-serif text-lg">Fuente</h2>
      <p className="mt-2 text-ink-muted">
        {declaracion.fuente.nombre}. Snapshot {declaracion.fuente.snapshotDate}.
        Archivo {declaracion.fuente.archivo}.
        {declaracion.sourceDjId ? ` Identificador de origen dj_id ${declaracion.sourceDjId}.` : ""}
      </p>
      {declaracion.fuente.url ? (
        <p className="mt-2">
          <a
            className="text-accent underline underline-offset-2"
            href={declaracion.fuente.url}
          >
            Ver dataset original
          </a>
        </p>
      ) : null}
      <p className="mt-2 text-xs text-ink-muted">
        Hash SHA-256: <code>{declaracion.fuente.archivoHash}</code>
      </p>
    </section>
  );
}

export function VistaToggle({
  slug,
  anio,
  vista,
}: {
  slug: string;
  anio: number;
  vista: VistaMonto;
}) {
  const opciones: Array<{ id: VistaMonto; label: string }> = [
    { id: "nominal", label: "Nominal ARS" },
    { id: "ipc", label: "Ajustado por IPC" },
    { id: "usd", label: "USD (aprox.)" },
  ];
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-ink-muted">Vista de montos</p>
      <div className="flex flex-wrap gap-2">
        {opciones.map((o) => (
          <Link
            key={o.id}
            href={`/legisladores/${slug}?anio=${anio}&vista=${o.id}`}
            aria-current={vista === o.id ? "page" : undefined}
            className={
              vista === o.id
                ? "bg-ink px-3 py-1 text-sm text-paper-raised"
                : "border border-line px-3 py-1 text-sm hover:bg-accent-soft"
            }
          >
            {o.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
