// Absolute origin for canonical URLs, OpenGraph, sitemap and robots. Set
// NEXT_PUBLIC_SITE_URL in prod; the fallback is only for local/preview builds.
// ponytail: single const, swap the default when the real domain is live.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://porikhyaaaxom.vercel.app";
