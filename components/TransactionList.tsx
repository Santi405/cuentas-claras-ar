"use client";

import { formatARS, formatDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  onDelete: (id: number) => void;
}

export function TransactionList({ transactions, onDelete }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Movimientos</h2>
        <span className="text-sm text-slate-400">{transactions.length} registros</span>
      </div>

      {transactions.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">
          No hay movimientos todavía. ¡Agregá el primero!
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-white/5">
          {transactions.map((t) => {
            const isIncome = t.type === "income";
            return (
              <li
                key={t.id}
                className="group flex items-center justify-between gap-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${
                      isIncome
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-rose-500/15 text-rose-300"
                    }`}
                    aria-hidden
                  >
                    {isIncome ? "↑" : "↓"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{t.description}</p>
                    <p className="text-xs text-slate-400">
                      {t.category} · {formatDate(t.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-semibold ${
                      isIncome ? "text-emerald-300" : "text-rose-300"
                    }`}
                  >
                    {isIncome ? "+" : "−"}
                    {formatARS(t.amount)}
                  </span>
                  <button
                    onClick={() => onDelete(t.id)}
                    className="rounded-md px-2 py-1 text-xs text-slate-500 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-300 group-hover:opacity-100"
                    aria-label={`Eliminar ${t.description}`}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
