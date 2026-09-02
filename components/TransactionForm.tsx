"use client";

import { useState } from "react";
import { CATEGORIES, type NewTransaction, type TransactionType } from "@/lib/types";

interface Props {
  onCreated: () => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function TransactionForm({ onCreated }: Props) {
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[2]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload: NewTransaction = {
      type,
      description,
      category: category as NewTransaction["category"],
      amount: Number(amount),
      date,
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar la transacción.");
      }
      setDescription("");
      setAmount("");
      setDate(todayIso());
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
    >
      <h2 className="text-lg font-semibold text-slate-100">Nueva transacción</h2>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            type === "expense"
              ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40"
              : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            type === "income"
              ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
              : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          Ingreso
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Descripción</label>
          <input
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Compra en el súper"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Categoría</label>
            <select
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-slate-800">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Monto (ARS)</label>
            <input
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="1"
              step="0.01"
              placeholder="0"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Fecha</label>
          <input
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            required
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Guardando…" : "Agregar transacción"}
      </button>
    </form>
  );
}
