import { searchLegisladores } from "@/lib/data/cached";
import { invalidQuery, jsonOk } from "@/lib/api/envelope";
import { parseLegisladoresQuery } from "@/lib/api/parse";
import { publicLegisladorListItem, publicMeta } from "@/lib/api/serialize";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = parseLegisladoresQuery(url.searchParams);
  if (!parsed.ok) return invalidQuery(parsed.message);

  const q = parsed.data;
  const result = await searchLegisladores({
    q: q.q,
    camara: q.camara,
    distrito: q.distrito,
    estado: q.estado,
    anio: q.anio,
    page: q.page,
    pageSize: q.page_size,
    sort: q.sort,
  });

  return jsonOk({
    data: result.data.map(publicLegisladorListItem),
    meta: publicMeta(result.meta),
  });
}
