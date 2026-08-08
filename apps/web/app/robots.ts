import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // gated / per-user surfaces — no SEO value, keep crawlers out
      disallow: [
        "/account",
        "/dashboard",
        "/my-subscriptions",
        "/upgrade",
        "/exams/",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
