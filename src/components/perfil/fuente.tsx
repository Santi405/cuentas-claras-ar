import Link from "next/link";
import { perfilHref } from "@/lib/domain/perfil";
import type { DeclaracionDetalle, VistaMonto } from "@/lib/domain/types";

export function FuenteDeclaracion({
  declaracion,
  mock,
}: {
  declaracion: DeclaracionDetalle;
  mock: boolean;
}) {
  return (
    <section className="border border-line bg-paper-raised p-4 text-sm">
      <h3 className="font-serif text-lg">Procedencia de los datos</h3>
      {mock ? (
        <>
          <p className="mt-2 text-ink-muted">
            Esta ficha usa datos ficticios de demostración. Las personas, los
            montos y los identificadores no corresponden a funcionarios reales ni
            a un expediente de la Oficina Anticorrupción.
          </p>
          <p className="mt-2 text-ink-muted">
            Snapshot de demostración {declaracion.fuente.snapshotDate}. Archivo{" "}
            {declaracion.fuente.archivo}.
            {declaracion.sourceDjId
              ? ` Identificador interno de demostración ${declaracion.sourceDjId}.`
              : ""}
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 text-ink-muted">
            {declaracion.fuente.nombre}. Snapshot {declaracion.fuente.snapshotDate}.
            Archivo {declaracion.fuente.archivo}.
            {declaracion.sourceDjId
              ? ` Identificador de origen dj_id ${declaracion.sourceDjId}.`
              : ""}
          </p>
          {declaracion.fuente.url ? (
            <p className="mt-2">
              <a
                className="text-accent underline underline-offset-2"
                href={declaracion.fuente.url}
              >
                Ver fuente original de esta declaración
              </a>
            </p>
          ) : null}
        </>
      )}
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
      <p
        id="vista-montos-label"
        className="mb-2 text-xs uppercase tracking-wide text-ink-muted"
      >
        Vista de montos
      </p>
      <div
        role="group"
        aria-labelledby="vista-montos-label"
        className="flex flex-wrap gap-2"
      >
        {opciones.map((o) => (
          <Link
            key={o.id}
            href={perfilHref(slug, anio, o.id)}
            aria-current={vista === o.id ? "page" : undefined}
            className={
              vista === o.id
                ? "inline-flex min-h-11 items-center bg-ink px-3 py-2 text-sm text-paper-raised"
                : "inline-flex min-h-11 items-center border border-line px-3 py-2 text-sm hover:bg-accent-soft"
            }
          >
            {o.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
