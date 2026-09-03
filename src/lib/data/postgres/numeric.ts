const DECIMAL_RE = /^-?\d+(\.\d+)?$/;

export function parseAmount(value: unknown): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Importe inválido");
    }
    return value;
  }
  if (typeof value === "string" && DECIMAL_RE.test(value)) {
    return Number(value);
  }
  throw new Error("Importe inválido");
}

export function parseOptionalAmount(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return parseAmount(value);
}

export function parseOptionalInt(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && /^-?\d+$/.test(value)) return Number(value);
  throw new Error("Entero inválido");
}

/** Persist JSON mock numbers / numeric strings as a decimal literal (no float binary). */
export function amountToNumericString(value: unknown, scale: number): string {
  if (typeof value === "string") {
    if (!DECIMAL_RE.test(value)) {
      throw new Error("Importe inválido");
    }
    const negative = value.startsWith("-");
    const unsigned = negative ? value.slice(1) : value;
    const [whole, frac = ""] = unsigned.split(".");
    return `${negative ? "-" : ""}${whole}.${frac.padEnd(scale, "0").slice(0, scale)}`;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const negative = value < 0;
    const [whole, frac = ""] = Math.abs(value).toFixed(scale).split(".");
    return `${negative ? "-" : ""}${whole}.${frac}`;
  }
  throw new Error("Importe inválido");
}
