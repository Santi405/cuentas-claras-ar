/**
 * Generates clearly fictional mock datasets for the DDJJ portal.
 * People, amounts and CUITs do not correspond to real officials.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../src/lib/data/mock");

function uuid(n) {
  return `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

const FUENTE_ID = uuid(9001);
const archivo = "mock-djpi-demostracion-2024.csv";
const archivoHash = createHash("sha256").update(archivo).digest("hex");

const fuente = {
  id: FUENTE_ID,
  nombre: "Dataset de demostración (ficticio)",
  url: null,
  snapshotDate: "2024-12-22",
  archivo,
  archivoHash,
};

const seriesMacro = [
  { anio: 2018, ipcIndice: 184.5, usdBcra3500Cierre: 37.7 },
  { anio: 2019, ipcIndice: 283.4, usdBcra3500Cierre: 59.9 },
  { anio: 2020, ipcIndice: 385.9, usdBcra3500Cierre: 84.15 },
  { anio: 2021, ipcIndice: 582.5, usdBcra3500Cierre: 102.72 },
  { anio: 2022, ipcIndice: 1134.6, usdBcra3500Cierre: 177.13 },
  { anio: 2023, ipcIndice: 3533.2, usdBcra3500Cierre: 808.45 },
  { anio: 2024, ipcIndice: 7700.0, usdBcra3500Cierre: 1032.0 },
];

/** Fictional legislators. Names use reserved demo vocabulary. */
const people = [
  {
    n: 1,
    apellido: "Ejemplo",
    nombre: "Ana",
    distrito: "CABA",
    camara: "diputados",
    inicio: "2019-12-10",
    fin: null,
    bloque: "Bloque Ejemplo Norte",
    interbloque: "Interbloque Demostración",
    years: [2019, 2020, 2022, 2023, 2024],
    gapYears: [2021],
    baseNeto: 48_000_000,
    deudas: false,
  },
  {
    n: 2,
    apellido: "Demostración",
    nombre: "Juan",
    mandatos: [
      {
        camara: "diputados",
        distrito: "Córdoba",
        inicio: "2015-12-10",
        fin: "2019-12-09",
        bloque: "Espacio Demostración",
      },
      {
        camara: "senadores",
        distrito: "Córdoba",
        inicio: "2019-12-10",
        fin: "2025-12-09",
        bloque: "Espacio Demostración",
      },
    ],
    years: [2018, 2019, 2020, 2021, 2022, 2023],
    baseNeto: 72_000_000,
    deudas: true,
  },
  {
    n: 3,
    apellido: "Ficticio",
    nombre: "Lucía",
    distrito: "Buenos Aires",
    camara: "diputados",
    inicio: "2021-12-10",
    fin: null,
    bloque: "Frente Ficticio Federal",
    years: [2021, 2022, 2023, 2024],
    inicial: 2021,
    baseNeto: 31_500_000,
  },
  {
    n: 4,
    apellido: "Simulado",
    nombre: "Martín",
    distrito: "Santa Fe",
    camara: "senadores",
    inicio: "2019-12-10",
    fin: null,
    bloque: "Bloque Ejemplo Norte",
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    baseNeto: 95_000_000,
    deudas: true,
  },
  {
    n: 5,
    apellido: "Prototipo",
    nombre: "Rosa",
    distrito: "Mendoza",
    camara: "diputados",
    inicio: "2017-12-10",
    fin: null,
    bloque: "Consenso de Muestra",
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    baseNeto: 22_000_000,
    deudas: true,
  },
  {
    n: 6,
    apellido: "Muestra",
    nombre: "Pedro",
    distrito: "Tucumán",
    camara: "senadores",
    inicio: "2021-12-10",
    fin: null,
    bloque: "Espacio Demostración",
    years: [2021, 2022, 2023, 2024],
    baseNeto: 41_000_000,
  },
  {
    n: 7,
    apellido: "Ensayo",
    nombre: "Sofía",
    distrito: "Salta",
    camara: "diputados",
    inicio: "2019-12-10",
    fin: null,
    bloque: "Frente Ficticio Federal",
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    rectificativaYear: 2023,
    baseNeto: 18_400_000,
  },
  {
    n: 8,
    apellido: "Ilustración",
    nombre: "Diego",
    mandatos: [
      {
        camara: "diputados",
        distrito: "Neuquén",
        inicio: "2013-12-10",
        fin: "2021-12-09",
        bloque: "Consenso de Muestra",
      },
      {
        camara: "senadores",
        distrito: "Neuquén",
        inicio: "2021-12-10",
        fin: null,
        bloque: "Consenso de Muestra",
      },
    ],
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    baseNeto: 110_000_000,
  },
  {
    n: 9,
    apellido: "Prueba",
    nombre: "Clara",
    distrito: "Chubut",
    camara: "senadores",
    inicio: "2019-12-10",
    fin: null,
    bloque: "Bloque Ejemplo Norte",
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    baseNeto: 27_800_000,
  },
  {
    n: 10,
    apellido: "Modelo",
    nombre: "Héctor",
    distrito: "Misiones",
    camara: "diputados",
    inicio: "2015-12-10",
    fin: "2023-12-09",
    bloque: "Espacio Demostración",
    years: [2018, 2019, 2020, 2021, 2022],
    baja: 2023,
    baseNeto: 15_200_000,
  },
  {
    n: 11,
    apellido: "Dummy",
    nombre: "Valentina",
    distrito: "Entre Ríos",
    camara: "diputados",
    inicio: "2023-12-10",
    fin: null,
    bloque: "Frente Ficticio Federal",
    years: [2023, 2024],
    inicial: 2023,
    baseNeto: 9_800_000,
  },
  {
    n: 12,
    apellido: "Boceto",
    nombre: "Nicolás",
    distrito: "San Juan",
    camara: "senadores",
    inicio: "2017-12-10",
    fin: "2023-12-09",
    bloque: "Consenso de Muestra",
    years: [2018, 2019, 2020, 2021, 2022, 2023],
    baseNeto: 54_000_000,
    deudas: true,
  },
  {
    n: 13,
    apellido: "Maqueta",
    nombre: "Emilia",
    distrito: "Córdoba",
    camara: "diputados",
    inicio: "2021-12-10",
    fin: null,
    bloque: "Bloque Ejemplo Norte",
    years: [2021, 2022, 2023, 2024],
    baseNeto: 36_600_000,
  },
  {
    n: 14,
    apellido: "Esquema",
    nombre: "Tomás",
    distrito: "CABA",
    camara: "diputados",
    inicio: "2019-12-10",
    fin: null,
    bloque: "Espacio Demostración",
    years: [2019, 2021, 2024],
    gapYears: [2020, 2022, 2023],
    baseNeto: 63_000_000,
  },
  {
    n: 15,
    apellido: "Referencia",
    nombre: "Camila",
    distrito: "Buenos Aires",
    camara: "senadores",
    inicio: "2019-12-10",
    fin: null,
    bloque: "Frente Ficticio Federal",
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    baseNeto: 88_500_000,
    deudas: true,
  },
  {
    n: 16,
    apellido: "Borrador",
    nombre: "Andrés",
    distrito: "Santa Fe",
    camara: "diputados",
    inicio: "2021-12-10",
    fin: null,
    bloque: "Consenso de Muestra",
    years: [2021, 2022, 2023, 2024],
    baseNeto: 12_400_000,
  },
  {
    n: 17,
    apellido: "Plantilla",
    nombre: "Inés",
    distrito: "Mendoza",
    camara: "diputados",
    inicio: "2013-12-10",
    fin: "2021-12-09",
    bloque: "Bloque Ejemplo Norte",
    years: [2018, 2019, 2020],
    baja: 2021,
    baseNeto: 19_900_000,
  },
  {
    n: 18,
    apellido: "Trazo",
    nombre: "Felipe",
    distrito: "CABA",
    camara: "senadores",
    inicio: "2023-12-10",
    fin: null,
    bloque: "Espacio Demostración",
    years: [2023, 2024],
    inicial: 2023,
    baseNeto: 140_000_000,
    deudas: true,
  },
  {
    n: 19,
    apellido: "Croquis",
    nombre: "Marina",
    distrito: "Tucumán",
    camara: "diputados",
    inicio: "2019-12-10",
    fin: null,
    bloque: "Frente Ficticio Federal",
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    baseNeto: 25_100_000,
  },
  {
    n: 20,
    apellido: "Viñeta",
    nombre: "Oscar",
    mandatos: [
      {
        camara: "diputados",
        distrito: "Salta",
        inicio: "2011-12-10",
        fin: "2019-12-09",
        bloque: "Consenso de Muestra",
      },
      {
        camara: "senadores",
        distrito: "Salta",
        inicio: "2019-12-10",
        fin: "2025-12-09",
        bloque: "Consenso de Muestra",
      },
    ],
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    baseNeto: 77_700_000,
  },
];

