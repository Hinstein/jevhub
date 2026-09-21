export type TemplateCategory = "support" | "sales" | "agents" | "safety";

export type Primitive = "choice" | "score" | "noul";

export type TemplateQuestion = {
  id: string;
  type: Primitive;
  instruction: string;
  criteria?: Record<string, string | null> | string[];
};

export type SourceNote = {
  label: string;
  url: string;
  kind: "official" | "community" | "original";
};

export type JevTemplate = {
  slug: string;
  title: string;
  description: string;
  category: TemplateCategory;
  difficulty: "basic" | "intermediate";
  primitives: Primitive[];
  useCases: string[];
  stateExample: Record<string, unknown>;
  questions: TemplateQuestion[];
  expectedOutput: string;
  typescriptExample: string;
  whyItWorks: string[];
  limits: string[];
  sourceNotes: SourceNote[];
  lastReviewedAt: string;
};
