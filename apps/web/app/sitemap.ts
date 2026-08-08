import type { MetadataRoute } from "next";
import { getPublicPyqPapers } from "@/lib/actions/previous-year-papers.action";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const papers = await getPublicPyqPapers();

  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/previous-year-papers`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...papers.map((p) => ({
      url: `${SITE_URL}/previous-year-papers/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
