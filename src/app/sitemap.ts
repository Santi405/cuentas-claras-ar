import type { MetadataRoute } from "next";
import { listAllLegisladorSlugs } from "@/lib/data/cached";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const slugs = await listAllLegisladorSlugs();
  return [
    { url: base },
    { url: `${base}/metodologia` },
    { url: `${base}/datos` },
    ...slugs.map((slug) => ({
      url: `${base}/legisladores/${slug}`,
    })),
  ];
}
