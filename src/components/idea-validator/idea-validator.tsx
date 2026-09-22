"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  IDEA_GOALS,
  IDEA_VALIDATOR_LIMITS,
  type IdeaGoal,
  type IdeaValidatorResult,
} from "@/lib/idea-validator";

const goalCopy: Record<IdeaGoal, { title: string; body: string }> = {
  money: {
    title: "Make money",
    body: "Score the idea as a product or business.",
  },
  open_source: {
    title: "Open source",
    body: "Score adoption, usefulness, and developer appeal.",
  },
  fun: {
    title: "Just for fun",
    body: "Score immediate appeal, fun, and shareability.",
  },
};

function scoreBucket(score: number) {
  if (score < 50) return "0_49";
  if (score < 65) return "50_64";
  if (score < 80) return "65_79";
  return "80_100";
}

function verdictCopy(verdict: IdeaValidatorResult["verdict"]) {
  if (verdict === "SHIP") {
    return "The description has a strong enough shape to justify a small first build or test.";
  }
  if (verdict === "FIX") {
    return "There is something here, but the weakest dimensions need a clearer answer first.";
  }
  return "The idea description is missing too many strong signals right now. Rework it before investing much time.";
}

export function IdeaValidator() {
  const [idea, setIdea] = useState("");
  const [goal, setGoal] = useState<IdeaGoal>("money");
  const [result, setResult] = useState<IdeaValidatorResult | null>(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    trackEvent("idea_validator_view");
  }, []);

  async function evaluate() {
    const trimmed = idea.trim();
    if (trimmed.length < IDEA_VALIDATOR_LIMITS.minIdeaCharacters) {
      setError(
        `Describe the idea in at least ${IDEA_VALIDATOR_LIMITS.minIdeaCharacters} characters.`,
      );
      return;
    }

    if (result) {
      trackEvent("idea_validator_retry", { goal });
    }

    trackEvent("idea_validator_submit", { goal });
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
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "The idea could not be scored right now.",
        );
      }

      setResult(data);
      trackEvent("idea_validator_result", {
        goal,
        verdict: data.verdict.toLowerCase(),
        score_bucket: scoreBucket(data.overall),
      });
    } catch (requestError) {
      setResult(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The idea could not be scored right now.",
      );
    } finally {
      setRunning(false);
    }
  }

  function shareOnX() {
    if (!result) return;
    trackEvent("idea_validator_share", {
      goal,
      verdict: result.verdict.toLowerCase(),
      score_bucket: scoreBucket(result.overall),
    });

    const text = [
      `My idea scored ${result.overall}/100 — ${result.verdict} on JevHub's Startup Idea Validator.`,
      "",
      `Best signal: ${result.best.label} ${result.best.score}`,
      `Biggest risk: ${result.risk.label} ${result.risk.score}`,
      "",
      "Try yours:",
      "https://jevhub.xyz/apps/startup-idea-validator",
    ].join("\n");

    window.open(
      "https://x.com/intent/post?text=" + encodeURIComponent(text),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <section className="idea-validator" aria-label="Startup Idea Validator">
      <div className="idea-input-card">
        <label className="idea-field">
          <span>Describe your startup or product idea</span>
          <textarea
            value={idea}
            onChange={(event) => {
              setIdea(event.target.value);
              setError("");
            }}
            maxLength={IDEA_VALIDATOR_LIMITS.maxIdeaCharacters}
            rows={7}
            placeholder="Example: A tool that monitors public Reddit discussions for repeated workflow complaints, groups similar pain points, and helps indie developers find product ideas worth researching."
          />
          <small>
            {idea.length.toLocaleString()} /{" "}
            {IDEA_VALIDATOR_LIMITS.maxIdeaCharacters.toLocaleString()} characters
          </small>
        </label>

        <fieldset className="idea-goals">
          <legend>What is your goal?</legend>
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
                <strong>{goalCopy[item].title}</strong>
                <span>{goalCopy[item].body}</span>
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
          {running ? "Jev is scoring your idea…" : "Score my idea"}
        </button>

        <p className="idea-privacy">
          No signup. The idea is sent only to the Jev scoring endpoint for this
          request and is not included in analytics events.
        </p>
      </div>

      <div className="idea-result-card" aria-live="polite">
        {result ? (
          <>
            <div className="idea-score-hero">
              <div>
                <div className="eyebrow">Jev idea score</div>
                <strong>{result.overall}</strong>
                <span>/ 100</span>
              </div>
              <div className="idea-verdict">
                <b>{result.verdict}</b>
                <p>{verdictCopy(result.verdict)}</p>
              </div>
            </div>

            <div className="idea-dimensions">
              {result.dimensions.map((dimension) => (
                <div className="idea-dimension" key={dimension.id}>
                  <div className="idea-dimension-meta">
                    <span>{dimension.label}</span>
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
                <span>Best signal</span>
                <strong>
                  {result.best.label} · {result.best.score}
                </strong>
              </div>
              <div>
                <span>Biggest risk</span>
                <strong>
                  {result.risk.label} · {result.risk.score}
                </strong>
              </div>
            </div>

            <div className="actions">
              <button
                type="button"
                className="button-primary"
                onClick={() => {
                  setResult(null);
                  setIdea("");
                }}
              >
                Try another idea
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={shareOnX}
              >
                Share result on X
              </button>
            </div>
          </>
        ) : (
          <div className="idea-result-empty">
            <div className="output-glyph">[ 8 ]</div>
            <h2>Eight bounded decisions, one result.</h2>
            <p>
              Jev scores the idea across eight dimensions, then JevHub computes
              the weighted total and verdict in normal application code.
            </p>
            <div className="idea-preview-grid" aria-hidden="true">
              {[
                "Problem",
                "Customer",
                "Demand",
                "Value",
                "Reach",
                "Different",
                "Buildable",
                "Shareable",
              ].map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
