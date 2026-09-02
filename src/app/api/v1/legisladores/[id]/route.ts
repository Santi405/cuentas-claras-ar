import { getLegisladorByIdOrSlug } from "@/lib/data/cached";
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
  return jsonOk({
    data: {
      id: legislador.persona.id,
      slug: legislador.persona.slug,
      nombre: legislador.persona.nombre,
      apellido: legislador.persona.apellido,
      nombre_completo: legislador.persona.nombreCompleto,
      cuit: legislador.cuit,
      estado: legislador.estado,
      mandatos: legislador.mandatos,
      declaraciones: legislador.declaraciones,
      evolucion: legislador.evolucion,
    },
  });
}
