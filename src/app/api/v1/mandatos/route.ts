import { invalidQuery, jsonOk, notFound } from "@/lib/api/envelope";
import { asRecord, invalidQueryMessage, mandatosQuerySchema } from "@/lib/api/schemas";
import { publicMandato } from "@/lib/api/serialize";
import { getLegisladorByIdOrSlug, listMandatos } from "@/lib/data/cached";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = mandatosQuerySchema.safeParse(asRecord(url.searchParams));
  if (!parsed.success) {
    return invalidQuery(invalidQueryMessage(parsed.error));
  }
  const q = parsed.data;
  let personaId: string | undefined;
  if (q.persona) {
    const legislator = await getLegisladorByIdOrSlug(q.persona);
    if (!legislator) return notFound();
    personaId = legislator.persona.id;
  }
  const data = await listMandatos({
    camara: q.camara,
    distrito: q.distrito,
    personaId,
  });
  return jsonOk({ data: data.map(publicMandato) });
}
