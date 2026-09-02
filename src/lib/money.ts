const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format an integer amount of ARS cents as a localized currency string. */
export function formatArs(cents: number): string {
  return arsFormatter.format(cents / 100);
}

/**
 * Parse a user-entered amount (e.g. "1.234,56" or "1234.56") into integer cents.
 * Accepts both Argentine ("." thousands / "," decimals) and plain formats.
 */
export function parseAmountToCents(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let normalized = trimmed.replace(/\s/g, "");
  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");

  if (hasComma && hasDot) {
    // Assume "." are thousands separators and "," is the decimal separator.
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    normalized = normalized.replace(",", ".");
  }

  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;

  return Math.round(value * 100);
}
