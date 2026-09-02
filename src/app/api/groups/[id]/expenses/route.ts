import { NextResponse } from "next/server";
import { addExpense, getGroup } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, ctx: RouteContext<"/api/groups/[id]/expenses">) {
  const { id } = await ctx.params;
  const group = getGroup(id);
  if (!group) {
    return NextResponse.json({ error: "Grupo no encontrado." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const amountCents = Number(body?.amountCents);
  const paidBy = typeof body?.paidBy === "string" ? body.paidBy : "";
  const participants: string[] = Array.isArray(body?.participants) ? body.participants : [];

  if (!description) {
    return NextResponse.json({ error: "La descripción es obligatoria." }, { status: 400 });
  }
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: "El monto debe ser mayor a cero." }, { status: 400 });
  }
  const memberIds = new Set(group.members.map((m) => m.id));
  if (!memberIds.has(paidBy)) {
    return NextResponse.json({ error: "Quien pagó no pertenece al grupo." }, { status: 400 });
  }
  const validParticipants = participants.filter((p) => memberIds.has(p));
  if (validParticipants.length === 0) {
    return NextResponse.json({ error: "Elegí al menos un participante." }, { status: 400 });
  }

  const updated = addExpense(id, { description, amountCents, paidBy, participants: validParticipants });
  return NextResponse.json({ group: updated }, { status: 201 });
}
