import { describe, expect, it } from "vitest";
import {
  getLocaleFromPathname,
  localizePath,
  withoutLocale,
} from "@/i18n/config";
import {
  localizedEcosystemCategory,
  localizedPrimitive,
  localizedTemplate,
  ZH_PAGE_METADATA,
} from "@/i18n/zh-content";
import { ecosystem } from "@/content/ecosystem";
import { templateBySlug } from "@/content/templates";
import {
  generateMetadata,
  generateStaticParams,
} from "@/app/zh-CN/[[...slug]]/page";
import sitemap from "@/app/sitemap";
import { SITE } from "@/lib/site";

describe("locale routing", () => {
  it("maps the current page between English and zh-CN paths", () => {
    expect(localizePath("/", "zh")).toBe("/zh-CN");
    expect(localizePath("/zh-CN/pricing", "en")).toBe("/pricing");
    expect(localizePath("/templates/agent-router", "zh")).toBe(
      "/zh-CN/templates/agent-router",
    );
    expect(withoutLocale("/zh-CN/tools/jev-cost-calculator")).toBe(
      "/tools/jev-cost-calculator",
    );
    expect(getLocaleFromPathname("/zh-CN")).toBe("zh");
    expect(getLocaleFromPathname("/pricing")).toBe("en");
  });

  it("pre-renders the 17 localized content paths", () => {
    const params = generateStaticParams();

    expect(params).toHaveLength(17);
    expect(params).toContainEqual({ slug: [] });
    expect(params).toContainEqual({ slug: ["playground"] });
    expect(params).toContainEqual({ slug: ["templates", "refund-detection"] });
  });

  it("marks localized pages noindex while keeping self canonicals and hreflang", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: ["pricing"] }),
    });
    const alternates = metadata.alternates as {
      canonical: string;
      languages: Record<string, string>;
    };

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(alternates.canonical).toBe("https://jevhub.xyz/zh-CN/pricing");
    expect(alternates.languages.en).toBe("https://jevhub.xyz/pricing");
    expect(alternates.languages["zh-CN"]).toBe(
      "https://jevhub.xyz/zh-CN/pricing",
    );
    expect(sitemap().map((entry) => entry.url)).not.toContain(
      `${SITE.url}/zh-CN/pricing`,
    );
  });
});

describe("localized content", () => {
  it("translates template and ecosystem presentation without changing slugs or URLs", () => {
    const template = templateBySlug.get("refund-detection");
    if (!template) throw new Error("refund-detection template is missing");

    const localized = localizedTemplate(template, "zh");
    expect(localized.slug).toBe(template.slug);
    expect(localized.title).toBe("退款请求识别");
    expect(localized.questions[0].instruction).toBe("客户的主要请求是什么？");

    expect(localizedEcosystemCategory(ecosystem[0].category, "zh")).toBe("官方");
    expect(localizedPrimitive("choice", "zh")).toBe("Choice");
    expect(localizedPrimitive("score", "zh")).toBe("Score");
  });

  it("keeps the V02 Chinese SEO metadata for the V0.1 route set", () => {
    expect(ZH_PAGE_METADATA["/"].title).toBe("JevHub：学习、构建并探索 Jev");
    expect(ZH_PAGE_METADATA["/what-is-jev"].description).toContain(
      "根据 state 和 Choice、Score、Noul 问题返回固定格式的结果与概率",
    );
    expect(ZH_PAGE_METADATA["/templates"].description).toContain(
      "客服、销售、Agent、审核等 8 个 Jev 模板",
    );
    expect(ZH_PAGE_METADATA["/playground"].title).toContain("Jev Playground");
  });
});
