import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import type { NewTransaction, Transaction } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "cuentas.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL CHECK (amount > 0),
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedIfEmpty(db);

  return db;
}

function seedIfEmpty(database: Database.Database) {
  const { count } = database
    .prepare("SELECT COUNT(*) AS count FROM transactions")
    .get() as { count: number };

  if (count > 0) return;

  const today = new Date();
  const iso = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };

  const samples: NewTransaction[] = [
    { type: "income", description: "Sueldo mensual", category: "Sueldo", amount: 850000, date: iso(20) },
    { type: "income", description: "Proyecto freelance", category: "Freelance", amount: 220000, date: iso(12) },
    { type: "expense", description: "Alquiler depto", category: "Alquiler", amount: 380000, date: iso(18) },
    { type: "expense", description: "Compra supermercado", category: "Comida", amount: 95000, date: iso(9) },
    { type: "expense", description: "Carga SUBE", category: "Transporte", amount: 18000, date: iso(6) },
    { type: "expense", description: "Internet + luz", category: "Servicios", amount: 62000, date: iso(4) },
    { type: "expense", description: "Salida al cine", category: "Ocio", amount: 24000, date: iso(2) },
  ];

  const insert = database.prepare(
    "INSERT INTO transactions (type, description, category, amount, date) VALUES (@type, @description, @category, @amount, @date)"
  );
  const insertMany = database.transaction((rows: NewTransaction[]) => {
    for (const row of rows) insert.run(row);
  });
  insertMany(samples);
}

interface Row {
  id: number;
  type: "income" | "expense";
  description: string;
  category: string;
  amount: number;
  date: string;
  created_at: string;
}

function toTransaction(row: Row): Transaction {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    category: row.category as Transaction["category"],
    amount: row.amount,
    date: row.date,
    createdAt: row.created_at,
  };
}

export function listTransactions(): Transaction[] {
  const rows = getDb()
    .prepare("SELECT * FROM transactions ORDER BY date DESC, id DESC")
    .all() as Row[];
  return rows.map(toTransaction);
}

export function createTransaction(input: NewTransaction): Transaction {
  const result = getDb()
    .prepare(
      "INSERT INTO transactions (type, description, category, amount, date) VALUES (@type, @description, @category, @amount, @date)"
    )
    .run(input);
  const row = getDb()
    .prepare("SELECT * FROM transactions WHERE id = ?")
    .get(result.lastInsertRowid) as Row;
  return toTransaction(row);
}

export function deleteTransaction(id: number): boolean {
  const result = getDb().prepare("DELETE FROM transactions WHERE id = ?").run(id);
  return result.changes > 0;
}
