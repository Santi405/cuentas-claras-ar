import { NextResponse } from "next/server";
import { addMember } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, ctx: RouteContext<"/api/groups/[id]/members">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  }

  const group = addMember(id, name);
  if (!group) {
    return NextResponse.json({ error: "Grupo no encontrado." }, { status: 404 });
  }
  return NextResponse.json({ group }, { status: 201 });
}
