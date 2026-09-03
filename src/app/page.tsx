import type { Metadata } from "next";
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
  ignoredExplorerParamLabels,
  parseExplorerQuery,
  toSearchParams,
  type ExplorerQuery,
} from "@/lib/domain/explorador";
import type { LegisladorListItem, Paginated } from "@/lib/domain/types";
import { StatusNotice } from "@/components/ui/status-notice";
import { SITE_NAME } from "@/lib/site";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: { absolute: `Explorador de legisladores | ${SITE_NAME}` },
  description:
    "Buscá y filtrá declaraciones juradas patrimoniales de diputados y senadores nacionales. Valores fiscales declarados, no de mercado.",
  alternates: { canonical: "/" },
  openGraph: {
    title: `Explorador de legisladores | ${SITE_NAME}`,
    description:
      "Buscá y filtrá declaraciones juradas patrimoniales de diputados y senadores nacionales. Valores fiscales declarados, no de mercado.",
    url: "/",
    locale: "es_AR",
    type: "website",
  },
};

function Resultados({
  query,
  result,
}: {
  query: ExplorerQuery;
  result: Paginated<LegisladorListItem>;
}) {
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
  const search = await searchParams;
  const query = parseExplorerQuery(search);
  const ignoredParams = ignoredExplorerParamLabels(search);
  const [distritos, anios, result] = await Promise.all([
    listDistritos(),
    listAniosDeclaracion(),
    searchLegisladores(toSearchParams(query)),
  ]);

  const resolvedQuery = { ...query, page: result.meta.page };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          Portal cívico de consulta
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight">
          ¿Qué legisladores aparecen en los datos disponibles?
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          Explorá las declaraciones juradas patrimoniales de diputados y senadores
          nacionales. Podés buscar, filtrar y compartir la dirección de esta
          página. Este sitio no es oficial, no estima valores de mercado y no
          extrae conclusiones políticas a partir de los números.
        </p>
      </header>
      <div className="mt-10">
        <FiltrosExplorador
          distritos={distritos}
          anios={anios}
          values={resolvedQuery}
        />
        {ignoredParams.length > 0 ? (
          <div className="mt-4">
            <StatusNotice>
              La dirección incluye parámetros no válidos (
              {ignoredParams.join(", ")}). Se ignoraron y se aplicó el criterio
              por defecto.
            </StatusNotice>
          </div>
        ) : null}
        <p className="mt-4 text-xs text-ink-muted">
          Valores declarados en pesos del año fiscal, habitualmente a valuación
          fiscal. No equivalen a patrimonio de mercado ni a precios actuales.{" "}
          <Link href="/metodologia#montos" className="underline underline-offset-2">
            Cómo se interpretan los montos
          </Link>
          .
        </p>
        <Resultados query={resolvedQuery} result={result} />
      </div>
    </div>
  );
}
