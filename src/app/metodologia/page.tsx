import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metodología",
  description:
    "Fuentes, criterios, limitaciones y cómo se calculan los montos del portal DDJJ Congreso.",
  alternates: { canonical: "/metodologia" },
};

export default function MetodologiaPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl tracking-tight">Metodología</h1>
      <p className="mt-4 text-lg text-ink-muted">
        Este sitio reúne información pública sobre declaraciones juradas patrimoniales
        de diputados y senadores nacionales. No es una fuente oficial y no interpreta
        intenciones políticas.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl">Qué mostramos</h2>
        <p>
          Personas con mandato en la Cámara de Diputados o el Senado, actuales o
          históricos, y las DJPI que puedan asociárseles. No incluimos el resto de la
          administración pública ni el anexo de grupo familiar.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl">Fuentes</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Oficina Anticorrupción /{" "}
            <a
              className="text-accent underline underline-offset-2"
              href="https://datos.jus.gob.ar/dataset/declaraciones-juradas-patrimoniales-integrales"
            >
              dataset DJPI en datos.jus.gob.ar
            </a>
            : montos, bienes, deudas, identificador <code>dj_id</code>, CUIT.
          </li>
          <li>Cámara de Diputados y Senado: mandatos, distrito, bloque.</li>
          <li>Cámara Nacional Electoral: listas y agrupaciones (fase posterior).</li>
        </ul>
        <p>
          Ante un conflicto, el Congreso gana para mandato y bloque; la OA gana para
          montos y <code>dj_id</code>. Cada declaración guarda archivo, snapshot y hash.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl">Cómo se leen los montos</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Nominal ARS</strong> (predeterminado): lo publicado, en pesos del año
            fiscal.
          </li>
          <li>
            <strong>Neto</strong>: bienes menos deudas del mismo momento (cierre en
            anuales; inicio en iniciales).
          </li>
          <li>
            <strong>Variación interanual</strong>: solo entre declaraciones anuales
            consecutivas. Un año faltante no se rellena con cero ni se interpola.
          </li>
          <li>
            <strong>IPC</strong>: vista opcional a pesos constantes. Serie de demostración
            en el mock; en producción se documentará el índice INDEC y el año base.
          </li>
          <li>
            <strong>USD</strong>: vista opcional al tipo de cambio de referencia BCRA
            (Com. A 3500) al cierre del año. No se usa dólar blue, MEP ni CCL. No es una
            comparación económica perfecta.
          </li>
        </ul>
        <p>
          Inmuebles y rodados suelen declararse a <strong>valor fiscal</strong>, no de
          mercado. El importe de cada bien ya contempla el porcentaje de titularidad
          publicado por la OA: no se vuelve a multiplicar.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl">Identificación</h2>
        <p>
          Cada persona tiene un identificador interno estable (UUID) y un slug público
          <code className="ml-1">/legisladores/apellido-nombre</code>. El CUIT no forma
          parte de la URL. Si el slug cambia, se redirige el anterior.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl">Qué no entra</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Datos de cónyuges, convivientes o hijos (anexo reservado / grupo familiar).</li>
          <li>Rankings de “enriquecimiento” o comparaciones acusatorias.</li>
          <li>Scraping de HTML en el momento de la consulta.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl">Marco normativo de referencia</h2>
        <p>
          Ley 25.188 de Ética Pública, Ley 26.857, Decreto 164/99, Ley 27.275 de acceso a
          la información pública y Ley 25.326 de protección de datos personales. Quien
          consulta o republica declaraciones públicas permanece sujeto a esos límites.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl">Errores y correcciones</h2>
        <p>
          Si hay un error de matching o de carga, el dato correcto es siempre el de la
          fuente oficial. Este portal puede estar desactualizado o incompleto, sobre todo
          mientras opera con datos de demostración.
        </p>
      </section>
    </article>
  );
}
