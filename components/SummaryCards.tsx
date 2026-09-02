import { formatARS } from "@/lib/format";

interface Props {
  income: number;
  expense: number;
}

export function SummaryCards({ income, expense }: Props) {
  const balance = income - expense;
  const positive = balance >= 0;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <p className="text-sm font-medium text-slate-400">Ingresos</p>
        <p className="mt-2 text-2xl font-bold text-emerald-400">{formatARS(income)}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <p className="text-sm font-medium text-slate-400">Gastos</p>
        <p className="mt-2 text-2xl font-bold text-rose-400">{formatARS(expense)}</p>
      </div>
      <div
        className={`rounded-2xl border p-5 backdrop-blur ${
          positive
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-rose-500/30 bg-rose-500/10"
        }`}
      >
        <p className="text-sm font-medium text-slate-300">Balance</p>
        <p
          className={`mt-2 text-2xl font-bold ${
            positive ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {formatARS(balance)}
        </p>
      </div>
    </section>
  );
}
