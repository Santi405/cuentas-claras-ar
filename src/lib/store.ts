import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Database, Expense, Group } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function seed(): Database {
  const now = new Date().toISOString();
  const ana = { id: randomUUID(), name: "Ana" };
  const beto = { id: randomUUID(), name: "Beto" };
  const caro = { id: randomUUID(), name: "Caro" };

  return {
    groups: [
      {
        id: randomUUID(),
        name: "Viaje a Bariloche",
        createdAt: now,
        members: [ana, beto, caro],
        expenses: [
          {
            id: randomUUID(),
            description: "Alquiler cabaña",
            amountCents: 12_000_00,
            paidBy: ana.id,
            participants: [ana.id, beto.id, caro.id],
            createdAt: now,
          },
          {
            id: randomUUID(),
            description: "Supermercado",
            amountCents: 4_500_00,
            paidBy: beto.id,
            participants: [ana.id, beto.id, caro.id],
            createdAt: now,
          },
        ],
      },
    ],
  };
}

function ensureDb(): Database {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_PATH)) {
    const seeded = seed();
    writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2), "utf8");
    return seeded;
  }
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf8")) as Database;
  } catch {
    const seeded = seed();
    writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2), "utf8");
    return seeded;
  }
}

function write(db: Database): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export function listGroups(): Group[] {
  return ensureDb().groups;
}

export function getGroup(id: string): Group | undefined {
  return ensureDb().groups.find((g) => g.id === id);
}

export function createGroup(name: string, memberNames: string[]): Group {
  const db = ensureDb();
  const group: Group = {
    id: randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    members: memberNames
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => ({ id: randomUUID(), name: n })),
    expenses: [],
  };
  db.groups.push(group);
  write(db);
  return group;
}

export function addMember(groupId: string, name: string): Group | undefined {
  const db = ensureDb();
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return undefined;
  group.members.push({ id: randomUUID(), name: name.trim() });
  write(db);
  return group;
}

export interface NewExpenseInput {
  description: string;
  amountCents: number;
  paidBy: string;
  participants: string[];
}

export function addExpense(groupId: string, input: NewExpenseInput): Group | undefined {
  const db = ensureDb();
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return undefined;

  const expense: Expense = {
    id: randomUUID(),
    description: input.description,
    amountCents: input.amountCents,
    paidBy: input.paidBy,
    participants: input.participants,
    createdAt: new Date().toISOString(),
  };
  group.expenses.push(expense);
  write(db);
  return group;
}

export function deleteExpense(groupId: string, expenseId: string): Group | undefined {
  const db = ensureDb();
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return undefined;
  group.expenses = group.expenses.filter((e) => e.id !== expenseId);
  write(db);
  return group;
}
