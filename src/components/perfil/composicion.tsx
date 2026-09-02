import { formatArs } from "@/lib/domain/formatters";
import type { Bien, Deuda } from "@/lib/domain/types";

export function TablaBienes({ items }: { items: Bien[] }) {
  const total = items.reduce((s, i) => s + i.importeArs, 0);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="mb-2 text-left text-xs text-ink-muted">
          Bienes declarados. Importes en ARS; la titularidad ya está aplicada en el monto
          publicado. Valuación según régimen DJPI (habitualmente fiscal, no de mercado).
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
              Importe
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
  );
}

export function TablaDeudas({ items }: { items: Deuda[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">No hay deudas itemizadas en esta declaración.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="mb-2 text-left text-xs text-ink-muted">
          Deudas declaradas, en pesos del año fiscal.
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
              Importe
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="border-b border-line py-2 pr-3">{item.tipo}</td>
              <td className="border-b border-line py-2 pr-3">{item.descripcion}</td>
              <td className="border-b border-line py-2 pr-3">{item.radicacion ?? "n/d"}</td>
              <td className="border-b border-line py-2">{formatArs(item.importeArs)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComposicionBarras({ items }: { items: Bien[] }) {
  const total = items.reduce((s, i) => s + i.importeArs, 0);
  if (total <= 0) return null;
  return (
    <ul className="mt-4 space-y-2" aria-hidden>
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
