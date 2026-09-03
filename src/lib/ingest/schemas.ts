import { z } from "zod";

/** Money stays a string here. Parsing happens with `parseMoney` — never coerce invalid values to 0. */
const moneyString = z.union([z.string(), z.number()]).transform((v) => String(v));

export const djpiConsolidadoSchema = z.object({
  dj_id: z.string().min(1),
  cuit: z.union([z.string(), z.number()]).optional(),
  anio: z.string().min(1),
  tipo_declaracion_jurada_id: z.string().optional(),
  tipo_declaracion_jurada_descripcion: z.string().optional(),
  rectificativa: z.string().optional(),
  funcionario_apellido_nombre: z.string(),
  organismo: z.string().optional().default(""),
  cargo: z.string().optional().default(""),
  total_bienes_inicio: moneyString,
  deudas_inicio: moneyString,
  total_bienes_final: moneyString,
  total_deudas_final: moneyString,
});

export const djpiBienSchema = z.object({
  dj_id: z.string().min(1),
  bien_descripcion: z.string().optional().default(""),
  bien_tipo: z.string().optional().default(""),
  bien_origen_fondos: z.string().optional().default(""),
  bien_titularidad: z.string().optional().default(""),
  bien_importe: moneyString,
});

export const djpiDeudaSchema = z.object({
  dj_id: z.string().min(1),
  deuda_tipo: z.string().optional().default("Común"),
  deuda_descripcion: z.string().optional().default(""),
  deuda_radicacion_localizacion: z.string().optional().default(""),
  deuda_clasificacion: z.string().optional().default(""),
  deuda_importe: moneyString,
});

export type DjpiConsolidado = z.infer<typeof djpiConsolidadoSchema>;
export type DjpiBien = z.infer<typeof djpiBienSchema>;
export type DjpiDeuda = z.infer<typeof djpiDeudaSchema>;
