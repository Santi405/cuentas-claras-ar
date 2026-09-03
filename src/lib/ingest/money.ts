export type MoneyFormat =
  | "dot_decimal"
  | "hyphen_decimal"
  | "hyphen_zero"
  | "integer";

export type MoneyParse =
  | {
      ok: true;
      raw: string;
      canonical: string;
      format: MoneyFormat;
      warning?: string;
    }
  | {
      ok: false;
      raw: string;
      reason: "empty" | "unparseable" | "unexpected_scale" | "ambiguous";
    };

const DOT_RE = /^-?\d+\.\d+$/;
const INT_RE = /^-?\d+$/;
const HYPHEN_RE = /^(\d+)-(\d{2})$/;
const HYPHEN_FRAC_ONLY_RE = /^-(\d{2})$/;

function canonicalFromParts(whole: string, frac: string, negative: boolean): string {
  const sign = negative ? "-" : "";
  if (frac.length === 0) return `${sign}${whole}`;
  return `${sign}${whole}.${frac}`;
}

/**
 * Parse an OA monetary field without `Number(value)` heuristics.
 *
 * Formats observed in the 2024 official snapshot (consulta 2026-09-03):
 * - consolidado: hyphen decimal (`35278884-41`) and zero as `-00`
 * - bienes / deudas: dot decimal (`1050000.00`, `3554270.60`)
 * - ZIP 2016 / año 2015: integer `0` and dot decimal `1271206.42`
 *
 * Empty is not zero. Unparseable values must be rejected.
 */
export function parseMoney(value: string | number | null | undefined): MoneyParse {
  if (value === null || value === undefined) {
    return { ok: false, raw: "", reason: "empty" };
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return { ok: false, raw: String(value), reason: "unparseable" };
    }
    if (!Number.isInteger(value)) {
      return {
        ok: true,
        raw: String(value),
        canonical: String(value),
        format: "dot_decimal",
        warning: "number_type_input",
      };
    }
    return {
      ok: true,
      raw: String(value),
      canonical: String(value),
      format: "integer",
      warning: "number_type_input",
    };
  }

  const raw = value.trim();
  if (raw === "") {
    return { ok: false, raw, reason: "empty" };
  }

  if (HYPHEN_FRAC_ONLY_RE.test(raw)) {
    const frac = raw.slice(1);
    return {
      ok: true,
      raw,
      canonical: canonicalFromParts("0", frac, false),
      format: "hyphen_zero",
      warning: frac === "00" ? undefined : "hyphen_fraction_only",
    };
  }

  const hyphen = HYPHEN_RE.exec(raw);
  if (hyphen) {
    return {
      ok: true,
      raw,
      canonical: canonicalFromParts(hyphen[1], hyphen[2], false),
      format: "hyphen_decimal",
    };
  }

  if (DOT_RE.test(raw)) {
    const negative = raw.startsWith("-");
    const unsigned = negative ? raw.slice(1) : raw;
    const [whole, frac] = unsigned.split(".");
    if (frac.length > 4) {
      return { ok: false, raw, reason: "unexpected_scale" };
    }
    return {
      ok: true,
      raw,
      canonical: canonicalFromParts(whole, frac, negative),
      format: "dot_decimal",
    };
  }

  if (INT_RE.test(raw)) {
    return { ok: true, raw, canonical: raw, format: "integer" };
  }

  return { ok: false, raw, reason: "unparseable" };
}

/** Compare two parsed amounts after normalizing to 2 decimal places. Extra scale is an error. */
export function moneyToCents(canonical: string): string | null {
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(canonical);
  if (!m) return null;
  const negative = m[1] === "-";
  const whole = m[2];
  const frac = (m[3] ?? "").padEnd(2, "0");
  if (frac.length > 2) return null;
  const digits = `${whole}${frac}`.replace(/^0+(?=\d)/, "");
  return `${negative ? "-" : ""}${digits}`;
}

export function moneyEquals(a: string, b: string): boolean {
  const ca = moneyToCents(a);
  const cb = moneyToCents(b);
  if (ca === null || cb === null) return false;
  return ca === cb;
}
