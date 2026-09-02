"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import type { Transaction } from "@/lib/types";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/transactions", { cache: "no-store" });
    const data = await res.json();
    setTransactions(data.transactions ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = useCallback(
    async (id: number) => {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      load();
    },
    [load]
  );

  const { income, expense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return { income, expense };
  }, [transactions]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-xl font-black text-white">
            $
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Cuentas Claras AR</h1>
            <p className="text-sm text-slate-400">
              Controlá tus ingresos y gastos en pesos argentinos.
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <p className="text-slate-400">Cargando…</p>
      ) : (
        <div className="space-y-6">
          <SummaryCards income={income} expense={expense} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
            <div className="space-y-6">
              <TransactionForm onCreated={load} />
              <CategoryBreakdown transactions={transactions} />
            </div>
            <TransactionList transactions={transactions} onDelete={handleDelete} />
          </div>
        </div>
      )}

      <footer className="mt-12 text-center text-xs text-slate-500">
        Cuentas Claras AR · datos guardados localmente en SQLite
      </footer>
    </main>
  );
}
