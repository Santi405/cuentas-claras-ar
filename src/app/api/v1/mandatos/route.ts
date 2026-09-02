import { getLegisladorByIdOrSlug, listMandatos } from "@/lib/data/cached";
import { jsonError, jsonOk, optionsOk } from "@/lib/api/envelope";
import { asRecord, mandatosQuerySchema } from "@/lib/api/schemas";

export function OPTIONS() {
  return optionsOk();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = mandatosQuerySchema.safeParse(asRecord(url.searchParams));
  if (!parsed.success) {
    return jsonError(400, "invalid_query", "Parámetros inválidos", parsed.error.flatten());
  }
  const q = parsed.data;
  let personaId: string | undefined;
  if (q.persona) {
    const legislator = await getLegisladorByIdOrSlug(q.persona);
    if (!legislator) return jsonError(404, "not_found", "Legislador no encontrado");
    personaId = legislator.persona.id;
  }
  const data = await listMandatos({
    camara: q.camara,
    distrito: q.distrito,
    personaId,
  });
  return jsonOk({ data });
}
