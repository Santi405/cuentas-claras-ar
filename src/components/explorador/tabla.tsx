import Link from "next/link";
import { formatArs, formatCamara, formatEstado } from "@/lib/domain/formatters";
import {
  explorerHref,
  toggleSort,
  type ExplorerQuery,
} from "@/lib/domain/explorador";
import type { LegisladorListItem } from "@/lib/domain/types";

function NetoCelda({
  value,
  anio,
}: {
  value: number | null;
  anio: number | null;
}) {
  if (value === null) return "n/d";
  return (
    <>
      <span>{formatArs(value)}</span>
      {anio !== null ? (
        <span className="mt-0.5 block text-xs text-ink-muted">
          pesos de {anio}
        </span>
      ) : null}
    </>
  );
}

function SortableHeader({
  label,
  field,
  query,
}: {
  label: string;
  field: "nombre" | "neto" | "anio";
  query: ExplorerQuery;
}) {
  const next = toggleSort(query.sort, field);
  const activeAsc = query.sort === field;
  const activeDesc = query.sort === `-${field}`;
  const ariaSort: "ascending" | "descending" | "none" = activeAsc
    ? "ascending"
    : activeDesc
      ? "descending"
      : "none";
  const hint = activeAsc
    ? "ordenado ascendente, cambiar a descendente"
    : activeDesc
      ? "ordenado descendente, cambiar a ascendente"
      : "ordenar";

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className="border-b border-line px-3 py-3 font-medium"
    >
      <Link
        href={explorerHref({ ...query, sort: next, page: 1 })}
        className={`inline-flex min-h-11 items-center hover:underline ${
          ariaSort !== "none" ? "text-ink" : "text-ink-muted"
        }`}
      >
        {label}
        <span className="sr-only"> ({hint})</span>
      </Link>
    </th>
  );
}

function CamposLegislador({ item }: { item: LegisladorListItem }) {
  return (
    <>
      <dt className="text-ink-muted">Cámara</dt>
      <dd>{formatCamara(item.camaraActual)}</dd>
      <dt className="text-ink-muted">Distrito</dt>
      <dd>{item.distritoActual ?? "n/d"}</dd>
      <dt className="text-ink-muted">Estado</dt>
      <dd>{formatEstado(item.estado)}</dd>
      <dt className="text-ink-muted">Última DDJJ</dt>
      <dd>{item.ultimoAnioDeclarado ?? "n/d"}</dd>
      <dt className="text-ink-muted">Patrimonio neto declarado</dt>
      <dd>
        <NetoCelda value={item.netoArs} anio={item.ultimoAnioDeclarado} />
      </dd>
    </>
  );
}

export function TablaLegisladores({
  items,
  query,
}: {
  items: LegisladorListItem[];
  query: ExplorerQuery;
}) {
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="mb-3 text-left font-serif text-lg text-ink">
            Legisladores nacionales y último patrimonio neto declarado
          </caption>
          <thead className="bg-paper-raised text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <SortableHeader label="Legislador" field="nombre" query={query} />
              <th
                scope="col"
                className="border-b border-line px-3 py-3 font-medium"
              >
                Cámara
              </th>
              <th
                scope="col"
                className="border-b border-line px-3 py-3 font-medium"
              >
                Distrito
              </th>
              <th
                scope="col"
                className="border-b border-line px-3 py-3 font-medium"
              >
                Estado
              </th>
              <SortableHeader label="Última DDJJ" field="anio" query={query} />
              <SortableHeader
                label="Patrimonio neto declarado"
                field="neto"
                query={query}
              />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="odd:bg-paper-raised/60">
                <th
                  scope="row"
                  className="border-b border-line px-3 py-3 font-medium"
                >
                  <Link
                    className="text-accent hover:underline"
                    href={`/legisladores/${item.slug}`}
                  >
                    {item.nombreCompleto}
                  </Link>
                </th>
                <td className="border-b border-line px-3 py-3">
                  {formatCamara(item.camaraActual)}
                </td>
                <td className="border-b border-line px-3 py-3">
                  {item.distritoActual ?? "n/d"}
                </td>
                <td className="border-b border-line px-3 py-3">
                  {formatEstado(item.estado)}
                </td>
                <td className="border-b border-line px-3 py-3">
                  {item.ultimoAnioDeclarado ?? "n/d"}
                </td>
                <td className="border-b border-line px-3 py-3">
                  <NetoCelda
                    value={item.netoArs}
                    anio={item.ultimoAnioDeclarado}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mb-3 font-serif text-lg md:hidden">
        Legisladores nacionales y último patrimonio neto declarado
      </h2>
      <ul className="grid gap-3 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="border border-line bg-paper-raised p-4">
            <Link
              className="font-serif text-lg text-accent hover:underline"
              href={`/legisladores/${item.slug}`}
            >
              {item.nombreCompleto}
            </Link>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <CamposLegislador item={item} />
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
