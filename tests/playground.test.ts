import { describe, expect, it } from "vitest";
import {
  buildTypeSafeQuestions,
  PLAYGROUND_LIMITS,
  validatePlaygroundRequest,
} from "@/lib/playground";

describe("playground request validation", () => {
  it("accepts a bounded choice request and builds the TypeSafe payload", () => {
    const result = validatePlaygroundRequest({
      state: "Customer was charged twice.",
      questions: [
        {
          id: "route",
          type: "choice",
          instructions: "Which queue should handle this?",
          criteria: ["Billing", "Technical", "Other"],
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(buildTypeSafeQuestions(result.value)).toEqual({
      route: {
        type: "choice",
        instructions: "Which queue should handle this?",
        criteria: {
          Billing: null,
          Technical: null,
          Other: null,
        },
      },
    });
  });

  it("rejects duplicate criteria and empty state", () => {
    expect(
      validatePlaygroundRequest({
        state: " ",
        questions: [
          {
            id: "route",
            type: "choice",
            instructions: "Route this",
            criteria: ["Billing", "billing"],
          },
        ],
      }).ok,
    ).toBe(false);

    const duplicate = validatePlaygroundRequest({
      state: "Message",
      questions: [
        {
          id: "route",
          type: "choice",
          instructions: "Route this",
          criteria: ["Billing", "billing"],
        },
      ],
    });

    expect(duplicate).toEqual({
      ok: false,
      error: "Criteria must be unique.",
    });
  });

  it("enforces question and state limits", () => {
    const tooMany = Array.from(
      { length: PLAYGROUND_LIMITS.maxQuestions + 1 },
      (_, index) => ({
        id: "q_" + index,
        type: "noul" as const,
        instructions: "Supported?",
      }),
    );

    expect(
      validatePlaygroundRequest({
        state: "x".repeat(PLAYGROUND_LIMITS.stateCharacters + 1),
        questions: [{ id: "q", type: "noul", instructions: "Supported?" }],
      }).ok,
    ).toBe(false);

    expect(
      validatePlaygroundRequest({
        state: "valid",
        questions: tooMany,
      }).ok,
    ).toBe(false);
  });
});
