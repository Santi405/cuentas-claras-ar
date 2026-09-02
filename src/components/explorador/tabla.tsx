import Link from "next/link";
import {
  formatArs,
  formatCamara,
  formatEstado,
  formatPercent,
} from "@/lib/domain/formatters";
import type { LegisladorListItem } from "@/lib/domain/types";

export function TablaLegisladores({ items }: { items: LegisladorListItem[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto border border-line md:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Legisladores nacionales y último patrimonio neto declarado en pesos del año
            fiscal, valores fiscales
          </caption>
          <thead className="bg-paper-raised text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th scope="col" className="border-b border-line px-3 py-3 font-medium">
                Legislador/a
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 font-medium">
                Cámara
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 font-medium">
                Distrito
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 font-medium">
                Estado
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 font-medium">
                Último año
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 font-medium">
                Neto declarado (ARS)
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 font-medium">
                Variación vs año previo
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="odd:bg-paper-raised/60">
                <th scope="row" className="border-b border-line px-3 py-3 font-medium">
                  <Link className="text-accent hover:underline" href={`/legisladores/${item.slug}`}>
                    {item.nombreCompleto}
                  </Link>
                </th>
                <td className="border-b border-line px-3 py-3">{formatCamara(item.camaraActual)}</td>
                <td className="border-b border-line px-3 py-3">{item.distritoActual ?? "n/d"}</td>
                <td className="border-b border-line px-3 py-3">{formatEstado(item.estado)}</td>
                <td className="border-b border-line px-3 py-3">{item.ultimoAnioDeclarado ?? "n/d"}</td>
                <td className="border-b border-line px-3 py-3">{formatArs(item.netoArs)}</td>
                <td className="border-b border-line px-3 py-3">
                  {formatPercent(item.variacionNominalPct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="grid gap-3 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="border border-line bg-paper-raised p-4">
            <Link className="font-serif text-lg text-accent" href={`/legisladores/${item.slug}`}>
              {item.nombreCompleto}
            </Link>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <dt className="text-ink-muted">Cámara</dt>
              <dd>{formatCamara(item.camaraActual)}</dd>
              <dt className="text-ink-muted">Distrito</dt>
              <dd>{item.distritoActual ?? "n/d"}</dd>
              <dt className="text-ink-muted">Estado</dt>
              <dd>{formatEstado(item.estado)}</dd>
              <dt className="text-ink-muted">Último año</dt>
              <dd>{item.ultimoAnioDeclarado ?? "n/d"}</dd>
              <dt className="text-ink-muted">Neto (ARS)</dt>
              <dd>{formatArs(item.netoArs)}</dd>
              <dt className="text-ink-muted">Variación</dt>
              <dd>{formatPercent(item.variacionNominalPct)}</dd>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
