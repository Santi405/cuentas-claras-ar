import type { Metadata } from "next";
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
import {
  convertirMonto,
  IPC_ANIO_BASE,
} from "@/lib/domain/calculos";
import {
  formatArs,
  formatCamara,
  formatEstado,
  formatIpc,
  formatTipoDeclaracion,
  formatUsdApprox,
} from "@/lib/domain/formatters";
import { VISTAS_MONTO, type VistaMonto } from "@/lib/domain/types";
import { SITE_NAME } from "@/lib/site";

function isVista(v: string | undefined): v is VistaMonto {
  return !!v && (VISTAS_MONTO as readonly string[]).includes(v);
}

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
  const legislador = await getLegisladorBySlug(slug);
  if (!legislador) {
    return { title: "No encontrado" };
  }
  const title = legislador.persona.nombreCompleto;
  const description = `Declaraciones juradas patrimoniales de ${title}. Valores declarados, no de mercado.`;
  return {
    title,
    description,
    alternates: { canonical: `/legisladores/${slug}` },
    openGraph: { title: `${title} | ${SITE_NAME}`, description },
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
  const sp = await searchParams;
  const one = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const redirectTo = await resolveSlugRedirect(slug);
  if (redirectTo) permanentRedirect(`/legisladores/${redirectTo}`);

  const legislador = await getLegisladorBySlug(slug);
  if (!legislador) notFound();

  const anios = legislador.declaraciones.map((d) => d.anioFiscal);
  const anioParam = Number(one("anio"));
  const anio = anios.includes(anioParam) ? anioParam : (anios.at(-1) ?? null);
  const vistaQuery = one("vista");
  const vista: VistaMonto = isVista(vistaQuery) ? vistaQuery : "nominal";
  const series = await getSeriesMacro();
  const declaracion =
    anio !== null ? await getDeclaracion(legislador.persona.id, anio) : null;
  const mandatoActual = [...legislador.mandatos]
    .reverse()
    .find((m) => m.fin === null || m.fin >= new Date().toISOString().slice(0, 10));

  return (
    <article className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex flex-col gap-4 border-b border-line pb-8 md:flex-row md:items-center">
        <AvatarIniciales
          nombre={legislador.persona.nombre}
          apellido={legislador.persona.apellido}
        />
        <div>
          <h1 className="font-serif text-4xl tracking-tight">
            {legislador.persona.nombreCompleto}
          </h1>
          <p className="mt-2 text-ink-muted">
            {formatEstado(legislador.estado)}
            {mandatoActual
              ? ` · ${formatCamara(mandatoActual.camara)} · ${mandatoActual.distrito}`
              : ""}
            {mandatoActual?.bloque ? ` · ${mandatoActual.bloque}` : ""}
          </p>
          {legislador.cuit ? (
            <p className="mt-2 text-sm text-ink-muted">
              CUIT publicado por la fuente: {legislador.cuit}
            </p>
          ) : null}
        </div>
      </header>

      <section className="mt-8 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="font-serif text-2xl">Mandatos</h2>
          <div className="mt-4">
            <TimelineMandatos mandatos={legislador.mandatos} />
          </div>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Evolución declarada</h2>
          <div className="mt-4">
            <TablaEvolucion evolucion={legislador.evolucion} />
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Declaración jurada</h2>
        {anios.length === 0 || !declaracion || anio === null ? (
          <p className="mt-4 text-ink-muted">No hay declaraciones cargadas para esta persona.</p>
        ) : (
          <>
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <AniosNav slug={slug} anios={anios} seleccionado={anio} vista={vista} />
              <VistaToggle slug={slug} anio={anio} vista={vista} />
            </div>
            <p className="mt-4 text-sm text-ink-muted">
              {vista === "nominal"
                ? "Valores declarados en pesos del año fiscal. Habitualmente valuación fiscal, no de mercado."
                : vista === "ipc"
                  ? `Pesos constantes de ${IPC_ANIO_BASE} usando un índice IPC de demostración. Es una aproximación, no una valuación.`
                  : "Equivalente aproximado al tipo de cambio de referencia BCRA (serie de demostración) al 31/12 del año fiscal. No es poder adquisitivo ni valuación de mercado. No se usa dólar paralelo."}
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <dt className="text-xs uppercase tracking-wide text-ink-muted">Bienes</dt>
                <dd className="mt-1 font-medium">
                  {formatVista(declaracion.bienesMostrados, anio, vista, series)}
                </dd>
              </div>
              <div className="border border-line bg-paper-raised p-4">
                <dt className="text-xs uppercase tracking-wide text-ink-muted">Deudas</dt>
                <dd className="mt-1 font-medium">
                  {formatVista(declaracion.deudasMostradas, anio, vista, series)}
                </dd>
              </div>
              <div className="border border-line bg-paper-raised p-4">
                <dt className="text-xs uppercase tracking-wide text-ink-muted">Neto declarado</dt>
                <dd className="mt-1 font-medium">
                  {formatVista(declaracion.neto, anio, vista, series)}
                </dd>
              </div>
            </dl>
            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              <div>
                <h3 className="font-serif text-xl">Composición de bienes</h3>
                <div className="mt-3">
                  <TablaBienes items={declaracion.bienesItems} />
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl">Deudas</h3>
                <div className="mt-3">
                  <TablaDeudas items={declaracion.deudasItems} />
                </div>
              </div>
            </div>
            <div className="mt-8">
              <FuenteDeclaracion declaracion={declaracion} />
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
            jobTitle: mandatoActual
              ? `${formatCamara(mandatoActual.camara)} · ${mandatoActual.distrito}`
              : "Legislador/a nacional",
            url: `/legisladores/${slug}`,
          }),
        }}
      />
    </article>
  );
}
