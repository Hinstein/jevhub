"use client";

import { useMemo, useRef, useState } from "react";
import { calculateJevCost, type RequestMode } from "@/lib/cost-calculator";
import { JEV_PRICING } from "@/data/jev-pricing";
import { trackEvent } from "@/lib/analytics";

const presets = [
  { label: "Small", tokens: 150, requests: 1_000 },
  { label: "Medium", tokens: 400, requests: 100_000 },
  { label: "High volume", tokens: 800, requests: 1_000_000 },
] as const;

function formatUsd(value: number) {
  if (!Number.isFinite(value)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 0.01 ? 6 : value < 1 ? 4 : 2,
    maximumFractionDigits: value < 0.01 ? 8 : value < 1 ? 4 : 2,
  }).format(value);
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    notation: value >= 1_000_000_000 ? "compact" : "standard",
  }).format(value);
}

function parseValue(value: string) {
  const parsed = Number(value.replaceAll(",", ""));
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(Math.floor(parsed), Number.MAX_SAFE_INTEGER);
}

export function JevCostCalculator() {
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
      <section className="form-panel" aria-label="Cost inputs">
        <div className="field">
          <label htmlFor="average-tokens">Average input tokens per request</label>
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
          <label htmlFor="request-mode">Request volume period</label>
          <select
            id="request-mode"
            value={mode}
            onChange={(event) => {
              setMode(event.target.value as RequestMode);
              markUsed();
            }}
          >
            <option value="day">Requests per day</option>
            <option value="month">Requests per month</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="requests">
            {mode === "day" ? "Requests per day" : "Requests per month"}
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

        <div className="small">Quick presets</div>
        <div className="preset-row">
          {presets.map((preset) => (
            <button
              className="preset"
              key={preset.label}
              type="button"
              onClick={() => setPreset(preset.tokens, preset.requests)}
            >
              {preset.label}
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
            Reset
          </button>
        </div>

        <p className="small">
          Current input rate: $
          {JEV_PRICING.pricePerMillionInputTokens} / 1M tokens. Last verified{" "}
          {JEV_PRICING.lastVerifiedAt}.
        </p>
      </section>

      <section className="results-panel" aria-live="polite">
        <div className="eyebrow">Estimated usage</div>
        <h2>Cost breakdown</h2>
        <div className="result-grid">
          <div className="metric">
            <div className="metric-label">Cost / request</div>
            <div className="metric-value">{formatUsd(result.costPerRequest)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Daily tokens</div>
            <div className="metric-value">{formatNumber(result.dailyTokens)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Daily cost</div>
            <div className="metric-value">{formatUsd(result.dailyCost)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Monthly cost</div>
            <div className="metric-value">{formatUsd(result.monthlyCost)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Annual cost</div>
            <div className="metric-value">{formatUsd(result.annualCost)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Monthly tokens</div>
            <div className="metric-value">
              {formatNumber(result.monthlyTokens)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
