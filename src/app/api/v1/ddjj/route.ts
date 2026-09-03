import { invalidQuery, jsonOk, notFound } from "@/lib/api/envelope";
import { asRecord, ddjjQuerySchema, invalidQueryMessage } from "@/lib/api/schemas";
import { publicDeclaracionDetalle } from "@/lib/api/serialize";
import {
  getLegisladorByIdOrSlug,
  listDeclaraciones,
  searchLegisladores,
} from "@/lib/data/cached";
import { PAGE_SIZE_MAX } from "@/lib/domain/pagination";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = ddjjQuerySchema.safeParse(asRecord(url.searchParams));
  if (!parsed.success) {
    return invalidQuery(invalidQueryMessage(parsed.error));
  }
  const q = parsed.data;
  let personaIds: string[] = [];
  if (q.persona) {
    const legislator = await getLegisladorByIdOrSlug(q.persona);
    if (!legislator) return notFound();
    personaIds = [legislator.persona.id];
  } else {
    const list = await searchLegisladores({ page: 1, pageSize: PAGE_SIZE_MAX });
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
  const totalPages =
    filtered.length === 0 ? 0 : Math.ceil(filtered.length / q.page_size);

  return jsonOk({
    data: slice.map((d) => ({
      persona_id: d.personaId,
      ...publicDeclaracionDetalle(d),
    })),
    meta: {
      page: q.page,
      page_size: q.page_size,
      total: filtered.length,
      total_pages: totalPages,
    },
  });
}
