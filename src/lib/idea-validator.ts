export const IDEA_VALIDATOR_LIMITS = {
  minIdeaCharacters: 20,
  maxIdeaCharacters: 3_000,
} as const;

export const IDEA_GOALS = ["money", "open_source", "fun"] as const;
export type IdeaGoal = (typeof IDEA_GOALS)[number];

export type IdeaDimensionId =
  | "problem"
  | "customer"
  | "demand"
  | "value"
  | "reach"
  | "different"
  | "buildable"
  | "shareable";

export type IdeaDimension = {
  id: IdeaDimensionId;
  label: string;
  question: string;
  criteria: [string, string, string, string, string];
  weight: number;
};

export type IdeaValidatorInput = {
  idea: string;
  goal: IdeaGoal;
};

export type IdeaDimensionResult = {
  id: IdeaDimensionId;
  label: string;
  score: number;
  rawScore: number;
  confidence?: number;
};

export type IdeaVerdict = "KILL" | "FIX" | "SHIP";

export type IdeaValidatorResult = {
  overall: number;
  verdict: IdeaVerdict;
  goal: IdeaGoal;
  dimensions: IdeaDimensionResult[];
  best: IdeaDimensionResult;
  risk: IdeaDimensionResult;
  model?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
};

type ValidationResult =
  | { ok: true; value: IdeaValidatorInput }
  | { ok: false; error: string };

type UpstreamScoreAnswer = {
  score?: unknown;
  confidence?: unknown;
};

type UpstreamResponse = {
  model?: unknown;
  answers?: unknown;
  usage?: unknown;
};

const common = {
  weakToStrong: [
    "No credible signal in the description",
    "Weak signal with major gaps",
    "Plausible but not yet convincing",
    "Strong signal with concrete support",
    "Very strong signal with clear, specific support",
  ] as [string, string, string, string, string],
};

function valueDimension(goal: IdeaGoal): Pick<IdeaDimension, "label" | "question" | "criteria"> {
  if (goal === "open_source") {
    return {
      label: "Adoption",
      question:
        "How strong is the case that the intended users or developers would install, star, adopt, or contribute to this project?",
      criteria: common.weakToStrong,
    };
  }
  if (goal === "fun") {
    return {
      label: "Fun",
      question:
        "How strong is the case that building or using this idea would be genuinely enjoyable or satisfying for its intended audience?",
      criteria: common.weakToStrong,
    };
  }
  return {
    label: "Money",
    question:
      "How strong is the case that the intended customer would pay money to solve this problem or obtain this outcome?",
    criteria: common.weakToStrong,
  };
}

function problemDimension(goal: IdeaGoal): Pick<IdeaDimension, "label" | "question" | "criteria"> {
  if (goal === "fun") {
    return {
      label: "Immediate appeal",
      question:
        "How quickly does the idea communicate an experience that its intended audience would want to try?",
      criteria: common.weakToStrong,
    };
  }
  return {
    label: "Real problem",
    question:
      "How strongly does the description support that the target user has a real, recurring, or costly problem worth solving?",
    criteria: common.weakToStrong,
  };
}

export function ideaDimensions(goal: IdeaGoal): IdeaDimension[] {
  const problem = problemDimension(goal);
  const value = valueDimension(goal);

  return [
    {
      id: "problem",
      ...problem,
      weight: 2,
    },
    {
      id: "customer",
      label: "Clear customer",
      question:
        "How clearly does the description identify a specific user or customer who would care about this idea?",
      criteria: common.weakToStrong,
      weight: 1,
    },
    {
      id: "demand",
      label: "Demand",
      question:
        "How strong is the evidence in the description that people already spend time, money, effort, or attention trying to get this outcome?",
      criteria: common.weakToStrong,
      weight: 1,
    },
    {
      id: "value",
      ...value,
      weight: 2,
    },
    {
      id: "reach",
      label: "Reach",
      question:
        "How realistically could a small team reach the intended audience through identifiable channels?",
      criteria: common.weakToStrong,
      weight: 1,
    },
    {
      id: "different",
      label: "Different",
      question:
        "How clearly does the description explain why this approach is meaningfully different from obvious alternatives?",
      criteria: common.weakToStrong,
      weight: 1,
    },
    {
      id: "buildable",
      label: "Buildable",
      question:
        "How feasible is it for one or two developers to build a useful first version without unusually large capital, data, or operational requirements?",
      criteria: common.weakToStrong,
      weight: 1,
    },
    {
      id: "shareable",
      label: "Shareable",
      question:
        "How naturally could users explain, demonstrate, recommend, or share the value of this idea with someone else?",
      criteria: common.weakToStrong,
      weight: 1,
    },
  ];
}

