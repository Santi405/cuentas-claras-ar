import { NextResponse } from "next/server";
import { deleteTransaction } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const deleted = deleteTransaction(numericId);
  if (!deleted) {
    return NextResponse.json({ error: "No se encontró la transacción." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
