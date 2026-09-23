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
import { GET as chineseStoreRedirect } from "@/app/zh-CN/go/store/route";

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
    expect(localizePath("/go/store", "zh")).toBe("/zh-CN/go/store");
    expect(localizePath("/apps/inbox-triage", "zh")).toBe("/zh-CN/apps/inbox-triage");
  });

  it("maps the current page for each added locale", () => {
    const addedLocales = [
      { locale: "ja", prefix: "/ja-JP" },
      { locale: "fr", prefix: "/fr-FR" },
      { locale: "pl", prefix: "/pl-PL" },
    ] as const;

    for (const { locale, prefix } of addedLocales) {
      expect(localizePath("/pricing", locale)).toBe(`${prefix}/pricing`);
      expect(localizePath(`${prefix}/pricing`, "en")).toBe("/pricing");
      expect(withoutLocale(`${prefix}/pricing`)).toBe("/pricing");
      expect(getLocaleFromPathname(`${prefix}/pricing`)).toBe(locale);
    }
  });

  it("keeps the localized store redirect outside the indexable route set", () => {
    const response = chineseStoreRedirect();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(SITE.storeUrl);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(sitemap().map((entry) => entry.url)).not.toContain(
      `${SITE.url}/zh-CN/go/store`,
    );
  });

  it("pre-renders all 19 localized content paths", () => {
    const params = generateStaticParams();

    expect(params).toHaveLength(19);
    expect(params).toContainEqual({ slug: [] });
    expect(params).toContainEqual({ slug: ["apps", "startup-idea-validator"] });
    expect(params).toContainEqual({ slug: ["apps", "inbox-triage"] });
    expect(params).toContainEqual({ slug: ["playground"] });
    expect(params).toContainEqual({ slug: ["templates", "refund-detection"] });
  });

  it("marks localized pages noindex with self canonicals but no hreflang", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: ["pricing"] }),
    });
    const alternates = metadata.alternates as {
      canonical: string;
      languages?: Record<string, string>;
    };

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(alternates.canonical).toBe("https://jevhub.xyz/zh-CN/pricing");
    expect(alternates.languages).toBeUndefined();
    expect(sitemap().map((entry) => entry.url)).not.toContain(
      `${SITE.url}/zh-CN/pricing`,
    );
    const inboxMetadata = await generateMetadata({
      params: Promise.resolve({ slug: ["apps", "inbox-triage"] }),
    });
    expect(inboxMetadata.robots).toEqual({ index: false, follow: true });
    expect(inboxMetadata.alternates?.canonical).toBe(`${SITE.url}/zh-CN/apps/inbox-triage`);
    expect(sitemap().map((entry) => entry.url)).not.toContain(`${SITE.url}/zh-CN/apps/inbox-triage`);
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
    expect(ZH_PAGE_METADATA["/apps/startup-idea-validator"].title).toContain("创业点子评分器");
    expect(ZH_PAGE_METADATA["/apps/inbox-triage"].title).toContain("邮件速分");
  });
});
