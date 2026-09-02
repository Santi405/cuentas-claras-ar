export const SITE_NAME = "DDJJ Congreso";

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export const SITE_DESCRIPTION =
  "Explorador de declaraciones juradas patrimoniales de diputados y senadores nacionales. Datos públicos, valores fiscales, sin conclusiones políticas.";
