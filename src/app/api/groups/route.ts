import { NextResponse } from "next/server";
import { createGroup, listGroups } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ groups: listGroups() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const members: string[] = Array.isArray(body?.members) ? body.members : [];

  if (!name) {
    return NextResponse.json({ error: "El nombre del grupo es obligatorio." }, { status: 400 });
  }

  const group = createGroup(name, members);
  return NextResponse.json({ group }, { status: 201 });
}
