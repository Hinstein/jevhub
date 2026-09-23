import { describe, expect, it } from "vitest";
import { IDEA_VALIDATOR_COPY } from "@/i18n/idea-validator-copy";
import {
  buildIdeaValidatorQuestions,
  composeIdeaValidatorResult,
  ideaDimensions,
  validateIdeaValidatorInput,
  verdictForScore,
} from "@/lib/idea-validator";

describe("startup idea validator", () => {
  it("ships copy for every supported locale", () => {
    expect(Object.keys(IDEA_VALIDATOR_COPY)).toEqual(["en", "zh", "ja", "fr", "pl"]);
    expect(IDEA_VALIDATOR_COPY.zh.title).toContain("创业");
    expect(IDEA_VALIDATOR_COPY.ja.submit.length).toBeGreaterThan(0);
    expect(IDEA_VALIDATOR_COPY.fr.submit.length).toBeGreaterThan(0);
    expect(IDEA_VALIDATOR_COPY.pl.submit.length).toBeGreaterThan(0);
  });

  it("discloses optional idea, result, and IP retention with a 30-day period in every locale", () => {
    for (const copy of Object.values(IDEA_VALIDATOR_COPY)) {
      expect(copy.privacy).toMatch(/IP/i);
      expect(copy.retentionConsent).toMatch(/30/);
      expect(copy.retentionSaved.length).toBeGreaterThan(0);
      expect(copy.retentionUnavailable.length).toBeGreaterThan(0);
      expect(copy.typeSafePrivacyPolicy.length).toBeGreaterThan(0);
    }
  });

  it("accepts a bounded idea and builds exactly eight score questions", () => {
    const input = validateIdeaValidatorInput({
      idea: "A developer tool that groups repeated support complaints into product opportunities.",
      goal: "money",
    });

    expect(input.ok).toBe(true);
    const questions = buildIdeaValidatorQuestions("money");
    expect(Object.keys(questions)).toHaveLength(8);
    expect(Object.values(questions).every((question) => question.type === "score")).toBe(true);
  });

  it("changes the value dimension with the selected goal", () => {
    expect(ideaDimensions("money").find((item) => item.id === "value")?.label).toBe("Money");
    expect(ideaDimensions("open_source").find((item) => item.id === "value")?.label).toBe("Adoption");
    expect(ideaDimensions("fun").find((item) => item.id === "value")?.label).toBe("Fun");
  });

  it("rejects short input and invalid goals", () => {
    expect(validateIdeaValidatorInput({ idea: "tiny", goal: "money" }).ok).toBe(false);
    expect(
      validateIdeaValidatorInput({
        idea: "A long enough description for the validator to inspect.",
        goal: "unknown",
      }).ok,
    ).toBe(false);
  });

  it("computes the weighted score and verdict in application code", () => {
    const answers = Object.fromEntries(
      ideaDimensions("money").map((dimension) => [
        dimension.id,
        { score: dimension.id === "different" ? 1 : 3, confidence: 0.8 },
      ]),
    );

    const result = composeIdeaValidatorResult("money", {
      model: "jev-test",
      answers,
      usage: { input_tokens: 123 },
    });

    expect(result.dimensions).toHaveLength(8);
    expect(result.risk.id).toBe("different");
    expect(result.best.score).toBe(75);
    expect(result.overall).toBeGreaterThanOrEqual(65);
    expect(result.verdict).toBe("SHIP");
    expect(result.model).toBe("jev-test");
  });

  it("uses stable KILL FIX SHIP thresholds", () => {
    expect(verdictForScore(49)).toBe("KILL");
    expect(verdictForScore(50)).toBe("FIX");
    expect(verdictForScore(64)).toBe("FIX");
    expect(verdictForScore(65)).toBe("SHIP");
  });
});
