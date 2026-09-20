import type { MetadataRoute } from "next";
import { INDEXABLE_ROUTES, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_ROUTES.map((route) => ({
    url: new URL(route, SITE.url).toString(),
  }));
}
