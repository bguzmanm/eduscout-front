import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getJobs, getSources } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/ofertas`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/fuentes`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacidad`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terminos`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  try {
    const sources = await getSources();

    let page = 1;
    for (;;) {
      const jobsRes = await getJobs({ page, limit: 50 });
      for (const job of jobsRes.items) {
        entries.push({
          url: `${SITE_URL}/ofertas/${job.id}`,
          lastModified: new Date(job.scrapedAt ?? job.createdAt),
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
      if (page >= jobsRes.meta.totalPages) break;
      page += 1;
    }

    for (const source of sources) {
      if (!source.isActive) continue;
      entries.push({
        url: `${SITE_URL}/ofertas?source=${encodeURIComponent(source.slug)}`,
        changeFrequency: "daily",
        priority: 0.5,
      });
    }
  } catch {
    // Backend no disponible: se devuelven solo las páginas estáticas
  }

  return entries;
}