export const PLAYGROUND_LIMITS = {
  stateCharacters: 8_000,
  questionCharacters: 500,
  maxQuestions: 4,
  maxCriteria: 10,
  criteriaCharacters: 80,
} as const;

export type PlaygroundDecisionType = "choice" | "noul" | "score";

export type PlaygroundQuestionInput = {
  id: string;
  type: PlaygroundDecisionType;
  instructions: string;
  criteria?: string[];
};

export type PlaygroundRequestInput = {
  state: string;
  questions: PlaygroundQuestionInput[];
};

type TypeSafeQuestion =
  | {
      type: "choice";
      instructions: string;
      criteria: Record<string, null>;
    }
  | {
      type: "noul";
      instructions: string;
    }
  | {
      type: "score";
      instructions: string;
      criteria: string[];
    };

type ValidationResult =
  | { ok: true; value: PlaygroundRequestInput }
  | { ok: false; error: string };

const RESERVED_IDS = new Set(["constructor", "prototype", "tostring"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateCriteria(
  value: unknown,
  type: Exclude<PlaygroundDecisionType, "noul">,
): { ok: true; value: string[] } | { ok: false; error: string } {
  if (!Array.isArray(value)) {
    return { ok: false, error: type + " questions require criteria." };
  }

  if (value.length < 2 || value.length > PLAYGROUND_LIMITS.maxCriteria) {
    return {
      ok: false,
      error:
        type +
        " questions need between 2 and " +
        PLAYGROUND_LIMITS.maxCriteria +
        " criteria.",
    };
  }

  const criteria = value.map((entry) =>
    typeof entry === "string" ? entry.trim() : "",
  );

  if (criteria.some((entry) => entry.length === 0)) {
    return { ok: false, error: "Criteria cannot be empty." };
  }

  if (
    criteria.some(
      (entry) => entry.length > PLAYGROUND_LIMITS.criteriaCharacters,
    )
  ) {
    return {
      ok: false,
      error:
        "Each criterion must be at most " +
        PLAYGROUND_LIMITS.criteriaCharacters +
        " characters.",
    };
  }

  if (
    new Set(criteria.map((entry) => entry.toLowerCase())).size !==
    criteria.length
  ) {
    return { ok: false, error: "Criteria must be unique." };
  }

  return { ok: true, value: criteria };
}

export function validatePlaygroundRequest(input: unknown): ValidationResult {
  if (!isRecord(input)) {
    return { ok: false, error: "Request body must be an object." };
  }

  if (typeof input.state !== "string") {
    return { ok: false, error: "State must be text." };
  }

  const state = input.state.trim();
  if (!state) {
    return { ok: false, error: "State is required." };
  }

  if (state.length > PLAYGROUND_LIMITS.stateCharacters) {
    return {
      ok: false,
      error:
        "State must be at most " +
        PLAYGROUND_LIMITS.stateCharacters +
        " characters.",
    };
  }

  if (!Array.isArray(input.questions)) {
    return { ok: false, error: "Questions must be an array." };
  }

  if (
    input.questions.length < 1 ||
    input.questions.length > PLAYGROUND_LIMITS.maxQuestions
  ) {
    return {
      ok: false,
      error:
        "Send between 1 and " +
        PLAYGROUND_LIMITS.maxQuestions +
        " questions.",
    };
  }

  const ids = new Set<string>();
  const questions: PlaygroundQuestionInput[] = [];

  for (const [index, rawQuestion] of input.questions.entries()) {
    if (!isRecord(rawQuestion)) {
      return {
        ok: false,
        error: "Question " + (index + 1) + " must be an object.",
      };
    }

    const id =
      typeof rawQuestion.id === "string" ? rawQuestion.id.trim() : "";
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(id)) {
      return {
        ok: false,
        error:
          "Question IDs must start with a lowercase letter and contain only lowercase letters, numbers, or underscores.",
      };
    }

    if (RESERVED_IDS.has(id.toLowerCase())) {
      return { ok: false, error: "That question ID is reserved." };
    }

    if (ids.has(id)) {
      return { ok: false, error: "Question IDs must be unique." };
    }
    ids.add(id);

    const type = rawQuestion.type;
    if (type !== "choice" && type !== "noul" && type !== "score") {
      return {
        ok: false,
        error: "Question " + (index + 1) + " has an invalid type.",
      };
    }

    const instructions =
      typeof rawQuestion.instructions === "string"
        ? rawQuestion.instructions.trim()
        : "";
    if (!instructions) {
      return {
        ok: false,
        error: "Question " + (index + 1) + " needs instructions.",
      };
    }

    if (instructions.length > PLAYGROUND_LIMITS.questionCharacters) {
      return {
        ok: false,
        error:
          "Question instructions must be at most " +
          PLAYGROUND_LIMITS.questionCharacters +
          " characters.",
      };
    }

    if (type === "noul") {
      questions.push({ id, type, instructions });
      continue;
    }

    const criteria = validateCriteria(rawQuestion.criteria, type);
    if (!criteria.ok) return criteria;

    questions.push({
      id,
      type,
      instructions,
      criteria: criteria.value,
    });
  }

  return { ok: true, value: { state, questions } };
}

export function buildTypeSafeQuestions(
  request: PlaygroundRequestInput,
): Record<string, TypeSafeQuestion> {
  const questions = Object.create(null) as Record<string, TypeSafeQuestion>;

  for (const question of request.questions) {
    if (question.type === "choice") {
      questions[question.id] = {
        type: "choice",
        instructions: question.instructions,
        criteria: Object.fromEntries(
          (question.criteria ?? []).map((label) => [label, null]),
        ),
      };
      continue;
    }

    if (question.type === "score") {
      questions[question.id] = {
        type: "score",
        instructions: question.instructions,
        criteria: [...(question.criteria ?? [])],
      };
      continue;
    }

    questions[question.id] = {
      type: "noul",
      instructions: question.instructions,
    };
  }

  return questions;
}
