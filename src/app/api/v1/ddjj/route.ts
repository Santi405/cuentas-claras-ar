import { jsonError, jsonOk, optionsOk } from "@/lib/api/envelope";
import { asRecord, ddjjQuerySchema } from "@/lib/api/schemas";
import {
  getLegisladorByIdOrSlug,
  listDeclaraciones,
  searchLegisladores,
} from "@/lib/data/cached";

export function OPTIONS() {
  return optionsOk();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = ddjjQuerySchema.safeParse(asRecord(url.searchParams));
  if (!parsed.success) {
    return jsonError(400, "invalid_query", "Parámetros inválidos", parsed.error.flatten());
  }
  const q = parsed.data;
  let personaIds: string[] = [];
  if (q.persona) {
    const legislator = await getLegisladorByIdOrSlug(q.persona);
    if (!legislator) return jsonError(404, "not_found", "Legislador no encontrado");
    personaIds = [legislator.persona.id];
  } else {
    const list = await searchLegisladores({ page: 1, pageSize: 100 });
    personaIds = list.data.map((p) => p.id);
  }

  const all = (
    await Promise.all(personaIds.map((id) => listDeclaraciones(id)))
  ).flat();

  const filtered = all.filter((d) => {
    if (q.anio && d.anioFiscal !== q.anio) return false;
    if (q.tipo && d.tipo !== q.tipo) return false;
    return true;
  });

  const start = (q.page - 1) * q.page_size;
  const slice = filtered.slice(start, start + q.page_size);

  return jsonOk({
    data: slice.map((d) => ({
      id: d.id,
      persona_id: d.personaId,
      anio_fiscal: d.anioFiscal,
      tipo: d.tipo,
      neto: d.neto,
      source_dj_id: d.sourceDjId,
      fuente: d.fuente,
    })),
    meta: { page: q.page, page_size: q.page_size, total: filtered.length },
  });
}
