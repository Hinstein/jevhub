import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("V02 public copy contract", () => {
  it("keeps the revised Chinese homepage wording", () => {
    const chinesePages = source("src/components/chinese-pages.tsx");

    expect(chinesePages).toContain("Jev 学习、工具与案例，一站看懂。");
    expect(chinesePages).toContain("从这里开始");
    expect(chinesePages).toContain("让程序直接拿结果继续执行。");
    expect(chinesePages).not.toContain("学习、构建并探索 Jev。");
    expect(chinesePages).not.toContain("四条路径");
    expect(chinesePages).not.toContain("让软件可以直接消费的决策。");
  });

  it("keeps the revised Chinese SEO metadata and developer terminology", () => {
    const chineseContent = source("src/i18n/zh-content.ts");
    const englishWhatIsJev = source("src/app/what-is-jev/page.tsx");

    expect(chineseContent).toContain("了解 Jev 如何根据 state 和 Choice、Score、Noul 问题返回固定格式的结果与概率");
    expect(chineseContent).toContain("安装官方 TypeSafe JavaScript SDK，设置 API key，并发送第一个 Choice、Score 或 Noul 请求。");
    expect(chineseContent).toContain("浏览客服、销售、Agent、审核等 8 个 Jev 模板");
    expect(chineseContent).toContain('  "/playground":');
    expect(englishWhatIsJev).toContain("structured decision model for software");
    expect(englishWhatIsJev).not.toContain("semantic decision primitive");
  });

  it("preserves V02 eyebrow, calculator, store, and locale-navigation copy", () => {
    const articleShell = source("src/components/article-shell.tsx");
    const calculator = source("src/components/calculator/jev-cost-calculator.tsx");
    const storeLink = source("src/components/store-link.tsx");
    const header = source("src/components/header.tsx");
    const footer = source("src/components/footer.tsx");
    const languageSwitcher = source("src/components/language-switcher.tsx");

    expect(articleShell).toContain("LANGUAGE_COPY[locale].guide");
    expect(calculator).toContain('periodLabel: "按天还是按月"');
    expect(calculator).toContain('verified: "价格核验日期"');
    expect(storeLink).toContain("LANGUAGE_COPY[currentLocale].store");
    expect(storeLink).toContain('href={localizePath("/go/store", currentLocale)}');
    expect(header).toContain('currentPath === withoutLocale(item.href) ? "nav-link nav-active" : "nav-link"');
    expect(header).toContain("<LanguageSwitcher />");
    expect(header).not.toContain("showLanguageSwitcher");
    expect(languageSwitcher).toContain("function GlobeIcon()");
    expect(languageSwitcher).toContain("LOCALES.map");
    expect(languageSwitcher).toContain('role="menu"');
    expect(footer).not.toContain("独立社区资源，与 TypeSafe AI 无关联，也未获其认可。");
    expect(footer).not.toContain("JevHub is an independent community resource");
  });

  it("keeps the approved runtime surfaces bounded", () => {
    const playground = source("src/components/playground/jev-playground.tsx");
    const route = source("src/app/api/playground/route.ts");
    const ideaValidator = source("src/components/idea-validator/idea-validator.tsx");
    const ideaRoute = source("src/app/api/idea-validator/route.ts");

    expect(existsSync(resolve(process.cwd(), "src/app/playground/page.tsx"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "src/app/api/playground/route.ts"))).toBe(true);
    expect(playground).toContain("Run Jev");
    expect(playground).not.toContain("TYPESAFE_API_KEY");
    expect(route).toContain("TYPESAFE_API_KEY");
    expect(route).toContain("JEV_PLAYGROUND_RATE_LIMIT");
    expect(route).toContain("JEV_PLAYGROUND_TIMEOUT_MS");
    expect(ideaValidator).not.toContain("TYPESAFE_API_KEY");
    expect(ideaValidator).toContain("IDEA_VALIDATOR_COPY");
    expect(ideaRoute).toContain("TYPESAFE_API_KEY");
    expect(ideaRoute).toContain("JEV_IDEA_VALIDATOR_RATE_LIMIT");
    expect(ideaRoute).toContain("JEV_IDEA_VALIDATOR_TIMEOUT_MS");
  });
});
