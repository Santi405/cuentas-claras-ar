"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CAMARAS, ESTADOS_LEGISLADOR, SORT_FIELDS } from "@/lib/domain/types";
import type { Distrito } from "@/lib/domain/types";
import { formatCamara, formatEstado } from "@/lib/domain/formatters";
import {
  explorerHref,
  formatSortLabel,
  type ExplorerQuery,
} from "@/lib/domain/explorador";

export function FiltrosExplorador({
  distritos,
  anios,
  values,
}: {
  distritos: Distrito[];
  anios: number[];
  values: ExplorerQuery;
}) {
  const router = useRouter();
  const formKey = explorerHref(values);

  function applyForm(form: HTMLFormElement) {
    const fd = new FormData(form);
    const href = explorerHref({
      q: String(fd.get("q") ?? ""),
      camara: String(fd.get("camara") ?? ""),
      estado: String(fd.get("estado") ?? ""),
      distrito: String(fd.get("distrito") ?? ""),
      anio: String(fd.get("anio") ?? ""),
      sort: String(fd.get("sort") ?? ""),
      page: 1,
    });
    router.push(href);
  }

  return (
    <form
      key={formKey}
      method="get"
      action="/"
      className="border border-line bg-paper-raised p-4"
      role="search"
      aria-label="Buscar legisladores"
      onSubmit={(event) => {
        event.preventDefault();
        applyForm(event.currentTarget);
      }}
      onChange={(event) => {
        if (event.target instanceof HTMLSelectElement) {
          event.currentTarget.requestSubmit();
        }
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="sm:col-span-2">
          <label
            htmlFor="q"
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-muted"
          >
            Búsqueda
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={values.q ?? ""}
            placeholder="Nombre, apellido o distrito"
            autoComplete="off"
            enterKeyHint="search"
            className="w-full border border-line bg-paper px-3 py-2 text-sm placeholder:text-ink-muted"
          />
        </div>
        <div>
          <label
            htmlFor="camara"
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-muted"
          >
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
          <label
            htmlFor="estado"
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-muted"
          >
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
          <label
            htmlFor="distrito"
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-muted"
          >
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
              <option key={d.slug} value={d.slug}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="anio"
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-muted"
          >
            Año de declaración
          </label>
          <select
            id="anio"
            name="anio"
            defaultValue={values.anio != null ? String(values.anio) : ""}
            className="w-full border border-line bg-paper px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {anios.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="sm:col-span-2">
          <label
            htmlFor="sort"
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-muted"
          >
            Orden
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={values.sort}
            className="w-full border border-line bg-paper px-3 py-2 text-sm"
          >
            {SORT_FIELDS.map((s) => (
              <option key={s} value={s}>
                {formatSortLabel(s)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-end gap-3 sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="min-h-11 bg-accent px-4 py-2 text-sm font-medium text-paper-raised hover:opacity-90"
          >
            Aplicar filtros
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-sm text-accent underline underline-offset-2 hover:opacity-90"
          >
            Limpiar filtros
          </Link>
        </div>
      </div>
    </form>
  );
}
