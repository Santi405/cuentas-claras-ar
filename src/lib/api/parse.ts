import { z } from "zod";
import { slugifyDistrito } from "@/lib/domain/slugs";
import { asRecord, invalidQueryMessage, legisladoresQuerySchema } from "./schemas";

export type LegisladoresQuery = z.infer<typeof legisladoresQuerySchema> & {
  distrito?: string;
};

export function parseLegisladoresQuery(
  searchParams: URLSearchParams,
):
  | { ok: true; data: LegisladoresQuery }
  | { ok: false; message: string } {
  const parsed = legisladoresQuerySchema.safeParse(asRecord(searchParams));
  if (!parsed.success) {
    return { ok: false, message: invalidQueryMessage(parsed.error) };
  }
  const distrito = parsed.data.distrito
    ? slugifyDistrito(parsed.data.distrito)
    : undefined;
  return {
    ok: true,
    data: {
      ...parsed.data,
      distrito: distrito || undefined,
    },
  };
}
