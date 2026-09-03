export type CuitParse =
  | {
      ok: true;
      raw: string;
      canonical: string;
      validChecksum: true;
    }
  | {
      ok: false;
      raw: string;
      canonical: null;
      reason: "empty" | "invalid_length" | "invalid_digits" | "invalid_checksum";
    };

const DASHED_RE = /^(\d{2})-(\d{8})-(\d)$/;

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Argentine CUIT/CUIL check digit (module 11).
 * Canonical form is the 11-digit string. The original `raw` is preserved by the caller.
 */
export function cuitChecksumDigit(firstTen: string): number | null {
  if (!/^\d{10}$/.test(firstTen)) return null;
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(firstTen[i]) * weights[i];
  }
  const mod = 11 - (sum % 11);
  if (mod === 11) return 0;
  if (mod === 10) return 9;
  return mod;
}

export function isValidCuitChecksum(digits: string): boolean {
  if (!/^\d{11}$/.test(digits)) return false;
  const expected = cuitChecksumDigit(digits.slice(0, 10));
  if (expected === null) return false;
  return expected === Number(digits[10]);
}

/**
 * Normalize CUIT for matching. Never pad short values. Never use number types.
 * Demonstrated formats: `20123456783` and `20-12345678-3`.
 */
export function parseCuit(value: string | number | null | undefined): CuitParse {
  if (value === null || value === undefined) {
    return { ok: false, raw: "", canonical: null, reason: "empty" };
  }
  const raw = String(value).trim();
  if (raw === "") {
    return { ok: false, raw, canonical: null, reason: "empty" };
  }

  const dashed = DASHED_RE.exec(raw);
  const digits = dashed
    ? `${dashed[1]}${dashed[2]}${dashed[3]}`
    : /^\d{11}$/.test(raw)
      ? raw
      : null;
  if (!digits) {
    const stripped = onlyDigits(raw);
    if (stripped.length === 0) {
      return { ok: false, raw, canonical: null, reason: "invalid_digits" };
    }
    return { ok: false, raw, canonical: null, reason: "invalid_length" };
  }

  if (!/^\d{11}$/.test(digits)) {
    return { ok: false, raw, canonical: null, reason: "invalid_length" };
  }
  if (!isValidCuitChecksum(digits)) {
    return { ok: false, raw, canonical: null, reason: "invalid_checksum" };
  }
  return { ok: true, raw, canonical: digits, validChecksum: true };
}
