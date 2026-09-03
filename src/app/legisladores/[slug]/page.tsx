import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { AvatarIniciales } from "@/components/ui/avatar-iniciales";
import { TablaBienes, TablaDeudas } from "@/components/perfil/composicion";
import { TablaEvolucion } from "@/components/perfil/evolucion";
import { FuenteDeclaracion, VistaToggle } from "@/components/perfil/fuente";
import { AniosNav, TimelineMandatos } from "@/components/perfil/mandatos";
import {
  getDeclaracion,
  getLegisladorBySlug,
  getSeriesMacro,
  resolveSlugRedirect,
  searchLegisladores,
} from "@/lib/data/cached";
import { isMockMode } from "@/lib/data/mode";
import { convertirMonto, IPC_ANIO_BASE } from "@/lib/domain/calculos";
import {
  formatArs,
  formatCamara,
  formatEstado,
  formatIpc,
  formatTipoDeclaracion,
  formatUsdApprox,
} from "@/lib/domain/formatters";
import { parsePerfilQuery, resolverAnioDeclaracion } from "@/lib/domain/perfil";
import type { VistaMonto } from "@/lib/domain/types";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

function formatVista(
  monto: number,
  anio: number,
  vista: VistaMonto,
  series: Awaited<ReturnType<typeof getSeriesMacro>>,
) {
  const converted = convertirMonto(monto, anio, vista, series, IPC_ANIO_BASE);
  if (vista === "ipc") return formatIpc(converted, IPC_ANIO_BASE);
  if (vista === "usd") return formatUsdApprox(converted);
  return formatArs(monto);
}

export async function generateStaticParams() {
  const result = await searchLegisladores({ page: 1, pageSize: 100 });
  return result.data.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const redirectTo = await resolveSlugRedirect(slug);
  if (redirectTo) permanentRedirect(`/legisladores/${redirectTo}`);
  const legislador = await getLegisladorBySlug(slug);
  if (!legislador) notFound();
  const title = legislador.persona.nombreCompleto;
  const description = `Declaraciones juradas patrimoniales de ${title}. Valores declarados en pesos del año fiscal, no de mercado.`;
  const canonical = `/legisladores/${slug}`;
  return {
    title: {
      absolute: `${title} · ${SITE_NAME}`,
    },
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url: canonical,
      locale: "es_AR",
      type: "profile",
    },
  };
}

