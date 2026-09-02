export interface Member {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  /** Amount in ARS cents (integer) to avoid floating point drift. */
  amountCents: number;
  /** Member id of who paid. */
  paidBy: string;
  /** Member ids the expense is split among (equally). */
  participants: string[];
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  createdAt: string;
}

export interface Balance {
  memberId: string;
  name: string;
  /** Positive => is owed money, negative => owes money (ARS cents). */
  netCents: number;
}

export interface Settlement {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amountCents: number;
}

export interface Database {
  groups: Group[];
}