const personas = [];
const mandatos = [];
const declaraciones = [];
const bienes = [];
const deudas = [];
const identificadores = [];
const slugRedirects = [];

let seq = 100;
const nextId = () => uuid(++seq);

function inflationFactor(year) {
  const map = {
    2018: 0.18,
    2019: 0.24,
    2020: 0.32,
    2021: 0.45,
    2022: 0.7,
    2023: 1.4,
    2024: 2.2,
  };
  return map[year] ?? 1;
}

function organimo(camara) {
  return camara === "diputados"
    ? "H. Cámara de Diputados de la Nación (demostración)"
    : "H. Senado de la Nación (demostración)";
}

function cargo(camara) {
  return camara === "diputados" ? "Diputado/a nacional (ficticio)" : "Senador/a nacional (ficticio)";
}

function camaraAt(p, year) {
  const list = p.mandatos
    ? p.mandatos
    : [
        {
          camara: p.camara,
          distrito: p.distrito,
          inicio: p.inicio,
          fin: p.fin,
          bloque: p.bloque,
        },
      ];
  const at = list.find((m) => {
    const start = Number(m.inicio.slice(0, 4));
    const end = m.fin ? Number(m.fin.slice(0, 4)) : 9999;
    return year >= start && year <= end;
  });
  return at?.camara ?? list[list.length - 1].camara;
}

