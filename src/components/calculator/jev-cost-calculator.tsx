"use client";

import { useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { calculateJevCost, type RequestMode } from "@/lib/cost-calculator";
import { JEV_PRICING } from "@/data/jev-pricing";
import { trackEvent } from "@/lib/analytics";

const presets = [
  { label: "Small", tokens: 150, requests: 1_000 },
  { label: "Medium", tokens: 400, requests: 100_000 },
  { label: "High volume", tokens: 800, requests: 1_000_000 },
] as const;

function formatUsd(value: number, locale: Locale) {
  if (!Number.isFinite(value)) return "$0";
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 0.01 ? 6 : value < 1 ? 4 : 2,
    maximumFractionDigits: value < 0.01 ? 8 : value < 1 ? 4 : 2,
  }).format(value);
}

function formatNumber(value: number, locale: Locale) {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 2,
    notation: value >= 1_000_000_000 ? "compact" : "standard",
  }).format(value);
}

function parseValue(value: string) {
  const parsed = Number(value.replaceAll(",", ""));
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(Math.floor(parsed), Number.MAX_SAFE_INTEGER);
}

export function JevCostCalculator({ locale = "en" }: { locale?: Locale }) {
  const copy =
    locale === "zh"
      ? {
          inputLabel: "每次请求的平均输入 token 数",
          periodLabel: "按天还是按月",
          perDay: "每天请求数",
          perMonth: "每月请求数",
          presets: "快速预设",
          small: "小规模",
          medium: "中规模",
          highVolume: "高用量",
          reset: "重置",
          rate: "当前输入价格",
          verified: "价格核验日期",
          estimated: "估算结果",
          breakdown: "成本明细",
          perRequest: "每次请求成本",
          dailyTokens: "每日 token 数",
          dailyCost: "每日成本",
          monthlyCost: "每月成本",
          annualCost: "每年成本",
          monthlyTokens: "每月 token 数",
        }
      : {
          inputLabel: "Average input tokens per request",
          periodLabel: "Request volume period",
          perDay: "Requests per day",
          perMonth: "Requests per month",
          presets: "Quick presets",
          small: "Small",
          medium: "Medium",
          highVolume: "High volume",
          reset: "Reset",
          rate: "Current input rate",
          verified: "Last verified",
          estimated: "Estimated usage",
          breakdown: "Cost breakdown",
          perRequest: "Cost / request",
          dailyTokens: "Daily tokens",
          dailyCost: "Daily cost",
          monthlyCost: "Monthly cost",
          annualCost: "Annual cost",
          monthlyTokens: "Monthly tokens",
        };

  const [averageTokens, setAverageTokens] = useState(400);
  const [requests, setRequests] = useState(100_000);
  const [mode, setMode] = useState<RequestMode>("day");
  const tracked = useRef(false);

  function markUsed() {
    if (tracked.current) return;
    tracked.current = true;
    trackEvent("calculator_used", { mode });
  }

  const result = useMemo(
    () =>
      calculateJevCost({
        averageInputTokens: averageTokens,
        requests,
        mode,
        pricePerMillionInputTokens:
          JEV_PRICING.pricePerMillionInputTokens,
      }),
    [averageTokens, requests, mode],
  );

  function setPreset(tokens: number, requestCount: number) {
    setAverageTokens(tokens);
    setRequests(requestCount);
    setMode("day");
    markUsed();
  }

  return (
    <div className="calculator">
      <section
        className="form-panel"
        aria-label={locale === "zh" ? "成本输入" : "Cost inputs"}
      >
        <div className="field">
          <label htmlFor="average-tokens">{copy.inputLabel}</label>
          <input
            id="average-tokens"
            inputMode="numeric"
            min={0}
            step={1}
            type="number"
            value={averageTokens}
            onChange={(event) => {
              setAverageTokens(parseValue(event.target.value));
              markUsed();
            }}
          />
        </div>

        <div className="field">
          <label htmlFor="request-mode">{copy.periodLabel}</label>
          <select
            id="request-mode"
            value={mode}
            onChange={(event) => {
              setMode(event.target.value as RequestMode);
              markUsed();
            }}
          >
            <option value="day">{copy.perDay}</option>
            <option value="month">{copy.perMonth}</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="requests">
            {mode === "day" ? copy.perDay : copy.perMonth}
          </label>
          <input
            id="requests"
            inputMode="numeric"
            min={0}
            step={1}
            type="number"
            value={requests}
            onChange={(event) => {
              setRequests(parseValue(event.target.value));
              markUsed();
            }}
          />
        </div>

        <div className="small">{copy.presets}</div>
        <div className="preset-row">
          {presets.map((preset) => (
            <button
              className="preset"
              key={preset.label}
              type="button"
              onClick={() => setPreset(preset.tokens, preset.requests)}
            >
              {preset.label === "Small"
                ? copy.small
                : preset.label === "Medium"
                  ? copy.medium
                  : copy.highVolume}
            </button>
          ))}
          <button
            className="preset"
            type="button"
            onClick={() => {
              setAverageTokens(0);
              setRequests(0);
              setMode("day");
              markUsed();
            }}
          >
            {copy.reset}
          </button>
        </div>

        <p className="small">
          {copy.rate}: ${JEV_PRICING.pricePerMillionInputTokens} / 1M tokens. {copy.verified}{" "}
          {JEV_PRICING.lastVerifiedAt}.
        </p>
      </section>

      <section className="results-panel" aria-live="polite">
        <div className="eyebrow">{copy.estimated}</div>
        <h2>{copy.breakdown}</h2>
        <div className="result-grid">
          <div className="metric">
            <div className="metric-label">{copy.perRequest}</div>
            <div className="metric-value">{formatUsd(result.costPerRequest, locale)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">{copy.dailyTokens}</div>
            <div className="metric-value">{formatNumber(result.dailyTokens, locale)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">{copy.dailyCost}</div>
            <div className="metric-value">{formatUsd(result.dailyCost, locale)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">{copy.monthlyCost}</div>
            <div className="metric-value">{formatUsd(result.monthlyCost, locale)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">{copy.annualCost}</div>
            <div className="metric-value">{formatUsd(result.annualCost, locale)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">{copy.monthlyTokens}</div>
            <div className="metric-value">
              {formatNumber(result.monthlyTokens, locale)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
