import { NextResponse } from "next/server";
import { createTransaction, listTransactions } from "@/lib/db";
import { CATEGORIES, type NewTransaction } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET() {
  const transactions = listTransactions();
  return NextResponse.json({ transactions });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido (se esperaba JSON)." }, { status: 400 });
  }

  const data = body as Partial<NewTransaction>;
  const errors: string[] = [];

  if (data.type !== "income" && data.type !== "expense") {
    errors.push("El tipo debe ser 'income' o 'expense'.");
  }
  if (typeof data.description !== "string" || data.description.trim().length === 0) {
    errors.push("La descripción es obligatoria.");
  }
  if (typeof data.category !== "string" || !CATEGORIES.includes(data.category as never)) {
    errors.push("La categoría no es válida.");
  }
  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push("El monto debe ser un número mayor a cero.");
  }
  const date =
    typeof data.date === "string" && data.date.length > 0
      ? data.date
      : new Date().toISOString().slice(0, 10);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  const created = createTransaction({
    type: data.type as NewTransaction["type"],
    description: (data.description as string).trim(),
    category: data.category as NewTransaction["category"],
    amount,
    date,
  });

  return NextResponse.json({ transaction: created }, { status: 201 });
}
