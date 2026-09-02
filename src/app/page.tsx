import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FiltrosExplorador } from "@/components/explorador/filtros";
import { TablaLegisladores } from "@/components/explorador/tabla";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import {
  listAniosDeclaracion,
  listDistritos,
  searchLegisladores,
} from "@/lib/data/cached";
import {
  explorerHref,
  hasActiveFilters,
  parseExplorerQuery,
  toSearchParams,
  type ExplorerQuery,
} from "@/lib/domain/explorador";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Explorador de legisladores",
  description:
    "Buscá y filtrá declaraciones juradas patrimoniales de diputados y senadores nacionales. Valores fiscales declarados, no de mercado.",
  alternates: { canonical: "/" },
};

function ResultadosFallback() {
  return <p className="text-ink-muted">Cargando listado…</p>;
}

async function Resultados({ query }: { query: ExplorerQuery }) {
  const result = await searchLegisladores(toSearchParams(query));

  if (query.page > result.meta.totalPages && result.meta.totalPages > 0) {
    redirect(explorerHref({ ...query, page: result.meta.totalPages }));
  }

  const makeHref = (page: number) => explorerHref({ ...query, page });
  const filtrosActivos = hasActiveFilters(query);

  return (
    <section aria-label="Resultados" className="mt-6">
      {result.data.length === 0 ? (
        <EmptyState title="No encontramos legisladores que coincidan con los filtros seleccionados.">
          <p>
            Probá con otro nombre o distrito, o ampliá cámara, estado o año.
          </p>
          {filtrosActivos ? (
            <p className="mt-5">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center bg-accent px-4 py-2 text-sm font-medium text-paper-raised hover:opacity-90"
              >
                Limpiar filtros
              </Link>
            </p>
          ) : null}
        </EmptyState>
      ) : (
        <>
          <p className="sr-only" aria-live="polite">
            {result.meta.total} legisladores encontrados. Página {result.meta.page}{" "}
            de {result.meta.totalPages}.
          </p>
          <TablaLegisladores items={result.data} query={query} />
          <Pagination
            page={result.meta.page}
            pageSize={result.meta.pageSize}
            total={result.meta.total}
            totalPages={result.meta.totalPages}
            makeHref={makeHref}
          />
        </>
      )}
    </section>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = parseExplorerQuery(await searchParams);
  const [distritos, anios] = await Promise.all([
    listDistritos(),
    listAniosDeclaracion(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          Congreso de la Nación · datos públicos
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight">
          ¿Qué legisladores aparecen en los datos disponibles?
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          Explorá las declaraciones juradas patrimoniales de diputados y senadores
          nacionales. Podés buscar, filtrar y compartir la dirección de esta
          página. Este sitio no es oficial, no estima fortunas de mercado y no
          extrae conclusiones políticas a partir de los números.
        </p>
      </header>
      <div className="mt-10">
        <FiltrosExplorador
          distritos={distritos}
          anios={anios}
          values={query}
        />
        <p className="mt-4 text-xs text-ink-muted">
          Valores declarados en pesos del año fiscal, habitualmente a valuación
          fiscal. No equivalen a patrimonio de mercado ni a precios actuales.
        </p>
        <Suspense fallback={<ResultadosFallback />}>
          <Resultados query={query} />
        </Suspense>
      </div>
    </div>
  );
}
