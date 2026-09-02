import { searchLegisladores } from "@/lib/data/cached";
import { jsonError, jsonOk, optionsOk } from "@/lib/api/envelope";
import { asRecord, legisladoresQuerySchema } from "@/lib/api/schemas";

export function OPTIONS() {
  return optionsOk();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = legisladoresQuerySchema.safeParse(asRecord(url.searchParams));
  if (!parsed.success) {
    return jsonError(400, "invalid_query", "Parámetros inválidos", parsed.error.flatten());
  }
  const q = parsed.data;
  const result = await searchLegisladores({
    q: q.q,
    camara: q.camara,
    distrito: q.distrito,
    estado: q.estado,
    anio: q.anio,
    cuit: q.cuit,
    page: q.page,
    pageSize: q.page_size,
    sort: q.sort,
  });

  return jsonOk({
    data: result.data.map((item) => ({
      id: item.id,
      slug: item.slug,
      nombre_completo: item.nombreCompleto,
      camara_actual: item.camaraActual,
      distrito_actual: item.distritoActual,
      estado: item.estado,
      ultimo_anio_declarado: item.ultimoAnioDeclarado,
      neto_ars: item.netoArs,
    })),
    meta: {
      page: result.meta.page,
      page_size: result.meta.pageSize,
      total: result.meta.total,
    },
  });
}
