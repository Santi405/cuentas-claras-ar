export class DataReadError extends Error {
  constructor() {
    super("No se pudieron leer los datos.");
    this.name = "DataReadError";
  }
}

export async function withPostgres<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof Error && err.message.includes("DATABASE_URL")) {
      throw err;
    }
    console.error(err);
    throw new DataReadError();
  }
}
