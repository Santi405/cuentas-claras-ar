export type TransactionType = "income" | "expense";

export const CATEGORIES = [
  "Sueldo",
  "Freelance",
  "Comida",
  "Transporte",
  "Alquiler",
  "Servicios",
  "Ocio",
  "Salud",
  "Educación",
  "Otros",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Transaction {
  id: number;
  type: TransactionType;
  description: string;
  category: Category;
  amount: number;
  date: string;
  createdAt: string;
}

export interface NewTransaction {
  type: TransactionType;
  description: string;
  category: Category;
  amount: number;
  date: string;
}
