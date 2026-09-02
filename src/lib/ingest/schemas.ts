import { z } from "zod";

const optionalNumber = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined || v === "") return 0;
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  });

export const djpiConsolidadoSchema = z.object({
  dj_id: z.coerce.number().int(),
  cuit: z.union([z.string(), z.number()]).optional(),
  anio: z.coerce.number().int(),
  tipo_declaracion_jurada_id: z.coerce.number().int().optional(),
  tipo_declaracion_jurada_descripcion: z.string().optional(),
  rectificativa: z.coerce.number().int().optional().default(0),
  funcionario_apellido_nombre: z.string(),
  organismo: z.string().optional().default(""),
  cargo: z.string().optional().default(""),
  total_bienes_inicio: optionalNumber,
  deudas_inicio: optionalNumber,
  total_bienes_final: optionalNumber,
  total_deudas_final: optionalNumber,
});

export const djpiBienSchema = z.object({
  dj_id: z.coerce.number().int(),
  bien_descripcion: z.string().optional().default(""),
  bien_tipo: z.string().optional().default(""),
  bien_origen_fondos: z.string().optional().default(""),
  bien_titularidad: z.string().optional().default(""),
  bien_importe: z.union([z.string(), z.number()]).optional().default("0"),
});

export const djpiDeudaSchema = z.object({
  dj_id: z.coerce.number().int(),
  deuda_tipo: z.string().optional().default("Común"),
  deuda_descripcion: z.string().optional().default(""),
  deuda_radicacion_localizacion: z.string().optional().default(""),
  deuda_clasificacion: z.string().optional().default(""),
  deuda_importe: optionalNumber,
});

export type DjpiConsolidado = z.infer<typeof djpiConsolidadoSchema>;
export type DjpiBien = z.infer<typeof djpiBienSchema>;
export type DjpiDeuda = z.infer<typeof djpiDeudaSchema>;
