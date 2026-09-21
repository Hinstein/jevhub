import { describe, expect, it } from "vitest";
import { generateMetadata } from "@/app/zh-CN/[[...slug]]/page";
import { INDEXABLE_ROUTES, SITE } from "@/lib/site";

describe("hreflang route contract", () => {
  it("emits reciprocal English, Chinese, and x-default alternates for every localized route", async () => {
    for (const route of INDEXABLE_ROUTES) {
      const slug = route === "/" ? [] : route.slice(1).split("/");
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug }),
      });
      const alternates = metadata.alternates as {
        canonical: string;
        languages: Record<string, string>;
      };
      const englishUrl =
        route === "/" ? SITE.url : new URL(route, SITE.url).toString();
      const chineseUrl = new URL(
        `/zh-CN${route === "/" ? "" : route}`,
        SITE.url,
      ).toString();

      expect(alternates.canonical).toBe(chineseUrl);
      expect(alternates.languages).toEqual({
        en: englishUrl,
        "zh-CN": chineseUrl,
        "x-default": englishUrl,
      });
    }
  });
});
