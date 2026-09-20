import { describe, expect, it } from "vitest";
import { JEV_PRICING } from "@/data/jev-pricing";

describe("Jev pricing config", () => {
  it("keeps the current official price in one structured config", () => {
    expect(JEV_PRICING.currency).toBe("USD");
    expect(JEV_PRICING.pricePerMillionInputTokens).toBe(0.042);
    expect(JEV_PRICING.pricePerMillionOutputTokens).toBe(0);
    expect(JEV_PRICING.sourceUrl).toMatch(/^https:\/\/typesafe\.ai\//);
    expect(JEV_PRICING.lastVerifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
