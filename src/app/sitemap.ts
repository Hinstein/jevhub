import type { MetadataRoute } from "next";
import { INDEXABLE_ROUTES, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-09-21T00:00:00Z");

  return INDEXABLE_ROUTES.map((route) => ({
    url: new URL(route, SITE.url).toString(),
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.startsWith("/templates/") ? 0.7 : 0.8,
  }));
}
