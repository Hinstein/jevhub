import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { templates } from "@/content/templates";
import { pageMetadata } from "@/lib/metadata";
import { INDEXABLE_ROUTES, SITE } from "@/lib/site";
import {
  breadcrumbStructuredData,
  siteStructuredData,
} from "@/lib/structured-data";

describe("SEO route contract", () => {
  it("has exactly 16 unique indexable routes", () => {
    expect(INDEXABLE_ROUTES).toHaveLength(16);
    expect(new Set(INDEXABLE_ROUTES).size).toBe(16);
  });

  it("never indexes the store redirect", () => {
    expect(INDEXABLE_ROUTES).not.toContain("/go/store");
    expect(sitemap().map((entry) => entry.url)).not.toContain(
      `${SITE.url}/go/store`,
    );
  });

  it("keeps /go/store crawlable so its X-Robots-Tag noindex can be seen", () => {
    expect(JSON.stringify(robots().rules)).not.toContain("/go/");
  });

  it("does not publish stale sitemap lastModified values", () => {
    for (const entry of sitemap()) {
      expect(entry.lastModified).toBeUndefined();
    }
    expect(sitemap()[0].url).toBe(SITE.url);
  });

  it("contains all eight template detail routes", () => {
    for (const template of templates) {
      expect(INDEXABLE_ROUTES).toContain(`/templates/${template.slug}`);
    }
  });

  it("uses the production domain", () => {
    expect(new URL(SITE.url).hostname).toBe("jevhub.xyz");
    expect(new URL(SITE.storeUrl).hostname).toBe("jevhub.store");
  });

  it("emits Organization and WebSite structured data", () => {
    const graph = siteStructuredData()["@graph"];
    expect(graph.map((entry) => entry["@type"])).toEqual([
      "Organization",
      "WebSite",
    ]);
    expect(graph[0].url).toBe(SITE.url);
    expect(graph[1].url).toBe(SITE.url);
  });

  it("builds canonical BreadcrumbList items", () => {
    const data = breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Templates", path: "/templates" },
    ]);

    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement[1].item).toBe(
      `${SITE.url}/templates`,
    );
  });

  it("provides share image metadata for content pages", () => {
    const metadata = pageMetadata("Jev Pricing", "Pricing guide", "/pricing");
    const serialized = JSON.stringify(metadata);

    expect(serialized).toContain(`${SITE.url}/opengraph-image`);
    expect(JSON.stringify(metadata.twitter)).toContain("summary_large_image");
  });

  it("uses a crawlable raster logo in Organization data", () => {
    const graph = siteStructuredData()["@graph"];

    expect(graph[0].logo.url).toBe(`${SITE.url}/logo.png`);
  });
});
