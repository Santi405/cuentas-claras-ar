import { getLegisladorByIdOrSlug, listDeclaraciones } from "@/lib/data/cached";
import { jsonError, jsonOk, optionsOk } from "@/lib/api/envelope";

export function OPTIONS() {
  return optionsOk();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const legislador = await getLegisladorByIdOrSlug(id);
  if (!legislador) {
    return jsonError(404, "not_found", "Legislador no encontrado");
  }
  const ddjj = await listDeclaraciones(legislador.persona.id);
  return jsonOk({
    data: ddjj.map((d) => ({
      id: d.id,
      anio_fiscal: d.anioFiscal,
      tipo: d.tipo,
      rectificativa: d.rectificativa,
      periodo: d.periodo,
      bienes: d.bienesMostrados,
      deudas: d.deudasMostradas,
      neto: d.neto,
      source_dj_id: d.sourceDjId,
      fuente: d.fuente,
      bienes_items: d.bienesItems,
      deudas_items: d.deudasItems,
    })),
  });
}
