import { CAMARAS, ESTADOS_LEGISLADOR, SORT_FIELDS } from "@/lib/domain/types";
import { formatCamara, formatEstado } from "@/lib/domain/formatters";

export function FiltrosExplorador({
  distritos,
  values,
}: {
  distritos: string[];
  values: {
    q?: string;
    camara?: string;
    distrito?: string;
    estado?: string;
    anio?: string;
    sort?: string;
  };
}) {
  return (
    <form
      method="get"
      className="grid gap-3 border border-line bg-paper-raised p-4 md:grid-cols-6"
      role="search"
      aria-label="Buscar legisladores"
    >
      <div className="md:col-span-2">
        <label htmlFor="q" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-muted">
          Nombre
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={values.q ?? ""}
          placeholder="Apellido o nombre"
          className="w-full border border-line bg-paper px-3 py-2 text-sm placeholder:text-ink-muted"
        />
      </div>
      <div>
        <label htmlFor="camara" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-muted">
          Cámara
        </label>
        <select
          id="camara"
          name="camara"
          defaultValue={values.camara ?? ""}
          className="w-full border border-line bg-paper px-3 py-2 text-sm"
        >
          <option value="">Todas</option>
          {CAMARAS.map((c) => (
            <option key={c} value={c}>
              {formatCamara(c)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="distrito" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-muted">
          Distrito
        </label>
        <select
          id="distrito"
          name="distrito"
          defaultValue={values.distrito ?? ""}
          className="w-full border border-line bg-paper px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          {distritos.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="estado" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-muted">
          Estado
        </label>
        <select
          id="estado"
          name="estado"
          defaultValue={values.estado ?? ""}
          className="w-full border border-line bg-paper px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          {ESTADOS_LEGISLADOR.map((e) => (
            <option key={e} value={e}>
              {formatEstado(e)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="sort" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-muted">
          Orden
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={values.sort ?? "nombre"}
          className="w-full border border-line bg-paper px-3 py-2 text-sm"
        >
          {SORT_FIELDS.map((s) => (
            <option key={s} value={s}>
              {s === "nombre"
                ? "Nombre A–Z"
                : s === "-nombre"
                  ? "Nombre Z–A"
                  : s === "neto"
                    ? "Neto (menor)"
                    : s === "-neto"
                      ? "Neto (mayor)"
                      : s === "anio"
                        ? "Año (menor)"
                        : "Año (mayor)"}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end md:col-span-6">
        <button
          type="submit"
          className="min-h-11 bg-accent px-4 py-2 text-sm font-medium text-paper-raised hover:opacity-90"
        >
          Aplicar filtros
        </button>
      </div>
    </form>
  );
}
