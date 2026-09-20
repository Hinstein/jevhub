import { describe, expect, it } from "vitest";
import { INDEXABLE_ROUTES, SITE } from "@/lib/site";
import { templates } from "@/content/templates";

describe("SEO route contract", () => {
  it("has exactly 16 unique indexable routes", () => {
    expect(INDEXABLE_ROUTES).toHaveLength(16);
    expect(new Set(INDEXABLE_ROUTES).size).toBe(16);
  });

  it("never indexes the store redirect", () => {
    expect(INDEXABLE_ROUTES).not.toContain("/go/store");
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
});
