import {
  getLegisladorByIdOrSlug,
  resolveSlugRedirect,
} from "@/lib/data/cached";
import { PUBLIC_ID_MAX_LENGTH } from "@/lib/domain/query";
import type { LegisladorDetalle } from "@/lib/domain/types";

export async function loadLegisladorByPublicId(
  idOrSlug: string,
): Promise<LegisladorDetalle | null> {
  const key = idOrSlug.trim();
  if (!key || key.length > PUBLIC_ID_MAX_LENGTH) return null;
  const redirected = await resolveSlugRedirect(key);
  return getLegisladorByIdOrSlug(redirected ?? key);
}
