import { describe, expect, it } from "vitest";
import { ecosystem, ecosystemCategories } from "@/content/ecosystem";
import { templateCategories, templates } from "@/content/templates";

describe("template content", () => {
  it("ships exactly eight unique templates", () => {
    expect(templates).toHaveLength(8);
    expect(new Set(templates.map((item) => item.slug)).size).toBe(8);
  });

  it("covers every required category", () => {
    const categories = new Set(templates.map((item) => item.category));
    for (const category of templateCategories) {
      expect(categories.has(category.key)).toBe(true);
    }
  });

  it("keeps required template fields populated", () => {
    for (const template of templates) {
      expect(template.title.length).toBeGreaterThan(0);
      expect(template.description.length).toBeGreaterThan(0);
      expect(template.questions.length).toBeGreaterThan(0);
      expect(template.typescriptExample).toContain("@typesafe-ai/sdk");
      expect(template.limits.length).toBeGreaterThan(0);
      expect(template.sourceNotes.length).toBeGreaterThan(0);
      expect(template.lastReviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("ecosystem content", () => {
  it("contains 20 to 30 curated entries", () => {
    expect(ecosystem.length).toBeGreaterThanOrEqual(20);
    expect(ecosystem.length).toBeLessThanOrEqual(30);
  });

  it("has no duplicate names or repository URLs", () => {
    expect(new Set(ecosystem.map((item) => item.name)).size).toBe(
      ecosystem.length,
    );
    expect(new Set(ecosystem.map((item) => item.repoUrl)).size).toBe(
      ecosystem.length,
    );
  });

  it("covers each V0.1 ecosystem category", () => {
    const categories = new Set(ecosystem.map((item) => item.category));
    for (const category of ecosystemCategories) {
      expect(categories.has(category)).toBe(true);
    }
  });

  it("stores verifiable URLs and check dates", () => {
    for (const item of ecosystem) {
      expect(() => new URL(item.repoUrl)).not.toThrow();
      if (item.websiteUrl) expect(() => new URL(item.websiteUrl!)).not.toThrow();
      expect(item.lastCheckedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
