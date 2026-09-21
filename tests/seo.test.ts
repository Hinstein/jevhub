import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { metadata as rootMetadata } from "@/app/layout";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { GET as storeRedirect } from "@/app/go/store/route";
import { metadata as calculatorMetadata } from "@/app/tools/jev-cost-calculator/page";
import { metadata as ecosystemMetadata } from "@/app/ecosystem/page";
import { metadata as gettingStartedMetadata } from "@/app/getting-started/page";
import { metadata as comparisonMetadata } from "@/app/jev-vs-chatgpt/page";
import { metadata as pricingMetadata } from "@/app/pricing/page";
import { metadata as playgroundMetadata } from "@/app/playground/page";
import { metadata as templatesMetadata } from "@/app/templates/page";
import { metadata as whatIsJevMetadata } from "@/app/what-is-jev/page";
import {
  generateMetadata as generateTemplateMetadata,
} from "@/app/templates/[slug]/page";
import { templates } from "@/content/templates";
import { pageMetadata } from "@/lib/metadata";
import { INDEXABLE_ROUTES, NAV_ITEMS, SITE } from "@/lib/site";
import {
  breadcrumbStructuredData,
  siteStructuredData,
} from "@/lib/structured-data";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("SEO route contract", () => {
  it("maps the homepage to the Jev AI search intent", () => {
    const home = source("src/app/page.tsx");
    const homeTitle =
      typeof rootMetadata.title === "string"
        ? rootMetadata.title
        : rootMetadata.title && "default" in rootMetadata.title
          ? rootMetadata.title.default
          : undefined;

    expect(homeTitle).toContain("Jev AI");
    expect(rootMetadata.description).toContain("Independent guide");
    expect((home.match(/<h1>/g) ?? []).length).toBe(1);
    expect(home).toContain("Jev AI — TypeSafe&apos;s System One Decision Model");
    for (const route of [
      "/playground",
      "/what-is-jev",
      "/getting-started",
      "/pricing",
      "/templates",
    ]) {
      expect(home).toContain(`href="${route}"`);
    }
    expect(home).toContain("How much does Jev cost?");
    expect(home).toContain("What is Jev AI?");
    expect(home).not.toContain("Separate store");
  });

  it("keeps the primary navigation aligned with page search intent", () => {
    expect(NAV_ITEMS.map((item) => item.href)).toEqual([
      "/playground",
      "/what-is-jev",
      "/getting-started",
      "/pricing",
      "/templates",
      "/ecosystem",
    ]);
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      "Playground",
      "What is Jev",
      "API",
      "Pricing",
      "Examples",
      "Ecosystem",
    ]);
  });

  it("gives the API and examples pages distinct search-intent headings", () => {
    const gettingStarted = source("src/app/getting-started/page.tsx");
    const templatesPage = source("src/app/templates/page.tsx");

    expect(gettingStarted).toContain('title="Jev API quickstart"');
    expect(gettingStarted).toContain("TypeSafe API key");
    expect(gettingStarted).toContain("official JavaScript SDK");
    expect(templatesPage).toContain(
      'title="Jev examples and decision templates"',
    );
    expect(templatesPage).toContain("Jev API examples");
    expect(templatesPage).toContain("Choice examples");
    expect(templatesPage).toContain("Score examples");
    expect(templatesPage).toContain("Noul examples");
  });

  it("has exactly 17 unique indexable routes", () => {
    expect(INDEXABLE_ROUTES).toHaveLength(17);
    expect(new Set(INDEXABLE_ROUTES).size).toBe(17);
  });

  it("gives every indexable route unique metadata and a self canonical", async () => {
    const templateMetadata = await Promise.all(
      templates.map(async (template) => [
        `/templates/${template.slug}`,
        await generateTemplateMetadata({
          params: Promise.resolve({ slug: template.slug }),
        }),
      ] as const),
    );

    const metadataByRoute = new Map<string, typeof rootMetadata>([
      ["/", rootMetadata],
      ["/playground", playgroundMetadata],
      ["/what-is-jev", whatIsJevMetadata],
      ["/pricing", pricingMetadata],
      ["/getting-started", gettingStartedMetadata],
      ["/jev-vs-chatgpt", comparisonMetadata],
      ["/tools/jev-cost-calculator", calculatorMetadata],
      ["/templates", templatesMetadata],
      ...templateMetadata,
      ["/ecosystem", ecosystemMetadata],
    ]);

    expect([...metadataByRoute.keys()]).toEqual([...INDEXABLE_ROUTES]);

    const titles = [];
    const descriptions = [];

    for (const route of INDEXABLE_ROUTES) {
      const metadata = metadataByRoute.get(route);
      expect(metadata).toBeDefined();
      if (!metadata) continue;

      const title =
        typeof metadata.title === "string"
          ? metadata.title
          : metadata.title && "default" in metadata.title
            ? metadata.title.default
            : undefined;
      const description = metadata.description;
      const expectedCanonical =
        route === "/" ? SITE.url : new URL(route, SITE.url).toString();

      expect(title).toBeTruthy();
      expect(description).toBeTruthy();
      expect(metadata.alternates?.canonical).toBe(expectedCanonical);
      expect(metadata.alternates?.languages).toMatchObject({
        en: expectedCanonical,
        "zh-CN": new URL(`/zh-CN${route === "/" ? "" : route}`, SITE.url).toString(),
        "x-default": expectedCanonical,
      });

      titles.push(title);
      descriptions.push(description);
    }

    expect(new Set(titles).size).toBe(INDEXABLE_ROUTES.length);
    expect(new Set(descriptions).size).toBe(INDEXABLE_ROUTES.length);
  });

  it("never indexes the store redirect", () => {
    expect(INDEXABLE_ROUTES).not.toContain("/go/store");
    expect(sitemap().map((entry) => entry.url)).not.toContain(
      `${SITE.url}/go/store`,
    );
  });

  it("returns a temporary noindex redirect for the external store", () => {
    const response = storeRedirect();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(SITE.storeUrl);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
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
    expect(metadata.alternates?.languages?.["x-default"]).toBe(
      `${SITE.url}/pricing`,
    );
  });

  it("uses a crawlable raster logo in Organization data", () => {
    const graph = siteStructuredData()["@graph"];

    expect(graph[0].logo.url).toBe(`${SITE.url}/logo.png`);
  });
});
