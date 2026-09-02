import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datos abiertos",
  description:
    "API y recorte de datos del portal DDJJ Congreso. Sin grupo familiar.",
  alternates: { canonical: "/datos" },
};

export default function DatosPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl tracking-tight">Datos abiertos</h1>
      <p className="mt-4 text-lg text-ink-muted">
        El recorte de este portal cubre legisladores nacionales y sus DJPI asociadas.
        No republicamos grupo familiar ni el anexo reservado.
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="font-serif text-2xl">API v1</h2>
        <p>Lectura pública, JSON, versionada por path.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link className="text-accent underline" href="/api/v1/legisladores">
              GET /api/v1/legisladores
            </Link>
          </li>
          <li>
            GET /api/v1/legisladores/[id o slug]
          </li>
          <li>
            GET /api/v1/legisladores/[id o slug]/ddjj
          </li>
          <li>
            <Link className="text-accent underline" href="/api/v1/ddjj">
              GET /api/v1/ddjj
            </Link>
          </li>
          <li>
            <Link className="text-accent underline" href="/api/v1/mandatos">
              GET /api/v1/mandatos
            </Link>
          </li>
        </ul>
        <p className="text-sm text-ink-muted">
          Query params del listado: <code>q</code>, <code>camara</code>,{" "}
          <code>distrito</code>, <code>estado</code>, <code>anio</code>,{" "}
          <code>page</code>, <code>page_size</code>, <code>sort</code>.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-serif text-2xl">Campos</h2>
        <p>
          Personas (id, slug, nombre, apellido, CUIT si la fuente lo publica), mandatos,
          declaraciones con totales y provenance, bienes y deudas itemizados. El CUIT no
          se usa como clave de URL.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-serif text-2xl">Licencia y atribución</h2>
        <p>
          El código de este sitio se publica bajo MIT. Los datos de origen siguen la
          política del dataset DJPI y deben atribuirse a la Oficina Anticorrupción /
          Ministerio de Justicia. Este sitio no reemplaza a la fuente oficial.
        </p>
        <p>
          Dataset de referencia:{" "}
          <a
            className="text-accent underline"
            href="https://datos.jus.gob.ar/dataset/declaraciones-juradas-patrimoniales-integrales"
          >
            declaraciones juradas patrimoniales integrales
          </a>
          .
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: "DDJJ Congreso — recorte de legisladores nacionales",
            description:
              "Declaraciones juradas patrimoniales de diputados y senadores nacionales, con provenance. Sin grupo familiar.",
            license: "https://opensource.org/licenses/MIT",
            creator: { "@type": "Organization", name: "DDJJ Congreso" },
          }),
        }}
      />
    </article>
  );
}
