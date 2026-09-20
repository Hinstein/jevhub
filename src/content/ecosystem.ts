import type { EcosystemItem } from "@/types/ecosystem";

const checked = "2026-09-21";
const discovery = "https://github.com/hellogumbo/awesome-jev";

export const ecosystem: EcosystemItem[] = [
  {
    name: "TypeSafe JavaScript SDK",
    description:
      "Official TypeScript/JavaScript client for System One requests, including Choice, Score, and Noul builders with inferred answer types.",
    category: "Official",
    repoUrl: "https://github.com/typesafe-ai/typesafe-sdk-js",
    websiteUrl: "https://docs.typesafe.ai/sdk/javascript",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "TypeSafe Python SDK",
    description:
      "Official Python client for TypeSafe's System One API, useful when Jev decisions live in Python services or data pipelines.",
    category: "Official",
    repoUrl: "https://github.com/typesafe-ai/typesafe-sdk-python",
    websiteUrl: "https://docs.typesafe.ai/sdk/python",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "System One Adapter (Python)",
    description:
      "Official adapter that exposes a TypeSafeClient-compatible interface backed by chat-model providers for side-by-side workflow comparisons.",
    category: "Official",
    repoUrl: "https://github.com/typesafe-ai/system-one-adapter-python",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "TypeSafe Agent Skills",
    description:
      "Official agent skill material for using System One primitives and evaluation patterns from coding agents such as Codex and Claude Code.",
    category: "Official",
    repoUrl: "https://github.com/typesafe-ai/skills",
    websiteUrl: "https://typesafe.ai",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "advocaat",
    description:
      "A compact community client that wraps TypeSafe/Jev decisions behind a type-oriented developer API.",
    category: "SDKs",
    repoUrl: "https://github.com/pithings/advocaat",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "typesafe-ai (Rust)",
    description:
      "Community Rust client for TypeSafe AI with typed request/response handling for System One workloads.",
    category: "SDKs",
    repoUrl: "https://github.com/Twister915/typesafe-ai",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "typesafe-sdk-go",
    description:
      "Community Go SDK for the TypeSafe API, aimed at typed questions and probability-bearing answers in Go services.",
    category: "SDKs",
    repoUrl: "https://github.com/Tangerg/typesafe-sdk-go",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "typesafe-sdk-swift",
    description:
      "Community Swift SDK for TypeSafe AI, providing a native path for Apple-platform applications to call System One.",
    category: "SDKs",
    repoUrl: "https://github.com/InsaneArts/typesafe-sdk-swift",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "Vercel Eve",
    description:
      "Vercel's open agent framework; its experimental evaluation path includes Jev as a decision/evaluation model option.",
    category: "Integrations",
    repoUrl: "https://github.com/vercel/eve",
    websiteUrl: "https://eve.dev",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "Vercel AI CLI",
    description:
      "A Vercel Labs terminal tool whose evaluation workflow can use Jev as the evaluator.",
    category: "Integrations",
    repoUrl: "https://github.com/vercel-labs/ai-cli",
    websiteUrl: "https://ai-cli.dev",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "zod-jev",
    description:
      "Combines local Zod shape validation with Jev-powered semantic judgments so application code can validate structure and meaning separately.",
    category: "Integrations",
    repoUrl: "https://github.com/jomatsu/zod-jev",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "zio-typesafe-ai",
    description:
      "Scala 3 / ZIO integration for the System One API with typed multi-question calls.",
    category: "Integrations",
    repoUrl: "https://github.com/jamesward/zio-typesafe-ai",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "TypeSafeAI Community Playground",
    description:
      "A large community playground exploring Jev patterns, workflows, routers, browser-agent experiments, and evaluation-oriented examples.",
    category: "Playgrounds",
    repoUrl: "https://github.com/TypeSafeAI/typesafe-playground",
    websiteUrl: "https://jev.works",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "Jev Playground",
    description:
      "A community playground focused on trying Jev primitives and inspecting structured outputs from a browser-oriented interface.",
    category: "Playgrounds",
    repoUrl: "https://github.com/shivanathd/jev-playground",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "Awesome Jev",
    description:
      "A community-maintained, searchable directory of Jev projects that JevHub uses only as a discovery source before checking original projects.",
    category: "Open Source / Research",
    repoUrl: "https://github.com/hellogumbo/awesome-jev",
    websiteUrl: "https://awesomejev.com",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "Jev Ultrafast",
    description:
      "Browser-use experiment where Jev selects browser operations and targets from a constrained action space while text generation is handled separately.",
    category: "Agent / Tooling",
    repoUrl: "https://github.com/browser-use/jev-ultrafast",
    websiteUrl: "https://browser-use.com",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "Foreman",
    description:
      "Agent-supervision tooling that uses Jev-style decisions to help keep coding-agent workflows aligned with their current task.",
    category: "Agent / Tooling",
    repoUrl: "https://github.com/thruwire/foreman",
    websiteUrl: "https://thruwire.ai",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "jev-review",
    description:
      "A community staged code-review workflow and local dashboard that uses Jev for bounded review decisions.",
    category: "Agent / Tooling",
    repoUrl: "https://github.com/devagrawal09/jev-review",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "jev-mcp",
    description:
      "An MCP server that exposes Jev judgments to coding-agent and MCP-client workflows.",
    category: "Agent / Tooling",
    repoUrl: "https://github.com/burnigtm/jev-mcp",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "jevwire",
    description:
      "A decision layer for agents that combines an MCP surface, an embeddable library, and escalation-oriented integrations.",
    category: "Agent / Tooling",
    repoUrl: "https://github.com/Brainwires/jevwire",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "Agent Chaperone",
    description:
      "Screens agent tool calls and tool results around the execution boundary, providing a useful example of semantic checks surrounding deterministic controls.",
    category: "Agent / Tooling",
    repoUrl: "https://github.com/agent-chaperone/agent-chaperone",
    websiteUrl: "https://agentchaperone.dev",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "Canny",
    description:
      "Open-source agent-completion tooling that focuses on evidence before accepting claims that a coding task is finished.",
    category: "Agent / Tooling",
    repoUrl: "https://github.com/qkal/Canny",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "jev-router",
    description:
      "Open-source LLM-routing project that uses Jev to select a model from a bounded catalog on top of LiteLLM.",
    category: "Agent / Tooling",
    repoUrl: "https://github.com/prismhq/jev-router",
    source: discovery,
    lastCheckedAt: checked,
  },
  {
    name: "SemIf",
    description:
      "Independent research project exploring Jev-like semantic if-statements with open models; useful as evidence that the decision-model pattern extends beyond one provider.",
    category: "Open Source / Research",
    repoUrl: "https://github.com/TheoLeeCJ/SemIf",
    websiteUrl: "https://openjev.com",
    source: discovery,
    lastCheckedAt: checked,
  },
];

export const ecosystemCategories = [
  "Official",
  "SDKs",
  "Integrations",
  "Playgrounds",
  "Agent / Tooling",
  "Open Source / Research",
] as const;
