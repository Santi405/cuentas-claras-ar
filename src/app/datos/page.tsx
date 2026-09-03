import type { Metadata } from "next";
import Link from "next/link";
import { SectionNav } from "@/components/editorial/section-nav";
import { isMockMode } from "@/lib/data/mode";

export const metadata: Metadata = {
  title: "Datos abiertos",
  description:
    "Alcance, exclusiones e identificadores del recorte público de DDJJ Congreso. API de demostración sobre datos ficticios.",
  alternates: { canonical: "/datos" },
  openGraph: {
    title: "Datos abiertos",
    description:
      "Alcance, exclusiones e identificadores del recorte público de DDJJ Congreso. API de demostración sobre datos ficticios.",
    url: "/datos",
    locale: "es_AR",
    type: "website",
  },
};

const SECTIONS = [
  { id: "alcance", label: "Alcance de los futuros datos" },
  { id: "exclusiones", label: "Exclusiones" },
  { id: "identificadores", label: "Identificadores" },
  { id: "api", label: "API de demostración" },
  { id: "descargas", label: "Descargas" },
] as const;

const linkClass = "text-accent underline underline-offset-2";

export default function DatosPage() {
  const mock = isMockMode();

  return (
    <article className="editorial-article mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl tracking-tight">Datos abiertos</h1>
      <p className="mt-4 text-lg text-ink-muted">
        Esta página describe el recorte de información del portal: qué se
        pretende publicar, qué queda afuera y cómo se identifican las personas.
        No es el catálogo de un dataset consolidado ni la documentación de un
        producto de API ya publicado.
      </p>
      {mock ? (
        <p className="mt-4 text-sm text-ink-muted">
          El sitio opera con datos ficticios. Nada de lo que sigue debe leerse
          como un volcado de la Oficina Anticorrupción ni como un conjunto
          oficial de declaraciones juradas.
        </p>
      ) : null}

      <SectionNav items={SECTIONS} />

      <section id="alcance" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">
          Alcance de los futuros datos
        </h2>
        <p>
          El recorte previsto cubre legisladores nacionales y la información
          patrimonial que pueda asociárseles. En términos conceptuales:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Personas:</strong> quienes tienen o tuvieron mandato en la
            Cámara de Diputados o en el Senado.
          </li>
          <li>
            <strong>Mandatos:</strong> cámara, distrito, fechas, bloque e
            interbloque cuando existan.
          </li>
          <li>
            <strong>Declaraciones:</strong> año fiscal, tipo, rectificativa y
            totales declarados.
          </li>
          <li>
            <strong>Bienes y deudas:</strong> ítems publicados en la declaración,
            no una valuación de mercado.
          </li>
          <li>
            <strong>Datos derivados:</strong> patrimonio neto y variaciones solo
            cuando las reglas de comparabilidad lo permiten. Se calculan a
            partir de los valores disponibles; no son un campo declarado.
          </li>
          <li>
            <strong>Procedencia:</strong> fuente, archivo, snapshot y hash,
            cuando existan, para que un dato pueda rastrearse.
          </li>
        </ul>
        <p>
          Cómo deben leerse esos campos está en{" "}
          <Link href="/metodologia" className={linkClass}>
            Metodología
          </Link>
          . Esta página no repite esas reglas.
        </p>
      </section>

      <section id="exclusiones" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">Exclusiones</h2>
        <p>No forman parte del dataset público consolidado previsto:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>grupo familiar ni patrimonio familiar agregado;</li>
          <li>información reservada o de acceso restringido;</li>
          <li>inferencias sobre precios de mercado o patrimonio “real”;</li>
          <li>perfiles generados mediante inteligencia artificial;</li>
          <li>
            datos personales innecesarios para identificar a la persona con
            mandato y mostrar su declaración (por ejemplo, domicilio o
            fotografía).
          </li>
        </ul>
      </section>

      <section id="identificadores" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">Identificadores</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>UUID:</strong> identificador interno estable. No se usa como
            dirección pública.
          </li>
          <li>
            <strong>Slug:</strong> identificador de la URL pública, del tipo{" "}
            <code>/legisladores/apellido-nombre</code>. Si un slug cambia, el
            anterior puede redirigir al vigente.
          </li>
          <li>
            <strong>CUIT:</strong> identificador de matching. Puede aparecer en
            una ficha si la fuente lo publica. No forma parte de la URL pública
            y no se usa para inventar identificadores nuevos.
          </li>
        </ul>
        <p>
          El CUIT no se promociona como clave de consulta ciudadana. Sirve para
          asociar declaraciones y mandatos cuando las fuentes lo permiten.
        </p>
      </section>

      <section id="api" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">API de demostración</h2>
        <p>
          Existe una API de lectura sobre el mismo repositorio que usan las
          páginas. Las páginas del sitio no la consultan por HTTP: leen el
          repositorio en el servidor.
        </p>
        {mock ? (
          <p>
            En el estado actual es una API de demostración sobre datos ficticios.
            No es un servicio de datos abiertos publicado, no tiene garantía de
            estabilidad y no debe usarse como fuente para informar sobre
            personas reales.
          </p>
        ) : null}
        <p>Rutas disponibles hoy:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link className={linkClass} href="/api/v1/legisladores" rel="nofollow">
              GET /api/v1/legisladores
            </Link>
          </li>
          <li>GET /api/v1/legisladores/[id o slug]</li>
          <li>GET /api/v1/legisladores/[id o slug]/ddjj</li>
          <li>
            <Link className={linkClass} href="/api/v1/ddjj" rel="nofollow">
              GET /api/v1/ddjj
            </Link>
          </li>
          <li>
            <Link className={linkClass} href="/api/v1/mandatos" rel="nofollow">
              GET /api/v1/mandatos
            </Link>
          </li>
        </ul>
        <p className="text-sm text-ink-muted">
          Parámetros del listado de legisladores: <code>q</code>,{" "}
          <code>camara</code>, <code>distrito</code>, <code>estado</code>,{" "}
          <code>anio</code>, <code>page</code>, <code>page_size</code>,{" "}
          <code>sort</code>. Respuesta JSON, solo GET.
        </p>
        <p>
          No se documentan aquí endpoints, formatos ni descargas que todavía no
          existen.
        </p>
      </section>

      <section id="descargas" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">Descargas</h2>
        <p>
          No hay, por ahora, un CSV ni un JSON consolidados de este portal. No
          se publican archivos que simulen un dataset oficial.
        </p>
        <p>
          Las descargas de datos consolidados se habilitarán cuando exista una
          versión publicada y documentada del proceso de ingesta. Hasta entonces,
          esta página describe el recorte; no entrega un volcado.
        </p>
        <p>
          El código del sitio se publica bajo licencia MIT. Los datos de origen,
          cuando existan, seguirán la política de la fuente oficial y deberán
          atribuirse a esa fuente. Este sitio no la reemplaza.
        </p>
      </section>
    </article>
  );
}
