import type { Metadata } from "next";
import Link from "next/link";
import { SectionNav } from "@/components/editorial/section-nav";
import { isFictionalData } from "@/lib/data/mode";

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
  { id: "api", label: "API v1" },
  { id: "descargas", label: "Descargas" },
  { id: "reporte", label: "Cómo reportar un error" },
] as const;

const linkClass = "text-accent underline underline-offset-2";

export default function DatosPage() {
  const mock = isFictionalData();

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
            <strong>CUIT:</strong> identificador de matching interno. No forma
            parte de la URL pública, no se usa para consultar la API y no se
            incluye en las respuestas JSON públicas.
          </li>
        </ul>
        <p>
          El CUIT no se promociona como clave de consulta ciudadana. Sirve para
          asociar declaraciones y mandatos cuando las fuentes lo permiten.
        </p>
      </section>

      <section id="api" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">API v1</h2>
        <p>
          Lectura pública, JSON, versionada por path. Usa el mismo repositorio
          que las páginas. Las páginas del sitio no la consultan por HTTP.
        </p>
        {mock ? (
          <p>
            Opera sobre datos ficticios de demostración. No debe usarse para
            informar sobre personas reales.
          </p>
        ) : null}
        <h3 className="font-serif text-xl tracking-tight">Endpoints</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link className={linkClass} href="/api/v1/legisladores" rel="nofollow">
              GET /api/v1/legisladores
            </Link>
          </li>
          <li>GET /api/v1/legisladores/[slug o UUID interno]</li>
          <li>GET /api/v1/legisladores/[slug o UUID interno]/ddjj</li>
          <li>GET /api/v1/legisladores/[slug o UUID interno]/mandatos</li>
        </ul>
        <p>
          El identificador público preferido es el slug. El UUID puede usarse
          porque aparece en <code>id</code>. El CUIT no es una clave de URL ni
          de consulta.
        </p>
        <h3 className="font-serif text-xl tracking-tight">Listado</h3>
        <p>Parámetros opcionales:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <code>q</code> — texto de búsqueda (nombre, apellido o distrito)
          </li>
          <li>
            <code>camara</code> — <code>diputados</code> o{" "}
            <code>senadores</code>
          </li>
          <li>
            <code>estado</code> — <code>en_ejercicio</code> o{" "}
            <code>historico</code>
          </li>
          <li>
            <code>distrito</code> — nombre o slug (por ejemplo{" "}
            <code>caba</code>)
          </li>
          <li>
            <code>anio</code> — año fiscal de una declaración disponible
          </li>
          <li>
            <code>page</code> — entero ≥ 1 (default 1)
          </li>
          <li>
            <code>page_size</code> — 1 a 100 (default 20)
          </li>
          <li>
            <code>sort</code> — <code>nombre</code>, <code>-nombre</code>,{" "}
            <code>neto</code>, <code>-neto</code>, <code>anio</code>,{" "}
            <code>-anio</code> (default <code>nombre</code>)
          </li>
        </ul>
        <p>
          Un parámetro presente y inválido responde <code>400</code>. Los
          omitidos usan el default. El listado incluye personas en ejercicio y
          históricas; <code>estado</code> es el modo de limitarlo. Si{" "}
          <code>page</code> supera <code>total_pages</code>, se responde la
          última página disponible.
        </p>
        <h3 className="font-serif text-xl tracking-tight">Ejemplo</h3>
        <pre className="overflow-x-auto border border-line bg-paper-raised p-4 text-sm">
          {`GET /api/v1/legisladores?camara=senadores&page=1&page_size=20

{
  "data": [
    {
      "id": "…",
      "slug": "demostracion-juan",
      "nombre_completo": "Demostración, Juan",
      "camara_actual": "senadores",
      "distrito_actual": "Córdoba",
      "estado": "en_ejercicio",
      "ultimo_anio_declarado": 2023,
      "neto_ars": 72000000
    }
  ],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 1,
    "total_pages": 1
  }
}`}
        </pre>
        <p className="text-sm text-ink-muted">
          Los montos del ejemplo son ilustrativos. <code>neto_ars</code> es el
          patrimonio neto declarado en pesos del último año disponible, o{" "}
          <code>null</code> si no hay declaración.
        </p>
        <h3 className="font-serif text-xl tracking-tight">Errores</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <code>400</code> — <code>INVALID_QUERY</code> (parámetro inválido)
          </li>
          <li>
            <code>404</code> — <code>NOT_FOUND</code> (legislador inexistente)
          </li>
          <li>
            <code>500</code> — error inesperado del servidor
          </li>
        </ul>
        <pre className="overflow-x-auto border border-line bg-paper-raised p-4 text-sm">
          {`{
  "error": {
    "code": "INVALID_QUERY",
    "message": "El parámetro sort no es válido."
  }
}`}
        </pre>
        <h3 className="font-serif text-xl tracking-tight">Límites actuales</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>Solo GET. No hay autenticación ni cupos de uso.</li>
          <li>
            CORS cerrado: pensada para consumo server-to-server o same-origin.
            Se puede revisar si aparece un consumidor cross-origin concreto.
          </li>
          <li>No hay descargas masivas ni series macroeconómicas oficiales.</li>
          <li>
            No se documentan aquí otras rutas internas o de transición que no
            forman parte de este contrato.
          </li>
        </ul>
      </section>

      <section id="descargas" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">Descargas</h2>
        <p>
          No hay, por ahora, un CSV ni un JSON consolidados de este portal. No
          se publican archivos que simulen un dataset oficial.
        </p>
        <p>
          Las descargas de un dataset consolidado se habilitarán después de una
          primera ingesta real reproducible, con snapshot versionado, schema
          documentado, provenance y validaciones pasadas. Formatos previstos:
          CSV y JSON. Licencia propuesta para el dataset derivado:{" "}
          <strong>CC BY 4.0</strong>, con atribución a las fuentes originales.
        </p>
        <p>
          Hasta entonces no hay botones de descarga que apunten a archivos
          inexistentes. El código del sitio se publica bajo licencia MIT. Este
          sitio no reemplaza a las fuentes oficiales.
        </p>
      </section>

      <section id="reporte" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">
          Cómo reportar un error
        </h2>
        <p>
          El canal previsto es{" "}
          <a
            className={linkClass}
            href="https://github.com/Santi405/cuentas-claras-ar/issues/new/choose"
          >
            GitHub Issues
          </a>
          . Hay plantillas para dato posiblemente incorrecto, identificación
          incorrecta, declaración faltante, problema de fuente y bug técnico.
        </p>
        <p>
          No hay formulario propio ni autenticación en este sitio. Una
          corrección futura debe dejar rastro de la fuente y del cambio.
        </p>
      </section>
    </article>
  );
}
