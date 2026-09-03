import type { Metadata } from "next";
import Link from "next/link";
import { SectionNav } from "@/components/editorial/section-nav";
import { isMockMode } from "@/lib/data/mode";

export const metadata: Metadata = {
  title: "Metodología",
  description:
    "Cómo interpretar el portal DDJJ Congreso: qué muestra, qué no muestra, cómo se leen los montos y cuáles son sus límites.",
  alternates: { canonical: "/metodologia" },
  openGraph: {
    title: "Metodología",
    description:
      "Cómo interpretar el portal DDJJ Congreso: qué muestra, qué no muestra, cómo se leen los montos y cuáles son sus límites.",
    url: "/metodologia",
    locale: "es_AR",
    type: "website",
  },
};

const SECTIONS = [
  { id: "que-es", label: "Qué es este portal" },
  { id: "que-muestra", label: "Qué datos muestra" },
  { id: "que-no-muestra", label: "Qué no muestra" },
  { id: "montos", label: "Cómo interpretar los montos" },
  { id: "evolucion", label: "Evolución patrimonial" },
  { id: "monedas", label: "Monedas y conversiones" },
  { id: "fuentes", label: "Fuentes y trazabilidad" },
  { id: "matching", label: "Matching de personas" },
  { id: "grupo-familiar", label: "Por qué no se incluye el grupo familiar" },
  { id: "conceptos-politicos", label: "Partido, agrupación, bloque e interbloque" },
  { id: "errores", label: "Cómo reportar errores" },
] as const;

const linkClass = "text-accent underline underline-offset-2";