for (const p of people) {
  const personaId = uuid(p.n);
  const slug = `${p.apellido}-${p.nombre}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  personas.push({
    id: personaId,
    apellido: p.apellido,
    nombre: p.nombre,
    slug,
    cuit: p.n === 1 ? "20000000028" : null,
    fechaNacimiento: null,
    fotoUrl: null,
  });

  const mandatoList = p.mandatos
    ? p.mandatos
    : [
        {
          camara: p.camara,
          distrito: p.distrito,
          inicio: p.inicio,
          fin: p.fin,
          bloque: p.bloque,
          interbloque: p.interbloque ?? null,
        },
      ];

  for (const m of mandatoList) {
    mandatos.push({
      id: nextId(),
      personaId,
      camara: m.camara,
      distrito: m.distrito,
      inicio: m.inicio,
      fin: m.fin,
      bloque: m.bloque,
      interbloque: m.interbloque ?? p.interbloque ?? null,
      listaElectoral: "Lista de demostración",
    });
  }

  identificadores.push({
    id: nextId(),
    personaId,
    sistema: "camara",
    valor: `demo-${slug}`,
  });
  if (p.n === 1) {
    identificadores.push({
      id: nextId(),
      personaId,
      sistema: "cuit",
      valor: "20000000028",
    });
  }

  if (p.n === 1) {
    slugRedirects.push({ slug: "ejemplo-ana-viejo", personaId });
  }

  const years = [...p.years];
  if (p.baja && !years.includes(p.baja)) years.push(p.baja);

  for (const year of years.sort()) {
    const factor = inflationFactor(year);
    const bienesCierre = Math.round(p.baseNeto * factor);
    const deudasCierre = p.deudas ? Math.round(bienesCierre * 0.18) : 0;
    const bienesInicio = Math.round(bienesCierre / 1.15);
    const deudasInicio = p.deudas ? Math.round(deudasCierre / 1.1) : 0;
    const tipo =
      p.inicial === year ? "inicial" : p.baja === year ? "baja" : "anual";
    const periodo = tipo === "inicial" ? "I" : "C";
    const camara = camaraAt(p, year);
    const declId = nextId();

    declaraciones.push({
      id: declId,
      personaId,
      anioFiscal: year,
      tipo,
      fuenteId: FUENTE_ID,
      sourceDjId: 800000 + p.n * 100 + (year - 2000),
      rectificativa: 0,
      periodo,
      organismoDeclarado: organimo(camara),
      cargoDeclarado: cargo(camara),
      bienesInicio,
      bienesCierre,
      deudasInicio,
      deudasCierre,
    });

    const inmueble = Math.round((tipo === "inicial" ? bienesInicio : bienesCierre) * 0.55);
    const deposito = Math.round((tipo === "inicial" ? bienesInicio : bienesCierre) * 0.25);
    const auto = Math.round((tipo === "inicial" ? bienesInicio : bienesCierre) * 0.12);
    const otros =
      (tipo === "inicial" ? bienesInicio : bienesCierre) - inmueble - deposito - auto;

    bienes.push(
      {
        id: nextId(),
        declaracionId: declId,
        tipo: "Inmueble",
        descripcion: "Departamento de demostración (valuación fiscal declarada)",
        origenFondos: "Haberes",
        titularidadPct: 100,
        importeArs: inmueble,
      },
      {
        id: nextId(),
        declaracionId: declId,
        tipo: "Depósito",
        descripcion: "Depósito en entidad financiera de demostración",
        origenFondos: "Haberes",
        titularidadPct: 100,
        importeArs: deposito,
      },
      {
        id: nextId(),
        declaracionId: declId,
        tipo: "Rodado",
        descripcion: "Automóvil de demostración (valuación fiscal)",
        origenFondos: "Haberes",
        titularidadPct: 50,
        importeArs: auto,
      },
      {
        id: nextId(),
        declaracionId: declId,
        tipo: "Otros bienes",
        descripcion: "Otros bienes muebles de demostración",
        origenFondos: "Haberes",
        titularidadPct: 100,
        importeArs: otros,
      },
    );

    if (deudasCierre > 0) {
      deudas.push({
        id: nextId(),
        declaracionId: declId,
        tipo: "Hipotecario",
        descripcion: "Crédito hipotecario de demostración",
        radicacion: "Argentina",
        clasificacion:
          periodo === "C"
            ? "Otras deudas en el pais al cierre"
            : "Otras deudas en el pais al inicio",
        importeArs: tipo === "inicial" ? deudasInicio : deudasCierre,
      });
    }

    if (p.rectificativaYear === year) {
      const rectId = nextId();
      const bienesRect = Math.round(bienesCierre * 1.08);
      declaraciones.push({
        id: rectId,
        personaId,
        anioFiscal: year,
        tipo: "anual",
        fuenteId: FUENTE_ID,
        sourceDjId: 800000 + p.n * 100 + (year - 2000) + 1,
        rectificativa: 1,
        periodo: "C",
        organismoDeclarado: organimo(camara),
        cargoDeclarado: cargo(camara),
        bienesInicio,
        bienesCierre: bienesRect,
        deudasInicio,
        deudasCierre,
      });
      bienes.push({
        id: nextId(),
        declaracionId: rectId,
        tipo: "Inmueble",
        descripcion: "Departamento de demostración (rectificativa)",
        origenFondos: "Haberes",
        titularidadPct: 100,
        importeArs: Math.round(bienesRect * 0.6),
      });
      bienes.push({
        id: nextId(),
        declaracionId: rectId,
        tipo: "Depósito",
        descripcion: "Depósito (rectificativa de demostración)",
        origenFondos: "Haberes",
        titularidadPct: 100,
        importeArs: bienesRect - Math.round(bienesRect * 0.6),
      });
    }
  }
}

function write(name, data) {
  writeFileSync(join(outDir, name), JSON.stringify(data, null, 2) + "\n");
}

write("fuentes.json", [fuente]);
write("series-macro.json", seriesMacro);
write("personas.json", personas);
write("mandatos.json", mandatos);
write("declaraciones.json", declaraciones);
write("bienes.json", bienes);
write("deudas.json", deudas);
write("identificadores.json", identificadores);
write("slug-redirects.json", slugRedirects);
write("meta.json", {
  mode: "mock",
  disclaimer:
    "Datos de demostración. Personas y montos ficticios. No corresponden a funcionarios reales.",
  generatedAt: "2026-09-02",
});

console.log(
  `Wrote mock data: ${personas.length} personas, ${mandatos.length} mandatos, ${declaraciones.length} DDJJ, ${bienes.length} bienes, ${deudas.length} deudas`,
);
