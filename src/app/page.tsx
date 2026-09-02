import { Suspense } from "react";
import { FiltrosExplorador } from "@/components/explorador/filtros";
import { TablaLegisladores } from "@/components/explorador/tabla";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { listDistritos, searchLegisladores } from "@/lib/data/cached";
import type { Camara, EstadoLegislador, SortField } from "@/lib/domain/types";
import { CAMARAS, ESTADOS_LEGISLADOR, SORT_FIELDS } from "@/lib/domain/types";

function isCamara(v: string | undefined): v is Camara {
  return !!v && (CAMARAS as readonly string[]).includes(v);
}
function isEstado(v: string | undefined): v is EstadoLegislador {
  return !!v && (ESTADOS_LEGISLADOR as readonly string[]).includes(v);
}
function isSort(v: string | undefined): v is SortField {
  return !!v && (SORT_FIELDS as readonly string[]).includes(v);
}

async function Resultados({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const q = one("q")?.trim() || undefined;
  const camara = one("camara");
  const distrito = one("distrito") || undefined;
  const estado = one("estado");
  const anioRaw = one("anio");
  const sort = one("sort");
  const page = Number(one("page") ?? "1") || 1;

  const params = {
    q,
    camara: isCamara(camara) ? camara : undefined,
    distrito,
    estado: isEstado(estado) ? estado : undefined,
    anio: anioRaw ? Number(anioRaw) : undefined,
    sort: isSort(sort) ? sort : "nombre",
    page,
    pageSize: 25,
  };

  const [result, distritos] = await Promise.all([
    searchLegisladores(params),
    listDistritos(),
  ]);

  const makeHref = (nextPage: number) => {
    const usp = new URLSearchParams();
    if (q) usp.set("q", q);
    if (params.camara) usp.set("camara", params.camara);
    if (distrito) usp.set("distrito", distrito);
    if (params.estado) usp.set("estado", params.estado);
    if (params.sort) usp.set("sort", params.sort);
    usp.set("page", String(nextPage));
    const qs = usp.toString();
    return qs ? `/?${qs}` : "/";
  };

  const filtroResumen = [
    q ? `nombre “${q}”` : null,
    params.camara,
    distrito,
    params.estado,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <FiltrosExplorador
        distritos={distritos}
        values={{
          q,
          camara: params.camara,
          distrito,
          estado: params.estado,
          sort: params.sort,
        }}
      />
      <p className="mt-4 text-xs text-ink-muted">
        Los montos son valores declarados en pesos del año fiscal, habitualmente a
        valuación fiscal. No equivalen a patrimonio de mercado.
      </p>
      <div className="mt-6">
        {result.data.length === 0 ? (
          <EmptyState title="Ningún legislador coincide con esos filtros">
            <p>
              {filtroResumen
                ? `Probá ampliar la búsqueda. Filtros actuales: ${filtroResumen}.`
                : "No hay datos para mostrar."}
            </p>
          </EmptyState>
        ) : (
          <>
            <TablaLegisladores items={result.data} />
            <Pagination
              page={result.meta.page}
              pageSize={result.meta.pageSize}
              total={result.meta.total}
              makeHref={makeHref}
            />
          </>
        )}
      </div>
    </>
  );
}

export default function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          Congreso de la Nación · datos públicos
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight">
          ¿Qué declararon diputados y senadores?
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          Explorá las declaraciones juradas patrimoniales de legisladores nacionales.
          Este sitio no es oficial, no estima fortunas de mercado y no extrae
          conclusiones políticas a partir de los números.
        </p>
      </header>
      <div className="mt-10">
        <Suspense fallback={<p className="text-ink-muted">Cargando listado…</p>}>
          <Resultados searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