export default function MetodologiaPage() {
  const mock = isMockMode();

  return (
    <article className="editorial-article mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl tracking-tight">Metodología</h1>
      <p className="mt-4 text-lg text-ink-muted">
        Esta página explica cómo debe leerse la información del portal. El
        objetivo es que los números se interpreten con precisión, sin
        convertirlos en acusaciones ni en una valuación de mercado.
      </p>
      {mock ? (
        <p className="mt-4 text-sm text-ink-muted">
          El sitio opera hoy con datos ficticios de demostración. Las reglas de
          lectura que siguen son las del producto; no describen un expediente
          real ni un dataset oficial ya publicado por este portal.
        </p>
      ) : null}

      <SectionNav items={SECTIONS} />

      <section id="que-es" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">Qué es este portal</h2>
        <p>
          DDJJ Congreso es una herramienta de consulta y exploración. Organiza
          información patrimonial declarada de diputados y senadores nacionales
          para que pueda leerse, filtrarse y compartirse.
        </p>
        <p>No es una fuente oficial. No reemplaza a los registros públicos de origen.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>No constituye una investigación judicial ni periodística.</li>
          <li>No formula acusaciones ni califica la conducta de una persona.</li>
          <li>
            No interpreta de manera automática un cambio en los valores
            declarados como un hecho ilícito, un enriquecimiento o una pérdida
            real.
          </li>
        </ul>
        <p>
          El lenguaje del sitio es deliberadamente descriptivo. Un aumento o una
          baja en el patrimonio neto declarado es un dato de la declaración, no
          una conclusión sobre el origen o el destino de esos bienes.
        </p>
      </section>

      <section id="que-muestra" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">Qué datos muestra</h2>
        <p>El recorte cubre, de forma conceptual:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>personas con mandatos legislativos nacionales, actuales o históricos;</li>
          <li>declaraciones juradas patrimoniales disponibles en el conjunto de datos;</li>
          <li>bienes y deudas itemizados cuando la fuente los publica;</li>
          <li>
            patrimonio neto derivado de esos valores, en el momento que
            corresponde a cada tipo de declaración;
          </li>
          <li>
            evolución temporal cuando existen declaraciones metodológicamente
            comparables;
          </li>
          <li>mandatos y contexto parlamentario (cámara, distrito, bloque).</li>
        </ul>
        <p>
          El alcance histórico no está fijado de antemano. Dependerá de las
          fuentes disponibles y del proceso de asociación (matching) entre
          personas, mandatos y declaraciones. Un período vacío en el portal no
          prueba que el período no exista en el mundo real.
        </p>
      </section>

      <section id="que-no-muestra" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">Qué no muestra</h2>
        <p>Este portal no incluye:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>información del grupo familiar (cónyuges, convivientes o hijas e hijos);</li>
          <li>patrimonio familiar agregado;</li>
          <li>datos reservados o de acceso restringido;</li>
          <li>información obtenida mediante scraping no autorizado;</li>
          <li>
            inferencias sobre el patrimonio real de mercado de una persona o de
            un bien;
          </li>
          <li>
            acusaciones, rankings de “enriquecimiento” o calificaciones sobre
            la conducta de una persona;
          </li>
          <li>perfiles generados mediante inteligencia artificial.</li>
        </ul>
        <p>
          Tampoco cubre el resto de la administración pública. El recorte es el
          Congreso nacional.
        </p>
      </section>

      <section id="montos" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">
          Cómo interpretar los montos
        </h2>
        <h3 className="font-serif text-xl tracking-tight">Valores declarados</h3>
        <p>
          Los montos representan valores declarados en las declaraciones
          juradas. No son sinónimo de riqueza real, de precio de mercado ni de
          patrimonio total verificadamente poseído.
        </p>
        <p>
          El portal muestra lo que la declaración dice, en la unidad y el
          momento que esa declaración utiliza. No reconstruye un balance
          económico independiente.
        </p>
        <h3 className="font-serif text-xl tracking-tight">
          Valor fiscal y valor de mercado
        </h3>
        <p>
          Determinados bienes —en especial inmuebles y vehículos— pueden estar
          declarados con criterios fiscales u otros criterios establecidos por
          el régimen de declaraciones juradas. Ese criterio no coincide, en
          general, con el precio al que el bien podría venderse.
        </p>
        <p>
          Por lo tanto, un aumento o una disminución del valor declarado no
          representa necesariamente una ganancia o una pérdida equivalente a
          valor de mercado. Puede reflejar, entre otras cosas, una actualización
          fiscal, un cambio de criterio, una incorporación o una baja en la
          declaración, o una diferencia de momento.
        </p>
        <p>
          Cuando la fuente publica un porcentaje de titularidad, el importe
          mostrado para cada bien ya contempla ese porcentaje: el portal no
          vuelve a multiplicarlo.
        </p>
        <h3 className="font-serif text-xl tracking-tight">Bienes y deudas</h3>
        <p>
          El patrimonio neto que muestra el sitio es un cálculo derivado:
        </p>
        <p>
          <strong>Patrimonio neto = bienes declarados − deudas declaradas</strong>
        </p>
        <p>
          El momento de esos totales depende del tipo de declaración: en las
          anuales se usan los valores de cierre; en las iniciales, los de
          inicio. El resultado solo es tan completo como los ítems disponibles
          para esa declaración y ese momento.
        </p>
      </section>

      <section id="evolucion" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">Evolución patrimonial</h2>
        <h3 className="font-serif text-xl tracking-tight">Años faltantes</h3>
        <p>
          Un año sin declaración disponible no equivale a cero. Tampoco debe
          asumirse, solo por esa ausencia, que la persona no presentó una
          declaración, que no tenía patrimonio o que no estaba alcanzada por la
          obligación.
        </p>
        <p>
          Representa, simplemente, que no hay un dato comparable disponible en
          el conjunto utilizado por el portal. Los huecos se muestran como
          huecos. El sistema no interpola valores ni rellena series.
        </p>
        <h3 className="font-serif text-xl tracking-tight">Variaciones</h3>
        <p>
          Las variaciones solo se muestran cuando las declaraciones son
          metodológicamente comparables. En la implementación actual, eso
          significa declaraciones anuales consecutivas.
        </p>
        <p>
          No se presenta la diferencia entre períodos separados por años
          faltantes como si fuera una variación interanual. Una diferencia entre
          2020 y 2022, con 2021 ausente, no se etiqueta como variación de un
          año.
        </p>
        <h3 className="font-serif text-xl tracking-tight">Rectificativas</h3>
        <p>
          Una declaración puede tener versiones rectificadas. La interfaz
          utiliza la versión considerada vigente según la lógica del conjunto de
          datos —en general, la de mayor número de rectificativa para ese año—
          y puede indicar que existió una rectificación.
        </p>
        <p>
          El portal no duplica artificialmente los años: cada año fiscal aparece
          una vez en la serie visible.
        </p>
      </section>

      <section id="monedas" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">Monedas y conversiones</h2>
        <p>
          Hay tres vistas de montos. La predeterminada es el valor declarado en
          pesos. Las otras dos son transformaciones analíticas: no reemplazan a
          la declaración ni crean un valor “más verdadero”.
        </p>
        <h3 className="font-serif text-xl tracking-tight">ARS nominal</h3>
        <p>
          Es la vista predeterminada. Representa el valor declarado expresado en
          pesos correspondientes al período fiscal. Es el único número que
          pretende corresponder, de manera directa, a lo publicado en la
          declaración.
        </p>
        <h3 className="font-serif text-xl tracking-tight">ARS ajustado por IPC</h3>
        <p>
          Permite expresar valores usando una referencia temporal común. Requiere
          una serie macroeconómica documentada. No es un nuevo valor declarado:
          es una transformación analítica sobre el monto nominal.
        </p>
        {mock ? (
          <p>
            En el modo actual la serie IPC es de demostración. No debe leerse
            como el índice oficial de un organismo estadístico ni como una
            valuación revisada de la declaración.
          </p>
        ) : null}
        <h3 className="font-serif text-xl tracking-tight">USD aproximado</h3>
        <p>
          Es una referencia secundaria. Nunca representa el verdadero
          patrimonio, la riqueza real ni un valor exacto en dólares.
        </p>
        <p>
          La conversión depende de una fuente explícita, de una metodología
          documentada y de una fecha o criterio de conversión. El diseño previsto
          usa un tipo de cambio de referencia al cierre del año fiscal, no
          cotizaciones paralelas.
        </p>
        {mock ? (
          <p>
            La serie de tipo de cambio actual también es demostrativa. No es la
            serie oficial del BCRA ni un tipo de cambio de mercado verificable
            para las personas ficticias del mock.
          </p>
        ) : null}
      </section>

      <section id="fuentes" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">Fuentes y trazabilidad</h2>
        <p>
          El proyecto distingue tres familias de fuentes. Hoy esa distinción es
          conceptual: describe cómo se pensó el recorte, no un flujo de ingesta
          ya publicado.
        </p>
        <h3 className="font-serif text-xl tracking-tight">Fuente patrimonial</h3>
        <p>
          Futuras declaraciones juradas provenientes de fuentes oficiales. El
          dataset público de declaraciones juradas patrimoniales integrales
          publicado por la Oficina Anticorrupción es la referencia prevista para
          montos, bienes, deudas e identificadores de origen. Este portal no lo
          está usando todavía como origen de las fichas que se ven en
          pantalla.
        </p>
        <h3 className="font-serif text-xl tracking-tight">Fuente parlamentaria</h3>
        <p>
          Información sobre mandatos, cámaras, distritos y bloques. Puede
          provenir de las cámaras del Congreso u otras publicaciones oficiales
          sobre la composición parlamentaria. Ante un conflicto futuro entre
          fuentes, el criterio previsto es que el Congreso prevalezca para
          mandato y bloque, y la fuente patrimonial para montos e
          identificadores de declaración.
        </p>
        <h3 className="font-serif text-xl tracking-tight">Fuentes macroeconómicas</h3>
        <p>
          Series utilizadas solo para las transformaciones analíticas (IPC y
          tipo de cambio de referencia), cuando existan y estén documentadas.
          No forman parte del texto de la declaración.
        </p>
        <h3 className="font-serif text-xl tracking-tight">Autoridad por tipo de dato</h3>
        <p>No hay una fuente superior para todos los atributos. El criterio previsto es:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Dato patrimonial</strong> (declaraciones, bienes, deudas,
            importes, <code>dj_id</code>): Oficina Anticorrupción / DJPI.
          </li>
          <li>
            <strong>Dato parlamentario</strong> (mandatos, distrito, bloque,
            interbloque): la cámara correspondiente (Diputados o Senado).
          </li>
          <li>
            <strong>Dato electoral</strong> (agrupación o alianza): Cámara
            Nacional Electoral, cuando exista.
          </li>
          <li>
            <strong>IPC:</strong> INDEC, serie oficial, conservando su escala
            original. Las vistas podrán normalizar a una base de presentación.
            Para comparaciones anuales, diciembre vs diciembre cuando
            corresponda metodológicamente.
          </li>
          <li>
            <strong>Tipo de cambio:</strong> BCRA, Tipo de Cambio de Referencia
            (Com. A 3500). No se usa dólar blue, MEP ni CCL como default.
          </li>
        </ul>
        <p>
          Este contrato es conceptual. Esta fase no incorpora series oficiales
          ni un pipeline de ingesta.
        </p>
        <h3 className="font-serif text-xl tracking-tight">
          Estado actual: datos ficticios
        </h3>
        <p>
          El proyecto está en modo demostración. Las personas, los montos y los
          mandatos que se ven en el explorador y en las fichas son ficticios. No
          corresponden a funcionarias ni funcionarios reales.
        </p>
        <p>
          El banner del sitio debe leerse en ese sentido: no hay expedientes
          oficiales simulados, no hay URLs de organismos públicos presentadas
          como origen de estos registros ficticios, y no se atribuye un
          archivo de demostración a una institución pública.
        </p>
        <p>
          Cada declaración guarda, cuando existe, un nombre de archivo, una
          fecha de snapshot y un hash. En el mock esos campos describen el
          archivo de demostración, no un documento de un organismo.
        </p>
      </section>

      <section id="matching" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">Matching de personas</h2>
        <p>
          El CUIT es un identificador de matching interno. No forma parte de la
          URL pública y la API no lo exige para consultar un perfil.
        </p>
        <p>La regla prevista para la futura ingesta es:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>CUIT presente:</strong> se permite un auto-match después de
            validar el identificador.
          </li>
          <li>
            <strong>CUIT ausente:</strong> no hay auto-match. El registro va a
            revisión.
          </li>
          <li>
            <strong>Nombre parecido solamente:</strong> nunca alcanza para
            auto-match. No se usa coincidencia difusa como mecanismo silencioso
            de identidad.
          </li>
        </ul>
        <p>
          Esta fase no implementa la ingesta. Solo deja la regla explícita para
          no improvisarla después.
        </p>
      </section>

      <section id="grupo-familiar" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">
          Por qué no se incluye el grupo familiar
        </h2>
        <p>
          El portal público no muestra cónyuges ni hijas e hijos, no reconstruye
          patrimonio familiar, no indexa información familiar y no usa
          información reservada para enriquecer perfiles públicos.
        </p>
        <p>
          La decisión se sostiene en minimización de datos, privacidad, límites
          del alcance público y responsabilidad al reutilizar información. El
          recorte público se concentra en la persona con mandato legislativo y
          en lo que su declaración publica sobre sí.
        </p>
        <p>
          Esta explicación describe el alcance del sitio. No es un dictamen
          jurídico ni una guía para presentar o omitir declaraciones.
        </p>
      </section>

      <section id="conceptos-politicos" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">
          Partido, agrupación, bloque e interbloque
        </h2>
        <p>
          Estos conceptos no son necesariamente equivalentes y pueden cambiar a
          lo largo del tiempo:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Partido político:</strong> organización permanente, con
            personería y vida propia más allá de una elección.
          </li>
          <li>
            <strong>Agrupación electoral:</strong> sello o alianza con el que
            una persona compite en una elección determinada.
          </li>
          <li>
            <strong>Bloque parlamentario:</strong> agrupamiento de trabajo en
            la cámara durante un período.
          </li>
          <li>
            <strong>Interbloque:</strong> coordinación entre bloques, cuando
            existe.
          </li>
        </ul>
        <p>
          El portal evita tratarlos como una única identidad política permanente.
          El dato que se muestra junto al mandato es, en general, el bloque
          parlamentario de ese período, no un partido “de toda la vida”.
        </p>
      </section>

      <section id="errores" className="mt-10 space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">
          ¿Encontraste un error?
        </h2>
        <p>
          Los datos pueden contener errores. El matching entre personas,
          mandatos y declaraciones puede requerir revisión. Las fuentes pueden
          cambiar. Una corrección debe preservar la trazabilidad: qué se
          modificó, a partir de qué fuente y en qué momento.
        </p>
        <p>
          Por ahora este portal no tiene formulario de reporte ni autenticación.
          El canal previsto es GitHub Issues del repositorio. Una corrección
          debe preservar la trazabilidad: qué se modificó, a partir de qué
          fuente y en qué momento. Mientras el sitio opera con datos ficticios,
          el registro de referencia de un dato real sigue siendo la fuente
          oficial, no esta interfaz.
        </p>
        <p>
          El recorte de datos, los identificadores y el estado de la API se
          describen en{" "}
          <Link href="/datos" className={linkClass}>
            Datos abiertos
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
