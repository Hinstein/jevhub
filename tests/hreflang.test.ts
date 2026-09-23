import { describe, expect, it } from "vitest";
import { generateMetadata } from "@/app/zh-CN/[[...slug]]/page";
import { pageMetadata } from "@/lib/metadata";
import { SITE } from "@/lib/site";

describe("localized SEO contract", () => {
  it("does not advertise noindex locale pages as hreflang alternates", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: ["pricing"] }),
    });

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe(
      "https://jevhub.xyz/zh-CN/pricing",
    );
    expect(metadata.alternates?.languages).toBeUndefined();
  });

  it("keeps English pages self-canonical with English x-default", () => {
    const metadata = pageMetadata("Pricing", "Pricing", "/pricing");

    expect(metadata.alternates?.canonical).toBe(`${SITE.url}/pricing`);
    expect(metadata.alternates?.languages).toEqual({
      en: `${SITE.url}/pricing`,
      "x-default": `${SITE.url}/pricing`,
    });
  });
});
