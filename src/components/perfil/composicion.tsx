import { formatArs } from "@/lib/domain/formatters";
import type { Bien, Deuda } from "@/lib/domain/types";

export function TablaBienes({ items }: { items: Bien[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No hay bienes detallados disponibles para esta declaración.
      </p>
    );
  }
  const total = items.reduce((s, i) => s + i.importeArs, 0);
  const nota =
    "Bienes declarados en pesos del año fiscal. La titularidad ya está aplicada en el monto publicado. Habitualmente valuación fiscal, no de mercado.";
  return (
    <>
      <p className="mb-2 text-xs text-ink-muted md:hidden">{nota}</p>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="mb-2 text-left text-xs text-ink-muted">
            {nota}
          </caption>
          <thead className="text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th scope="col" className="border-b border-line py-2 pr-3 font-medium">
                Tipo
              </th>
              <th scope="col" className="border-b border-line py-2 pr-3 font-medium">
                Descripción
              </th>
              <th scope="col" className="border-b border-line py-2 pr-3 font-medium">
                Titularidad
              </th>
              <th scope="col" className="border-b border-line py-2 font-medium">
                Importe declarado
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="border-b border-line py-2 pr-3">{item.tipo ?? "n/d"}</td>
                <td className="border-b border-line py-2 pr-3">{item.descripcion}</td>
                <td className="border-b border-line py-2 pr-3">
                  {item.titularidadPct !== null ? `${item.titularidadPct} %` : "n/d"}
                </td>
                <td className="border-b border-line py-2">{formatArs(item.importeArs)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3} className="pt-2 font-medium">
                Suma de ítems
              </th>
              <td className="pt-2 font-medium">{formatArs(total)}</td>
            </tr>
          </tfoot>
        </table>
        <ComposicionBarras items={items} />
      </div>
      <ul className="grid gap-3 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="border border-line bg-paper-raised p-4">
            <p className="font-medium">{item.descripcion}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <dt className="text-ink-muted">Tipo</dt>
              <dd>{item.tipo ?? "n/d"}</dd>
              <dt className="text-ink-muted">Titularidad</dt>
              <dd>
                {item.titularidadPct !== null ? `${item.titularidadPct} %` : "n/d"}
              </dd>
              <dt className="text-ink-muted">Importe declarado</dt>
              <dd>{formatArs(item.importeArs)}</dd>
            </dl>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm font-medium md:hidden">
        Suma de ítems: {formatArs(total)}
      </p>
    </>
  );
}

export function TablaDeudas({ items }: { items: Deuda[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No hay deudas detalladas disponibles para esta declaración. Eso no
        implica que el registro esté incompleto.
      </p>
    );
  }
  const nota =
    "Deudas declaradas en pesos del año fiscal. Una declaración sin deudas detalladas no implica que el registro esté incompleto.";
  return (
    <>
      <p className="mb-2 text-xs text-ink-muted md:hidden">{nota}</p>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="mb-2 text-left text-xs text-ink-muted">
            {nota}
          </caption>
          <thead className="text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th scope="col" className="border-b border-line py-2 pr-3 font-medium">
                Tipo
              </th>
              <th scope="col" className="border-b border-line py-2 pr-3 font-medium">
                Descripción
              </th>
              <th scope="col" className="border-b border-line py-2 pr-3 font-medium">
                Radicación
              </th>
              <th scope="col" className="border-b border-line py-2 font-medium">
                Importe declarado
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="border-b border-line py-2 pr-3">{item.tipo}</td>
                <td className="border-b border-line py-2 pr-3">{item.descripcion}</td>
                <td className="border-b border-line py-2 pr-3">
                  {item.radicacion ?? "n/d"}
                </td>
                <td className="border-b border-line py-2">{formatArs(item.importeArs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="grid gap-3 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="border border-line bg-paper-raised p-4">
            <p className="font-medium">{item.descripcion}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <dt className="text-ink-muted">Tipo</dt>
              <dd>{item.tipo}</dd>
              <dt className="text-ink-muted">Radicación</dt>
              <dd>{item.radicacion ?? "n/d"}</dd>
              <dt className="text-ink-muted">Importe declarado</dt>
              <dd>{formatArs(item.importeArs)}</dd>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

function ComposicionBarras({ items }: { items: Bien[] }) {
  const total = items.reduce((s, i) => s + i.importeArs, 0);
  if (total <= 0) return null;
  return (
    <ul className="mt-4 space-y-2 motion-reduce:hidden" aria-hidden>
      {items.map((item) => {
        const pct = Math.max(0, (item.importeArs / total) * 100);
        return (
          <li key={item.id}>
            <p className="mb-1 text-xs text-ink-muted">
              {item.tipo ?? "Bien"} · {pct.toFixed(0)}%
            </p>
            <div className="h-2 bg-line">
              <div className="h-2 bg-accent" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
