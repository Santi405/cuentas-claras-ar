import type { MetadataRoute } from "next";
import { searchLegisladores } from "@/lib/data/cached";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const { data } = await searchLegisladores({ page: 1, pageSize: 100 });
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/metodologia`, lastModified: new Date() },
    { url: `${base}/datos`, lastModified: new Date() },
    ...data.map((item) => ({
      url: `${base}/legisladores/${item.slug}`,
      lastModified: new Date(),
    })),
  ];
}
