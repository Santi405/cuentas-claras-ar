import { Sparkline } from "@/components/ui/sparkline";
import { variacionInteranual } from "@/lib/domain/calculos";
import { formatArs, formatPercent, formatTipoDeclaracion } from "@/lib/domain/formatters";
import type { EvolucionAnual } from "@/lib/domain/types";

function VariacionCelda({
  evolucion,
  anio,
  faltante,
}: {
  evolucion: EvolucionAnual[];
  anio: number;
  faltante: boolean;
}) {
  if (faltante) return "n/d";
  const valor = variacionInteranual(evolucion, anio);
  if (valor === null) return "n/d";
  return formatPercent(valor);
}

function CamposEvolucion({
  row,
  evolucion,
}: {
  row: EvolucionAnual;
  evolucion: EvolucionAnual[];
}) {
  return (
    <>
      <dt className="text-ink-muted">Bienes declarados</dt>
      <dd>{row.faltante ? "n/d" : formatArs(row.bienes)}</dd>
      <dt className="text-ink-muted">Deudas declaradas</dt>
      <dd>{row.faltante ? "n/d" : formatArs(row.deudas)}</dd>
      <dt className="text-ink-muted">Patrimonio neto declarado</dt>
      <dd>{row.faltante ? "n/d" : formatArs(row.neto)}</dd>
      <dt className="text-ink-muted">Variación nominal</dt>
      <dd>
        <VariacionCelda
          evolucion={evolucion}
          anio={row.anioFiscal}
          faltante={row.faltante}
        />
      </dd>
    </>
  );
}

export function TablaEvolucion({ evolucion }: { evolucion: EvolucionAnual[] }) {
  if (evolucion.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No hay declaraciones disponibles para armar una evolución.
      </p>
    );
  }
  return (
    <div>
      <Sparkline puntos={evolucion} />
      <div className="mt-4 hidden md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="mb-2 text-left text-xs text-ink-muted">
            Evolución de los valores declarados en pesos del año fiscal. Los años
            sin declaración no se interpolan ni se reemplazan por cero. La
            variación nominal solo se calcula entre declaraciones anuales
            consecutivas y comparables.
          </caption>
          <thead className="text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th scope="col" className="border-b border-line py-2 pr-3 font-medium">
                Año
              </th>
              <th scope="col" className="border-b border-line py-2 pr-3 font-medium">
                Bienes
              </th>
              <th scope="col" className="border-b border-line py-2 pr-3 font-medium">
                Deudas
              </th>
              <th scope="col" className="border-b border-line py-2 pr-3 font-medium">
                Patrimonio neto
              </th>
              <th scope="col" className="border-b border-line py-2 font-medium">
                Variación nominal
              </th>
            </tr>
          </thead>
          <tbody>
            {evolucion.map((row) => (
              <tr key={row.anioFiscal}>
                <th
                  scope="row"
                  className="border-b border-line py-2 pr-3 font-medium"
                >
                  {row.anioFiscal}
                  {row.faltante ? (
                    <span className="mt-0.5 block text-xs font-normal text-ink-muted">
                      año sin declaración
                    </span>
                  ) : null}
                  {row.tipo && !row.faltante ? (
                    <span className="mt-0.5 block text-xs font-normal text-ink-muted">
                      {formatTipoDeclaracion(row.tipo)}
                    </span>
                  ) : null}
                  {row.rectificativa > 0 ? (
                    <span className="mt-0.5 block text-xs font-normal text-ink-muted">
                      rectificativa {row.rectificativa}
                    </span>
                  ) : null}
                </th>
                <td className="border-b border-line py-2 pr-3">
                  {row.faltante ? "n/d" : formatArs(row.bienes)}
                </td>
                <td className="border-b border-line py-2 pr-3">
                  {row.faltante ? "n/d" : formatArs(row.deudas)}
                </td>
                <td className="border-b border-line py-2 pr-3">
                  {row.faltante ? "n/d" : formatArs(row.neto)}
                </td>
                <td className="border-b border-line py-2">
                  <VariacionCelda
                    evolucion={evolucion}
                    anio={row.anioFiscal}
                    faltante={row.faltante}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-4 grid gap-3 md:hidden">
        {evolucion.map((row) => (
          <li key={row.anioFiscal} className="border border-line bg-paper-raised p-4">
            <p className="font-medium">
              {row.anioFiscal}
              {row.faltante ? " · año sin declaración" : ""}
              {row.tipo && !row.faltante
                ? ` · ${formatTipoDeclaracion(row.tipo)}`
                : ""}
              {row.rectificativa > 0
                ? ` · rectificativa ${row.rectificativa}`
                : ""}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <CamposEvolucion row={row} evolucion={evolucion} />
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