export default async function PerfilPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = parsePerfilQuery(await searchParams);

  const redirectTo = await resolveSlugRedirect(slug);
  if (redirectTo) permanentRedirect(`/legisladores/${redirectTo}`);

  const legislador = await getLegisladorBySlug(slug);
  if (!legislador) notFound();

  const anios = legislador.declaraciones.map((d) => d.anioFiscal);
  const { anio, anioInvalido } = resolverAnioDeclaracion(
    anios,
    query.anioSolicitado,
    query.anioParam !== undefined,
  );
  const vista = query.vista;
  const series = await getSeriesMacro();
  const declaracion =
    anio !== null ? await getDeclaracion(legislador.persona.id, anio) : null;
  const mandatoActual = [...legislador.mandatos]
    .reverse()
    .find((m) => m.fin === null || m.fin >= new Date().toISOString().slice(0, 10));
  const mandatoMostrado = mandatoActual ?? legislador.mandatos.at(-1) ?? null;
  const mock = isMockMode();

  return (
    <article className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm">
        <Link href="/" className="text-accent underline underline-offset-2">
          Volver al explorador
        </Link>
      </p>
      <header className="mt-6 flex flex-col gap-4 border-b border-line pb-8 md:flex-row md:items-start">
        <AvatarIniciales
          nombre={legislador.persona.nombre}
          apellido={legislador.persona.apellido}
        />
        <div>
          <h1 className="font-serif text-4xl tracking-tight">
            {legislador.persona.nombreCompleto}
          </h1>
          <p className="mt-2 text-lg">
            {mandatoMostrado
              ? formatCamara(mandatoMostrado.camara)
              : "Legislador/a nacional"}
          </p>
          <p className="mt-1 text-ink-muted">
            {mandatoMostrado
              ? `${mandatoMostrado.distrito} · `
              : ""}
            {formatEstado(legislador.estado)}
            {mandatoMostrado?.bloque
              ? ` · ${mandatoMostrado.bloque}`
              : " · Bloque: No disponible"}
          </p>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Qué declaró esta persona y cómo evolucionaron las declaraciones
            disponibles.
          </p>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Trayectoria parlamentaria</h2>
        <div className="mt-4">
          <TimelineMandatos mandatos={legislador.mandatos} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Evolución de las declaraciones</h2>
        <p className="mt-2 max-w-3xl text-sm text-ink-muted">
          Valores declarados en pesos del año fiscal. Un año sin declaración se
          muestra como hueco; no se interpola ni se completa con cero. La
          variación nominal solo se calcula entre declaraciones anuales
          consecutivas y comparables.
        </p>
        <div className="mt-4">
          <TablaEvolucion evolucion={legislador.evolucion} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Declaración jurada</h2>
        {anios.length === 0 || !declaracion || anio === null ? (
          <div className="mt-4">
            <p className="text-ink-muted">
              Esta persona tiene mandatos cargados, pero no hay declaraciones
              juradas disponibles en los datos.
            </p>
            {mock ? (
              <p className="mt-3 text-sm text-ink-muted">
                Esta ficha usa datos ficticios de demostración. No corresponde a
                un expediente de la Oficina Anticorrupción.
              </p>
            ) : null}
          </div>
        ) : (
          <>
            {anioInvalido ? (
              <p
                role="status"
                className="mt-4 border border-warning/40 bg-warning-bg px-4 py-3 text-sm text-warning"
              >
                El año {query.anioParam} no figura entre las declaraciones
                disponibles. Se muestra la última declaración disponible (
                {anio}).
              </p>
            ) : null}
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <AniosNav slug={slug} anios={anios} seleccionado={anio} vista={vista} />
              <VistaToggle slug={slug} anio={anio} vista={vista} />
            </div>
            <p className="mt-4 max-w-3xl text-sm text-ink-muted">
              {vista === "nominal"
                ? "Los valores corresponden a declaraciones juradas y no representan necesariamente valores de mercado. Algunos bienes, como inmuebles y vehículos, pueden utilizar valuaciones fiscales u otros criterios del régimen de declaración. Cifras en pesos del año fiscal."
                : vista === "ipc"
                  ? `Pesos constantes de ${IPC_ANIO_BASE} usando un índice IPC de demostración. Es una aproximación, no una valuación de mercado.`
                  : "Equivalente aproximado al tipo de cambio de referencia BCRA (serie de demostración) al 31/12 del año fiscal. No es la métrica principal ni una valuación de mercado. No se usa dólar paralelo."}
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="border border-line bg-paper-raised p-4">
                <dt className="text-xs uppercase tracking-wide text-ink-muted">
                  Año fiscal
                </dt>
                <dd className="mt-1 font-medium">{anio}</dd>
              </div>
              <div className="border border-line bg-paper-raised p-4">
                <dt className="text-xs uppercase tracking-wide text-ink-muted">Tipo</dt>
                <dd className="mt-1 font-medium">
                  {formatTipoDeclaracion(declaracion.tipo)}
                  {declaracion.rectificativa > 0
                    ? ` · rectificativa ${declaracion.rectificativa}`
                    : ""}
                </dd>
              </div>
              <div className="border border-line bg-paper-raised p-4">
                <dt className="text-xs uppercase tracking-wide text-ink-muted">
                  Bienes declarados
                </dt>
                <dd className="mt-1 font-medium">
                  {formatVista(declaracion.bienesMostrados, anio, vista, series)}
                </dd>
              </div>
              <div className="border border-line bg-paper-raised p-4">
                <dt className="text-xs uppercase tracking-wide text-ink-muted">
                  Deudas declaradas
                </dt>
                <dd className="mt-1 font-medium">
                  {formatVista(declaracion.deudasMostradas, anio, vista, series)}
                </dd>
              </div>
              <div className="border border-line bg-paper-raised p-4">
                <dt className="text-xs uppercase tracking-wide text-ink-muted">
                  Patrimonio neto declarado
                </dt>
                <dd className="mt-1 font-medium">
                  {formatVista(declaracion.neto, anio, vista, series)}
                </dd>
              </div>
            </dl>
            {vista !== "nominal" ? (
              <p className="mt-6 text-sm text-ink-muted">
                El detalle de bienes y deudas se muestra en pesos nominales del
                año fiscal. La vista{" "}
                {vista === "ipc" ? "ajustada por IPC" : "en USD aproximado"}{" "}
                aplica al resumen de esta declaración, no a cada ítem.
              </p>
            ) : null}
            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              <div>
                <h3 className="font-serif text-xl">Bienes declarados</h3>
                <div className="mt-3">
                  <TablaBienes items={declaracion.bienesItems} />
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl">Deudas declaradas</h3>
                <div className="mt-3">
                  <TablaDeudas items={declaracion.deudasItems} />
                </div>
              </div>
            </div>
            <div className="mt-8">
              <FuenteDeclaracion declaracion={declaracion} mock={mock} />
            </div>
          </>
        )}
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: `${legislador.persona.nombre} ${legislador.persona.apellido}`,
            jobTitle: mandatoMostrado
              ? `${formatCamara(mandatoMostrado.camara)} · ${mandatoMostrado.distrito}`
              : "Legislador/a nacional",
            url: `${getSiteUrl()}/legisladores/${slug}`,
          }),
        }}
      />
    </article>
  );
}
