"use client";

import { useEffect, useState } from "react";
import { IDEA_VALIDATOR_COPY } from "@/i18n/idea-validator-copy";
import type { Locale } from "@/i18n/config";
import { trackEvent } from "@/lib/analytics";
import {
  IDEA_GOALS,
  IDEA_VALIDATOR_LIMITS,
  type IdeaGoal,
  type IdeaValidatorResult,
} from "@/lib/idea-validator";

function scoreBucket(score: number) {
  if (score < 50) return "0_49";
  if (score < 65) return "50_64";
  if (score < 80) return "65_79";
  return "80_100";
}

export function IdeaValidator({ locale = "en" }: { locale?: Locale }) {
  const copy = IDEA_VALIDATOR_COPY[locale];
  const [idea, setIdea] = useState("");
  const [goal, setGoal] = useState<IdeaGoal>("money");
  const [result, setResult] = useState<IdeaValidatorResult | null>(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    trackEvent("idea_validator_view", { locale });
  }, [locale]);

  async function evaluate() {
    const trimmed = idea.trim();
    if (trimmed.length < IDEA_VALIDATOR_LIMITS.minIdeaCharacters) {
      setError(copy.minError(IDEA_VALIDATOR_LIMITS.minIdeaCharacters));
      return;
    }

    trackEvent("idea_validator_submit", { goal, locale });
    setRunning(true);
    setError("");

    try {
      const response = await fetch("/api/idea-validator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: trimmed, goal }),
      });

      const data = (await response.json().catch(() => ({}))) as
        | IdeaValidatorResult
        | { error?: string };

      if (!response.ok || !("dimensions" in data)) {
        throw new Error(copy.genericError);
      }

      setResult(data);
      trackEvent("idea_validator_result", {
        goal,
        locale,
        verdict: data.verdict.toLowerCase(),
        score_bucket: scoreBucket(data.overall),
      });
    } catch {
      setResult(null);
      setError(copy.genericError);
    } finally {
      setRunning(false);
    }
  }

  function shareOnX() {
    if (!result) return;

    const bestLabel = copy.dimensionLabels[result.best.id];
    const riskLabel = copy.dimensionLabels[result.risk.id];

    trackEvent("idea_validator_share", {
      goal,
      locale,
      verdict: result.verdict.toLowerCase(),
      score_bucket: scoreBucket(result.overall),
    });

    const text = copy.shareText({
      overall: result.overall,
      verdict: result.verdict,
      bestLabel,
      bestScore: result.best.score,
      riskLabel,
      riskScore: result.risk.score,
    });

    window.open(
      "https://x.com/intent/post?text=" + encodeURIComponent(text),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <section className="idea-validator" aria-label={copy.title}>
      <div className="idea-input-card">
        <label className="idea-field">
          <span>{copy.inputLabel}</span>
          <textarea
            value={idea}
            onChange={(event) => {
              setIdea(event.target.value);
              setError("");
            }}
            maxLength={IDEA_VALIDATOR_LIMITS.maxIdeaCharacters}
            rows={7}
            placeholder={copy.placeholder}
            disabled={running}
          />
          <small>
            {idea.length.toLocaleString()} /{" "}
            {IDEA_VALIDATOR_LIMITS.maxIdeaCharacters.toLocaleString()}{" "}
            {copy.characters}
          </small>
        </label>

        <fieldset className="idea-goals" disabled={running}>
          <legend>{copy.goalLegend}</legend>
          <div className="idea-goal-grid">
            {IDEA_GOALS.map((item) => (
              <label
                className={goal === item ? "idea-goal idea-goal-active" : "idea-goal"}
                key={item}
              >
                <input
                  type="radio"
                  name="idea-goal"
                  value={item}
                  checked={goal === item}
                  onChange={() => {
                    setGoal(item);
                    setResult(null);
                  }}
                />
                <strong>{copy.goals[item].title}</strong>
                <span>{copy.goals[item].body}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error ? (
          <div className="playground-error" role="alert">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          className="button-primary idea-submit"
          onClick={evaluate}
          disabled={running}
        >
          {running ? copy.running : copy.submit}
        </button>

        <p className="idea-privacy">{copy.privacy}</p>
      </div>

      <div className="idea-result-card" aria-live="polite">
        {result ? (
          <>
            <div className="idea-score-hero">
              <div>
                <div className="eyebrow">{copy.scoreEyebrow}</div>
                <strong>{result.overall}</strong>
                <span>/ 100</span>
              </div>
              <div className="idea-verdict">
                <b>{result.verdict}</b>
                <p>{copy.verdict[result.verdict]}</p>
              </div>
            </div>

            <div className="idea-dimensions">
              {result.dimensions.map((dimension) => (
                <div className="idea-dimension" key={dimension.id}>
                  <div className="idea-dimension-meta">
                    <span>{copy.dimensionLabels[dimension.id]}</span>
                    <strong>{dimension.score}</strong>
                  </div>
                  <div className="idea-score-track" aria-hidden="true">
                    <span style={{ width: `${dimension.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="idea-signals">
              <div>
                <span>{copy.bestSignal}</span>
                <strong>
                  {copy.dimensionLabels[result.best.id]} · {result.best.score}
                </strong>
              </div>
              <div>
                <span>{copy.biggestRisk}</span>
                <strong>
                  {copy.dimensionLabels[result.risk.id]} · {result.risk.score}
                </strong>
              </div>
            </div>

            <div className="actions">
              <button
                type="button"
                className="button-primary"
                onClick={() => {
                  trackEvent("idea_validator_retry", { goal, locale });
                  setResult(null);
                  setIdea("");
                  setError("");
                }}
              >
                {copy.tryAnother}
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={shareOnX}
              >
                {copy.share}
              </button>
            </div>
          </>
        ) : (
          <div className="idea-result-empty">
            <div className="output-glyph">[ 8 ]</div>
            <h2>{copy.emptyTitle}</h2>
            <p>{copy.emptyBody}</p>
            <div className="idea-preview-grid" aria-hidden="true">
              {Object.values(copy.dimensionLabels).map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
