import { describe, expect, it } from "vitest";
import {
  calculateJevCost,
  normalizeNonNegativeInteger,
} from "@/lib/cost-calculator";

const price = 0.042;

describe("calculateJevCost", () => {
  it("returns zero for zero usage", () => {
    expect(
      calculateJevCost({
        averageInputTokens: 0,
        requests: 1000,
        mode: "day",
        pricePerMillionInputTokens: price,
      }),
    ).toEqual({
      costPerRequest: 0,
      dailyTokens: 0,
      monthlyTokens: 0,
      dailyCost: 0,
      monthlyCost: 0,
      annualCost: 0,
    });
  });

  it("calculates one million daily input tokens", () => {
    const result = calculateJevCost({
      averageInputTokens: 1000,
      requests: 1000,
      mode: "day",
      pricePerMillionInputTokens: price,
    });

    expect(result.dailyTokens).toBe(1_000_000);
    expect(result.dailyCost).toBeCloseTo(0.042, 12);
    expect(result.annualCost).toBeCloseTo(15.3405, 8);
  });

  it("calculates monthly request mode directly", () => {
    const result = calculateJevCost({
      averageInputTokens: 500,
      requests: 2_000_000,
      mode: "month",
      pricePerMillionInputTokens: price,
    });

    expect(result.monthlyTokens).toBe(1_000_000_000);
    expect(result.monthlyCost).toBeCloseTo(42, 12);
    expect(result.annualCost).toBeCloseTo(504, 12);
  });

  it("normalizes invalid and negative inputs", () => {
    expect(normalizeNonNegativeInteger(-1)).toBe(0);
    expect(normalizeNonNegativeInteger(Number.NaN)).toBe(0);
    expect(normalizeNonNegativeInteger(12.9)).toBe(12);
  });

  it("caps unsafe integer input", () => {
    expect(normalizeNonNegativeInteger(Number.POSITIVE_INFINITY)).toBe(0);
    expect(normalizeNonNegativeInteger(Number.MAX_VALUE)).toBe(
      Number.MAX_SAFE_INTEGER,
    );
  });
});
