"use client";

import { useEffect, useState } from "react";
import { formatArs, parseAmountToCents } from "@/lib/money";
import type { Balance, Group, Settlement } from "@/lib/types";

interface GroupResponse {
  group: Group;
  balances: Balance[];
  settlements: Settlement[];
}

export default function GroupDetail({ id }: { id: string }) {
  const [data, setData] = useState<GroupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetch(`/api/groups/${id}`, { cache: "no-store" });
      if (active && res.ok) setData(await res.json());
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id, refreshKey]);

  if (loading) return <p className="text-sm text-slate-500">Cargando…</p>;
  if (!data) return <p className="text-sm text-rose-600">No se pudo cargar el grupo.</p>;

  const { group, balances, settlements } = data;
  const total = group.expenses.reduce((acc, e) => acc + e.amountCents, 0);
  const memberName = (mid: string) => group.members.find((m) => m.id === mid)?.name ?? "?";

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total gastado</p>
          <p className="text-lg font-semibold">{formatArs(total)}</p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Balances</h2>
          <ul className="space-y-2">
            {balances.map((b) => (
              <li key={b.memberId} className="flex items-center justify-between text-sm">
                <span>{b.name}</span>
                <span
                  className={
                    b.netCents > 0
                      ? "font-semibold text-emerald-600"
                      : b.netCents < 0
                        ? "font-semibold text-rose-600"
                        : "text-slate-400"
                  }
                >
                  {b.netCents > 0 ? "recupera " : b.netCents < 0 ? "debe " : ""}
                  {formatArs(Math.abs(b.netCents))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Cómo saldar</h2>
          {settlements.length === 0 ? (
            <p className="text-sm text-slate-400">Todo saldado. ¡Cuentas claras! 🎉</p>
          ) : (
            <ul className="space-y-2">
              {settlements.map((s, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium text-rose-600">{s.fromName}</span>
                  {" → "}
                  <span className="font-medium text-emerald-600">{s.toName}</span>
                  {": "}
                  <span className="font-semibold">{formatArs(s.amountCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <AddExpenseForm group={group} onDone={load} />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Gastos</h2>
        {group.expenses.length === 0 ? (
          <p className="text-sm text-slate-400">Todavía no hay gastos.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {group.expenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{e.description}</p>
                  <p className="text-xs text-slate-500">
                    Pagó {memberName(e.paidBy)} · dividido entre {e.participants.length}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatArs(e.amountCents)}</span>
                  <button
                    onClick={async () => {
                      await fetch(`/api/groups/${id}/expenses/${e.id}`, { method: "DELETE" });
                      load();
                    }}
                    className="text-xs text-slate-400 hover:text-rose-600"
                    aria-label="Eliminar gasto"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddMemberForm id={id} onDone={load} />
    </div>
  );
}

function AddExpenseForm({ group, onDone }: { group: Group; onDone: () => void }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(group.members[0]?.id ?? "");
  const [participants, setParticipants] = useState<string[]>(group.members.map((m) => m.id));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toggle(mid: string) {
    setParticipants((prev) =>
      prev.includes(mid) ? prev.filter((p) => p !== mid) : [...prev, mid],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amountCents = parseAmountToCents(amount);
    if (amountCents === null || amountCents <= 0) {
      setError("Ingresá un monto válido.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/groups/${group.id}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amountCents, paidBy, participants }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "No se pudo agregar el gasto.");
      setDescription("");
      setAmount("");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-slate-700">Agregar gasto</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Descripción</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Nafta"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Monto (ARS)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="Ej: 3.500,00"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Pagó</label>
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        >
          {group.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <span className="block text-sm font-medium text-slate-700">Dividir entre</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {group.members.map((m) => (
            <label
              key={m.id}
              className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition ${
                participants.includes(m.id)
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-slate-300 text-slate-500"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={participants.includes(m.id)}
                onChange={() => toggle(m.id)}
              />
              {m.name}
            </label>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Agregar gasto"}
      </button>
    </form>
  );
}

function AddMemberForm({ id, onDone }: { id: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/groups/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setName("");
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Agregar integrante…"
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
      >
        Agregar
      </button>
    </form>
  );
}
