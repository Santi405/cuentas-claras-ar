import { jsonOk, notFound } from "@/lib/api/envelope";
import { loadLegisladorByPublicId } from "@/lib/api/load-legislador";
import { publicMandato } from "@/lib/api/serialize";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const legislador = await loadLegisladorByPublicId(id);
  if (!legislador) return notFound();
  return jsonOk({
    data: legislador.mandatos.map(publicMandato),
  });
}
