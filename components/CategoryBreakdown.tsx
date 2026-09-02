import { formatARS } from "@/lib/format";
import type { Transaction } from "@/lib/types";

interface Props {
  transactions: Transaction[];
}

export function CategoryBreakdown({ transactions }: Props) {
  const expenses = transactions.filter((t) => t.type === "expense");
  const total = expenses.reduce((sum, t) => sum + t.amount, 0);

  const byCategory = new Map<string, number>();
  for (const t of expenses) {
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
  }

  const rows = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h2 className="text-lg font-semibold text-slate-100">Gastos por categoría</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">Todavía no hay gastos registrados.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map(([category, amount]) => {
            const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
            return (
              <li key={category}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{category}</span>
                  <span className="font-medium text-slate-200">
                    {formatARS(amount)} · {pct}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
