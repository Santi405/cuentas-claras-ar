import { z } from "zod";
import {
  CAMARAS,
  ESTADOS_LEGISLADOR,
  SORT_FIELDS,
  TIPOS_DECLARACION,
} from "@/lib/domain/types";

export const legisladoresQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  camara: z.enum(CAMARAS).optional(),
  distrito: z.string().trim().max(80).optional(),
  estado: z.enum(ESTADOS_LEGISLADOR).optional(),
  anio: z.coerce.number().int().min(1990).max(2100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(25),
  sort: z.enum(SORT_FIELDS).default("nombre"),
  cuit: z
    .string()
    .regex(/^\d{11}$/)
    .optional(),
});

export const ddjjQuerySchema = z.object({
  persona: z.string().trim().min(1).max(80).optional(),
  anio: z.coerce.number().int().min(1990).max(2100).optional(),
  tipo: z.enum(TIPOS_DECLARACION).optional(),
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(25),
});

export const mandatosQuerySchema = z.object({
  camara: z.enum(CAMARAS).optional(),
  distrito: z.string().trim().max(80).optional(),
  persona: z.string().trim().min(1).max(80).optional(),
});

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function asRecord(
  searchParams: URLSearchParams,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  searchParams.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}
