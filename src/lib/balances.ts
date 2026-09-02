import type { Balance, Group, Settlement } from "./types";

/**
 * Compute each member's net balance for a group.
 * Each expense is split equally among its participants. Any rounding remainder
 * (in cents) is distributed to the first participants so totals always net to 0.
 */
export function computeBalances(group: Group): Balance[] {
  const net = new Map<string, number>();
  for (const m of group.members) net.set(m.id, 0);

  for (const expense of group.expenses) {
    const participants = expense.participants.filter((id) => net.has(id));
    if (participants.length === 0) continue;

    const base = Math.floor(expense.amountCents / participants.length);
    let remainder = expense.amountCents - base * participants.length;

    for (const pid of participants) {
      const share = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
      net.set(pid, (net.get(pid) ?? 0) - share);
    }

    if (net.has(expense.paidBy)) {
      net.set(expense.paidBy, (net.get(expense.paidBy) ?? 0) + expense.amountCents);
    }
  }

  return group.members.map((m) => ({
    memberId: m.id,
    name: m.name,
    netCents: net.get(m.id) ?? 0,
  }));
}

/**
 * Greedily produce a minimal-ish set of transfers that settles all balances.
 */
export function computeSettlements(balances: Balance[]): Settlement[] {
  const debtors = balances
    .filter((b) => b.netCents < 0)
    .map((b) => ({ ...b, netCents: b.netCents }))
    .sort((a, b) => a.netCents - b.netCents);
  const creditors = balances
    .filter((b) => b.netCents > 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.netCents - a.netCents);

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.netCents, creditor.netCents);

    if (amount > 0) {
      settlements.push({
        fromId: debtor.memberId,
        fromName: debtor.name,
        toId: creditor.memberId,
        toName: creditor.name,
        amountCents: amount,
      });
      debtor.netCents += amount;
      creditor.netCents -= amount;
    }

    if (debtor.netCents === 0) i += 1;
    if (creditor.netCents === 0) j += 1;
  }

  return settlements;
}
