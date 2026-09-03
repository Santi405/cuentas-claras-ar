import { z } from "zod";
import {
  ANIO_MAX,
  ANIO_MIN,
  API_DEFAULT_PAGE,
  API_DEFAULT_PAGE_SIZE,
  DISTRITO_MAX_LENGTH,
  PAGE_MIN,
  PAGE_SIZE_MAX,
  Q_MAX_LENGTH,
} from "@/lib/domain/query";
import {
  CAMARAS,
  ESTADOS_LEGISLADOR,
  SORT_FIELDS,
  TIPOS_DECLARACION,
} from "@/lib/domain/types";

function blankToUndefined(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

const optionalString = (max: number) =>
  z.preprocess(blankToUndefined, z.string().max(max).optional());

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(blankToUndefined, z.enum(values).optional());

const optionalAnio = z.preprocess(
  blankToUndefined,
  z.coerce.number().int().min(ANIO_MIN).max(ANIO_MAX).optional(),
);

const pageNumber = z.preprocess(
  blankToUndefined,
  z.coerce.number().int().min(PAGE_MIN).optional(),
);

export const legisladoresQuerySchema = z.object({
  q: optionalString(Q_MAX_LENGTH),
  camara: optionalEnum(CAMARAS),
  distrito: optionalString(DISTRITO_MAX_LENGTH),
  estado: optionalEnum(ESTADOS_LEGISLADOR),
  anio: optionalAnio,
  page: pageNumber.default(API_DEFAULT_PAGE),
  page_size: z.preprocess(
    blankToUndefined,
    z.coerce.number().int().min(PAGE_MIN).max(PAGE_SIZE_MAX).optional(),
  ).default(API_DEFAULT_PAGE_SIZE),
  sort: z.preprocess(
    blankToUndefined,
    z.enum(SORT_FIELDS).optional(),
  ).default("nombre"),
});

export const ddjjQuerySchema = z.object({
  persona: optionalString(80),
  anio: optionalAnio,
  tipo: optionalEnum(TIPOS_DECLARACION),
  page: pageNumber.default(API_DEFAULT_PAGE),
  page_size: z.preprocess(
    blankToUndefined,
    z.coerce.number().int().min(PAGE_MIN).max(PAGE_SIZE_MAX).optional(),
  ).default(API_DEFAULT_PAGE_SIZE),
});

export const mandatosQuerySchema = z.object({
  camara: optionalEnum(CAMARAS),
  distrito: optionalString(DISTRITO_MAX_LENGTH),
  persona: optionalString(80),
});

export function asRecord(
  searchParams: URLSearchParams,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  searchParams.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

const QUERY_PARAM_MESSAGES: Record<string, string> = {
  q: "El parámetro q no es válido.",
  camara: "El parámetro camara no es válido.",
  estado: "El parámetro estado no es válido.",
  distrito: "El parámetro distrito no es válido.",
  anio: "El parámetro anio no es válido.",
  page: "El parámetro page no es válido.",
  page_size: "El parámetro page_size no es válido.",
  sort: "El parámetro sort no es válido.",
  tipo: "El parámetro tipo no es válido.",
  persona: "El parámetro persona no es válido.",
};

export function invalidQueryMessage(error: z.ZodError): string {
  const names = [
    ...new Set(
      error.issues
        .map((issue) => issue.path[0])
        .filter((key): key is string => typeof key === "string"),
    ),
  ];
  if (names.length === 1 && QUERY_PARAM_MESSAGES[names[0]]) {
    return QUERY_PARAM_MESSAGES[names[0]];
  }
  if (names.length > 1) {
    return `Parámetros inválidos: ${names.join(", ")}.`;
  }
  return "Los parámetros de la consulta no son válidos.";
}