export function validateIdeaValidatorInput(input: unknown): ValidationResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, error: "Request body must be an object." };
  }

  const raw = input as Record<string, unknown>;
  const idea = typeof raw.idea === "string" ? raw.idea.trim() : "";
  const goal = raw.goal;

  if (idea.length < IDEA_VALIDATOR_LIMITS.minIdeaCharacters) {
    return {
      ok: false,
      error: `Describe the idea in at least ${IDEA_VALIDATOR_LIMITS.minIdeaCharacters} characters.`,
    };
  }

  if (idea.length > IDEA_VALIDATOR_LIMITS.maxIdeaCharacters) {
    return {
      ok: false,
      error: `Keep the idea under ${IDEA_VALIDATOR_LIMITS.maxIdeaCharacters.toLocaleString()} characters.`,
    };
  }

  if (!IDEA_GOALS.includes(goal as IdeaGoal)) {
    return { ok: false, error: "Choose a valid goal." };
  }

  return { ok: true, value: { idea, goal: goal as IdeaGoal } };
}

export function buildIdeaValidatorQuestions(goal: IdeaGoal) {
  return Object.fromEntries(
    ideaDimensions(goal).map((dimension) => [
      dimension.id,
      {
        type: "score" as const,
        instructions:
          dimension.question +
          " Judge only from the supplied idea description. Do not assume external market research, regulations, competitor data, traction, or facts that are not provided.",
        criteria: dimension.criteria,
      },
    ]),
  );
}

function numeric(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function clampRawScore(score: number) {
  return Math.max(0, Math.min(4, score));
}

export function verdictForScore(score: number): IdeaVerdict {
  if (score < 50) return "KILL";
  if (score < 65) return "FIX";
  return "SHIP";
}

export function composeIdeaValidatorResult(
  goal: IdeaGoal,
  upstream: UpstreamResponse,
): IdeaValidatorResult {
  if (
    typeof upstream.answers !== "object" ||
    upstream.answers === null ||
    Array.isArray(upstream.answers)
  ) {
    throw new Error("Jev returned an invalid answer set.");
  }

  const answers = upstream.answers as Record<string, UpstreamScoreAnswer>;
  const dimensions = ideaDimensions(goal);

  const results = dimensions.map((dimension): IdeaDimensionResult => {
    const answer = answers[dimension.id];
    const raw = numeric(answer?.score);
    if (raw === undefined) {
      throw new Error(`Jev did not return a score for ${dimension.id}.`);
    }

    const rawScore = clampRawScore(raw);
    const confidence = numeric(answer?.confidence);

    return {
      id: dimension.id,
      label: dimension.label,
      rawScore,
      score: Math.round((rawScore / 4) * 100),
      ...(confidence === undefined ? {} : { confidence }),
    };
  });

  const totalWeight = dimensions.reduce((sum, dimension) => sum + dimension.weight, 0);
  const weighted = results.reduce((sum, result) => {
    const weight = dimensions.find((dimension) => dimension.id === result.id)?.weight ?? 1;
    return sum + result.score * weight;
  }, 0);
  const overall = Math.round(weighted / totalWeight);

  const best = results.reduce((current, item) =>
    item.score > current.score ? item : current,
  );
  const risk = results.reduce((current, item) =>
    item.score < current.score ? item : current,
  );

  const usage =
    typeof upstream.usage === "object" &&
    upstream.usage !== null &&
    !Array.isArray(upstream.usage)
      ? (upstream.usage as IdeaValidatorResult["usage"])
      : undefined;

  return {
    overall,
    verdict: verdictForScore(overall),
    goal,
    dimensions: results,
    best,
    risk,
    ...(typeof upstream.model === "string" ? { model: upstream.model } : {}),
    ...(usage ? { usage } : {}),
  };
}
