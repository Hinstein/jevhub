import { describe, expect, it } from "vitest";
import { generateMetadata } from "@/app/zh-CN/[[...slug]]/page";
import {
  LOCALES,
  LOCALE_CONFIG,
  localizePath,
} from "@/i18n/config";
import { INDEXABLE_ROUTES, SITE } from "@/lib/site";

describe("hreflang route contract", () => {
  it("emits reciprocal alternates for every supported locale", async () => {
    for (const route of INDEXABLE_ROUTES) {
      const slug = route === "/" ? [] : route.slice(1).split("/");
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug }),
      });
      const alternates = metadata.alternates as {
        canonical: string;
        languages: Record<string, string>;
      };
      const localizedUrls = Object.fromEntries(
        LOCALES.map((locale) => [
          LOCALE_CONFIG[locale].hrefLang,
          locale === "en" && route === "/"
            ? SITE.url
            : new URL(localizePath(route, locale), SITE.url).toString(),
        ]),
      );

      expect(alternates.canonical).toBe(localizedUrls["zh-CN"]);
      expect(alternates.languages).toEqual({
        ...localizedUrls,
        "x-default": localizedUrls.en,
      });
    }
  });
});
