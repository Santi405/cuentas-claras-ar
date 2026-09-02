import { NextResponse } from "next/server";
import { computeBalances, computeSettlements } from "@/lib/balances";
import { getGroup } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: RouteContext<"/api/groups/[id]">) {
  const { id } = await ctx.params;
  const group = getGroup(id);
  if (!group) {
    return NextResponse.json({ error: "Grupo no encontrado." }, { status: 404 });
  }
  const balances = computeBalances(group);
  const settlements = computeSettlements(balances);
  return NextResponse.json({ group, balances, settlements });
}
