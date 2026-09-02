export const CAMARAS = ["diputados", "senadores"] as const;
export type Camara = (typeof CAMARAS)[number];

export const ESTADOS_LEGISLADOR = ["en_ejercicio", "historico"] as const;
export type EstadoLegislador = (typeof ESTADOS_LEGISLADOR)[number];

export const TIPOS_DECLARACION = ["inicial", "anual", "baja"] as const;
export type TipoDeclaracion = (typeof TIPOS_DECLARACION)[number];

export const PERIODOS_DECLARACION = ["I", "C"] as const;
export type PeriodoDeclaracion = (typeof PERIODOS_DECLARACION)[number];

export const VISTAS_MONTO = ["nominal", "ipc", "usd"] as const;
export type VistaMonto = (typeof VISTAS_MONTO)[number];

export const SORT_FIELDS = [
  "nombre",
  "-nombre",
  "neto",
  "-neto",
  "anio",
  "-anio",
] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export type Persona = {
  id: string;
  apellido: string;
  nombre: string;
  slug: string;
  cuit: string | null;
  fechaNacimiento: string | null;
  fotoUrl: string | null;
};

export type Mandato = {
  id: string;
  personaId: string;
  camara: Camara;
  distrito: string;
  inicio: string;
  fin: string | null;
  bloque: string | null;
  interbloque: string | null;
  listaElectoral: string | null;
};

export type Fuente = {
  id: string;
  nombre: string;
  url: string | null;
  snapshotDate: string;
  archivo: string;
  archivoHash: string;
};

export type Declaracion = {
  id: string;
  personaId: string;
  anioFiscal: number;
  tipo: TipoDeclaracion;
  fuenteId: string;
  sourceDjId: number | null;
  rectificativa: number;
  periodo: PeriodoDeclaracion;
  organismoDeclarado: string;
  cargoDeclarado: string;
  bienesInicio: number;
  bienesCierre: number;
  deudasInicio: number;
  deudasCierre: number;
};

export type Bien = {
  id: string;
  declaracionId: string;
  tipo: string | null;
  descripcion: string;
  origenFondos: string | null;
  titularidadPct: number | null;
  importeArs: number;
};

export type Deuda = {
  id: string;
  declaracionId: string;
  tipo: string;
  descripcion: string;
  radicacion: string | null;
  clasificacion: string | null;
  importeArs: number;
};

export type IdentificadorExterno = {
  id: string;
  personaId: string;
  sistema: "cuit" | "oa_dj" | "camara" | "cne";
  valor: string;
};

export type SlugRedirect = {
  slug: string;
  personaId: string;
};

export type SerieMacro = {
  anio: number;
  ipcIndice: number;
  usdBcra3500Cierre: number;
};

export type LegisladorSearchParams = {
  q?: string;
  camara?: Camara;
  distrito?: string;
  estado?: EstadoLegislador;
  anio?: number;
  cuit?: string;
  page?: number;
  pageSize?: number;
  sort?: SortField;
};

export type LegisladorListItem = {
  id: string;
  slug: string;
  nombreCompleto: string;
  camaraActual: Camara | null;
  distritoActual: string | null;
  bloqueActual: string | null;
  estado: EstadoLegislador;
  ultimoAnioDeclarado: number | null;
  netoArs: number | null;
  variacionNominalPct: number | null;
};

export type Paginated<T> = {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
};

export type DeclaracionResumen = {
  id: string;
  anioFiscal: number;
  tipo: TipoDeclaracion;
  rectificativa: number;
  periodo: PeriodoDeclaracion;
  bienes: number;
  deudas: number;
  neto: number;
  fuenteId: string;
  sourceDjId: number | null;
};

export type EvolucionAnual = {
  anioFiscal: number;
  neto: number | null;
  comparable: boolean;
  faltante: boolean;
};

export type LegisladorDetalle = {
  persona: Persona & { nombreCompleto: string };
  estado: EstadoLegislador;
  mandatos: Mandato[];
  declaraciones: DeclaracionResumen[];
  evolucion: EvolucionAnual[];
  cuit: string | null;
};

export type DeclaracionDetalle = Declaracion & {
  fuente: Fuente;
  bienesItems: Bien[];
  deudasItems: Deuda[];
  bienesMostrados: number;
  deudasMostradas: number;
  neto: number;
};

export type DataMode = "mock" | "postgres";
