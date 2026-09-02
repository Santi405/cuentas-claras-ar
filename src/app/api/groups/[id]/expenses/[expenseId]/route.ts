import { NextResponse } from "next/server";
import { deleteExpense } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/groups/[id]/expenses/[expenseId]">,
) {
  const { id, expenseId } = await ctx.params;
  const group = deleteExpense(id, expenseId);
  if (!group) {
    return NextResponse.json({ error: "Grupo no encontrado." }, { status: 404 });
  }
  return NextResponse.json({ group });
}
