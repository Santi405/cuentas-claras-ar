import { formatArs, formatPercent } from "@/lib/domain/formatters";
import { Sparkline } from "@/components/ui/sparkline";
import { variacionInteranual } from "@/lib/domain/calculos";
import type { EvolucionAnual } from "@/lib/domain/types";

export function TablaEvolucion({ evolucion }: { evolucion: EvolucionAnual[] }) {
  if (evolucion.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No hay serie de declaraciones para mostrar.
      </p>
    );
  }
  return (
    <div>
      <Sparkline puntos={evolucion} />
      <table className="mt-4 w-full border-collapse text-left text-sm">
        <caption className="mb-2 text-left text-xs text-ink-muted">
          Patrimonio neto declarado en ARS nominales. Los años sin declaración no se
          interpolan. La variación solo se calcula entre anuales consecutivas.
        </caption>
        <thead className="text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th scope="col" className="border-b border-line py-2 pr-3 font-medium">
              Año
            </th>
            <th scope="col" className="border-b border-line py-2 pr-3 font-medium">
              Neto declarado
            </th>
            <th scope="col" className="border-b border-line py-2 font-medium">
              Variación
            </th>
          </tr>
        </thead>
        <tbody>
          {evolucion.map((row) => (
            <tr key={row.anioFiscal}>
              <th scope="row" className="border-b border-line py-2 pr-3 font-medium">
                {row.anioFiscal}
              </th>
              <td className="border-b border-line py-2 pr-3">
                {row.faltante ? "Sin declaración" : formatArs(row.neto)}
              </td>
              <td className="border-b border-line py-2">
                {row.faltante
                  ? "—"
                  : formatPercent(variacionInteranual(evolucion, row.anioFiscal))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
