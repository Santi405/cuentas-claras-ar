export type CsvRow = Record<string, string>;

export type Delimiter = "," | ";" | "\t";

const MAX_FIELD_CHARS = 50_000;

export function detectDelimiter(headerLine: string): Delimiter {
  const counts: Record<Delimiter, number> = {
    ",": 0,
    ";": 0,
    "\t": 0,
  };
  let inQuotes = false;
  for (let i = 0; i < headerLine.length; i += 1) {
    const ch = headerLine[i];
    if (ch === '"') {
      if (inQuotes && headerLine[i + 1] === '"') {
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (inQuotes) continue;
    if (ch === "," || ch === ";" || ch === "\t") {
      counts[ch] += 1;
    }
  }
  if (counts["\t"] > counts[","] && counts["\t"] > counts[";"]) return "\t";
  if (counts[";"] > counts[","] && counts[";"] > counts["\t"]) return ";";
  return ",";
}

export class CsvParser {
  private field = "";
  private current: string[] = [];
  private inQuotes = false;
  private fieldTooLong = false;

  constructor(private readonly delimiter: string) {}

  push(chunk: string): { rows: string[][]; fieldTooLong: boolean } {
    const rows: string[][] = [];
    for (let i = 0; i < chunk.length; i += 1) {
      const ch = chunk[i];
      if (this.inQuotes) {
        if (ch === '"') {
          if (chunk[i + 1] === '"') {
            this.append('"');
            i += 1;
          } else {
            this.inQuotes = false;
          }
        } else {
          this.append(ch);
        }
        continue;
      }
      if (ch === '"') {
        this.inQuotes = true;
        continue;
      }
      if (ch === this.delimiter) {
        this.pushField();
        continue;
      }
      if (ch === "\n") {
        this.pushField();
        this.pushRow(rows);
        continue;
      }
      if (ch === "\r") continue;
      this.append(ch);
    }
    return { rows, fieldTooLong: this.fieldTooLong };
  }

  flush(): string[][] {
    const rows: string[][] = [];
    if (this.field.length > 0 || this.current.length > 0) {
      this.pushField();
      this.pushRow(rows);
    }
    return rows;
  }

  private append(ch: string) {
    if (this.field.length >= MAX_FIELD_CHARS) {
      this.fieldTooLong = true;
      return;
    }
    this.field += ch;
  }

  private pushField() {
    this.current.push(this.field);
    this.field = "";
  }

  private pushRow(rows: string[][]) {
    if (this.current.length === 1 && this.current[0] === "" && rows.length === 0) {
      this.current = [];
      return;
    }
    rows.push(this.current);
    this.current = [];
  }
}

export function parseCsv(
  text: string,
  delimiter: Delimiter = ",",
): { headers: string[]; rows: CsvRow[] } {
  const parser = new CsvParser(delimiter);
  const { rows } = parser.push(text);
  rows.push(...parser.flush());
  if (rows.length === 0) return { headers: [], rows: [] };
  const headers = rows[0].map((h) => h.trim());
  const data = rows.slice(1).map((cols) => {
    const rec: CsvRow = {};
    headers.forEach((h, idx) => {
      rec[h] = cols[idx] ?? "";
    });
    return rec;
  });
  return { headers, rows: data };
}

export function rowFromFields(headers: string[], cols: string[]): CsvRow {
  const rec: CsvRow = {};
  headers.forEach((h, idx) => {
    rec[h] = cols[idx] ?? "";
  });
  return rec;
}
