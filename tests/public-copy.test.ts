import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function between(text: string, start: string, end: string) {
  const startIndex = text.indexOf(start);
  const endIndex = text.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0) {
    throw new Error("Could not locate source section");
  }
  return text.slice(startIndex, endIndex);
}

describe("public-facing copy", () => {
  it("keeps Playground messaging focused on the user instead of credential internals", () => {
    const englishPage = source("src/app/playground/page.tsx");
    const playground = source("src/components/playground/jev-playground.tsx");
    const chinesePages = source("src/components/chinese-pages.tsx");
    const chinesePlayground = between(
      chinesePages,
      "export function ChinesePlaygroundPage()",
      "export function ChineseWhatIsJevPage()",
    );

    expect(englishPage).not.toMatch(/api key|credential|server-side/i);
    expect(playground).not.toMatch(/api key|credential|server-side/i);
    expect(chinesePlayground).not.toMatch(/API Key|凭证|服务端|原语/);
  });

  it("keeps the What is Jev introduction free of unnecessary implementation jargon", () => {
    const englishPage = source("src/app/what-is-jev/page.tsx");
    const chinesePages = source("src/components/chinese-pages.tsx");
    const chineseWhatIsJev = between(
      chinesePages,
      "export function ChineseWhatIsJevPage()",
      "function formatUsd",
    );

    expect(englishPage).not.toMatch(/api key|semantic decision primitive/i);
    expect(chineseWhatIsJev).not.toMatch(/API Key|语义决策原语|先理解原语/);
  });

  it("keeps Chinese developer copy free of literal translation jargon", () => {
    const chinesePages = source("src/components/chinese-pages.tsx");
    const chineseContent = source("src/i18n/zh-content.ts");
    const chineseExplainer = source("src/components/jev-decision-explainer.tsx");
    const combined = [chinesePages, chineseContent, chineseExplainer].join("\n");

    expect(combined).not.toMatch(
      /类型化|边界清晰|原语|智能体|有序量表|泛化推广|一等结果|外围程序|受约束/,
    );
  });

  it("does not mix the English disclaimer into the Chinese footer", () => {
    const footer = source("src/components/footer.tsx");

    expect(footer).toContain(
      "独立社区资源，与 TypeSafe AI 无关联，也未获其认可。",
    );
    expect(footer).not.toContain(
      "独立社区资源，与 TypeSafe AI 无关联，也未获其认可。JevHub is",
    );
  });
});
