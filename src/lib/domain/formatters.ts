const numberArs = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const numberUsd = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberPlain = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("es-AR", {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const monthYearFmt = new Intl.DateTimeFormat("es-AR", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatArs(value: number | null | undefined): string {
  if (value === null || value === undefined) return "n/d";
  return numberArs.format(value);
}

export function formatUsdApprox(value: number | null | undefined): string {
  if (value === null || value === undefined) return "n/d";
  return `${numberUsd.format(value)} (aprox.)`;
}

export function formatIpc(value: number | null | undefined, anioBase: number): string {
  if (value === null || value === undefined) return "n/d";
  return `${numberPlain.format(value)} $ constantes ${anioBase}`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "n/d";
  return percent.format(value / 100);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "n/d";
  return dateFmt.format(new Date(`${iso}T00:00:00Z`));
}

export function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return "vigente";
  return monthYearFmt.format(new Date(`${iso}T00:00:00Z`));
}

export function formatCamara(camara: "diputados" | "senadores" | null): string {
  if (camara === "diputados") return "Diputados";
  if (camara === "senadores") return "Senado";
  return "n/d";
}

export function formatEstado(estado: "en_ejercicio" | "historico"): string {
  return estado === "en_ejercicio" ? "En ejercicio" : "Histórico";
}

export function formatTipoDeclaracion(tipo: "inicial" | "anual" | "baja"): string {
  if (tipo === "inicial") return "Inicial";
  if (tipo === "baja") return "Baja";
  return "Anual";
}

export function iniciales(nombre: string, apellido: string): string {
  const n = nombre.trim().charAt(0);
  const a = apellido.trim().charAt(0);
  return `${n}${a}`.toUpperCase();
}

export function nombreCompleto(nombre: string, apellido: string): string {
  return `${apellido}, ${nombre}`;
}
