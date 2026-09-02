import Link from "next/link";
import NewGroupForm from "@/components/NewGroupForm";
import { computeBalances } from "@/lib/balances";
import { formatArs } from "@/lib/money";
import { listGroups } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Home() {
  const groups = listGroups();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">Tus grupos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Creá un grupo, cargá los gastos y descubrí quién le debe a quién.
        </p>
      </section>

      <NewGroupForm />

      <section className="space-y-3">
        {groups.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Todavía no hay grupos. Creá el primero arriba.
          </p>
        ) : (
          groups.map((group) => {
            const total = group.expenses.reduce((acc, e) => acc + e.amountCents, 0);
            const balances = computeBalances(group);
            return (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{group.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {group.members.length} integrantes · {group.expenses.length} gastos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Total</p>
                    <p className="font-semibold text-slate-900">{formatArs(total)}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {balances.map((b) => (
                    <span
                      key={b.memberId}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        b.netCents > 0
                          ? "bg-emerald-50 text-emerald-700"
                          : b.netCents < 0
                            ? "bg-rose-50 text-rose-700"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {b.name}: {formatArs(b.netCents)}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })
        )}
      </section>
    </div>
  );
}
