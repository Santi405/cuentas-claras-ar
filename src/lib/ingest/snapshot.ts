export type SnapshotIdentity = {
  source: string;
  dataset: string;
  fiscalYear: number | null;
  retrievedAt: string;
  sourceUrl: string | null;
  sha256: string;
  filename: string;
  byteSize: number;
};

/** Never use a lone `latest.csv` as the snapshot identity. */
export function snapshotId(identity: SnapshotIdentity): string {
  const year = identity.fiscalYear ?? "na";
  const day = identity.retrievedAt.slice(0, 10);
  return `${identity.source}/${identity.dataset}/${year}/${day}/${identity.sha256.slice(0, 12)}`;
}

export function fiscalYearFromFilename(filename: string): number | null {
  const m = filename.match(
    /declaraciones-juradas-(?:bienes-|deudas-|grupo-familiar-)?(\d{4})/i,
  );
  if (!m) return null;
  const year = Number(m[1]);
  return Number.isInteger(year) ? year : null;
}

export function datasetFromFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (/grupo[-_ ]?familiar/.test(lower)) return "djpi_grupo_familiar";
  if (/bienes/.test(lower)) return "djpi_bienes";
  if (/deudas/.test(lower)) return "djpi_deudas";
  return "djpi_consolidado";
}
