export type RequestMode = "day" | "month";

export type CostInputs = {
  averageInputTokens: number;
  requests: number;
  mode: RequestMode;
  pricePerMillionInputTokens: number;
};

export type CostResult = {
  costPerRequest: number;
  dailyTokens: number;
  monthlyTokens: number;
  dailyCost: number;
  monthlyCost: number;
  annualCost: number;
};

const DAYS_PER_YEAR = 365.25;
const MONTHS_PER_YEAR = 12;
const DAYS_PER_MONTH = DAYS_PER_YEAR / MONTHS_PER_YEAR;
const TOKENS_PER_MILLION = 1_000_000;

export function normalizeNonNegativeInteger(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(Math.floor(value), Number.MAX_SAFE_INTEGER);
}

export function calculateJevCost(input: CostInputs): CostResult {
  const averageInputTokens = normalizeNonNegativeInteger(input.averageInputTokens);
  const requests = normalizeNonNegativeInteger(input.requests);
  const price = Math.max(0, Number.isFinite(input.pricePerMillionInputTokens) ? input.pricePerMillionInputTokens : 0);

  const costPerRequest = (averageInputTokens / TOKENS_PER_MILLION) * price;

  if (input.mode === "month") {
    const monthlyTokens = averageInputTokens * requests;
    const monthlyCost = (monthlyTokens / TOKENS_PER_MILLION) * price;
    const dailyTokens = monthlyTokens / DAYS_PER_MONTH;
    const dailyCost = monthlyCost / DAYS_PER_MONTH;
    return {
      costPerRequest,
      dailyTokens,
      monthlyTokens,
      dailyCost,
      monthlyCost,
      annualCost: monthlyCost * MONTHS_PER_YEAR,
    };
  }

  const dailyTokens = averageInputTokens * requests;
  const dailyCost = (dailyTokens / TOKENS_PER_MILLION) * price;
  return {
    costPerRequest,
    dailyTokens,
    monthlyTokens: dailyTokens * DAYS_PER_MONTH,
    dailyCost,
    monthlyCost: dailyCost * DAYS_PER_MONTH,
    annualCost: dailyCost * DAYS_PER_YEAR,
  };
}
