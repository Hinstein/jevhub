import type { JevTemplate } from "@/types/template";

const OFFICIAL_SDK =
  "https://github.com/typesafe-ai/typesafe-sdk-js";
const COMMUNITY_PLAYGROUND =
  "https://github.com/TypeSafeAI/typesafe-playground";

export const templates: JevTemplate[] = [
  {
    slug: "refund-detection",
    title: "Refund Detection",
    description:
      "Identify whether a support case is primarily asking for money back, without turning classification into refund authorization.",
    category: "support",
    difficulty: "basic",
    primitives: ["choice", "noul"],
    useCases: ["Support triage", "Billing queues", "Refund review intake"],
    stateExample: {
      latest_message: "I was charged twice for order A-1042. Please reverse one charge.",
      order_id: "A-1042",
      settled_charges_count: 2,
      previous_refund: false,
    },
    questions: [
      {
        id: "primary_request",
        type: "choice",
        instruction: "What is the customer's primary request?",
        criteria: {
          refund: "Money back or reversing a charge",
          access: "Account or login help",
          troubleshooting: "Help with broken product behavior",
          cancel: "Ending a subscription",
          other: "None of the above",
        },
      },
      {
        id: "refund_request_supported",
        type: "noul",
        instruction:
          "Does the supplied message and order state support that the customer is asking for a refund or charge reversal?",
      },
    ],
    expectedOutput:
      "A typed primary_request label plus a probability for whether the evidence supports a refund request.",
    typescriptExample: `import { choice, noul, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();

const result = await client.systemOne({
  state: {
    latest_message:
      "I was charged twice for order A-1042. Please reverse one charge.",
    order_id: "A-1042",
    settled_charges_count: 2,
    previous_refund: false,
  },
  questions: {
    primary_request: choice("What is the customer's primary request?", {
      refund: "Money back or reversing a charge",
      access: "Account or login help",
      troubleshooting: "Help with broken product behavior",
      cancel: "Ending a subscription",
      other: "None of the above",
    }),
    refund_request_supported: noul(
      "Does the supplied evidence support that the customer is asking for a refund or charge reversal?"
    ),
  },
});

console.log(result.answers);`,
    whyItWorks: [
      "The classification space is closed and operationally useful.",
      "The state separates what the customer said from order facts.",
      "The extra Noul question preserves uncertainty instead of forcing every case into an action.",
    ],
    limits: [
      "Detecting a refund request does not authorize a refund.",
      "Actual refund eligibility should be checked by deterministic policy and payment records.",
    ],
    sourceNotes: [
      {
        label: "TypeSafe official JavaScript SDK quickstart",
        url: OFFICIAL_SDK,
        kind: "official",
      },
      {
        label: "Community Playground duplicate-charge example",
        url: `${COMMUNITY_PLAYGROUND}/blob/main/web/catalog.json`,
        kind: "community",
      },
    ],
  },
  {
    slug: "support-routing",
    title: "Support Routing",
    description:
      "Route an incoming support message to one primary queue and score how quickly it should be reviewed.",
    category: "support",
    difficulty: "basic",
    primitives: ["choice", "score"],
    useCases: ["Ticket routing", "Queue prioritization", "Support automation"],
    stateExample: {
      message: "My card was charged, but the upgrade never appeared.",
      customer_plan: "Starter",
      payment_status: "settled",
    },
    questions: [
      {
        id: "queue",
        type: "choice",
        instruction: "Choose the primary support queue for this case.",
        criteria: {
          billing: "Payment, invoice, or charge issue",
          account: "Account, access, or entitlement issue",
          technical: "Product behavior or technical failure",
          cancellation: "Subscription cancellation",
          other: "None is clearly primary",
        },
      },
      {
        id: "urgency",
        type: "score",
        instruction: "Score review urgency from 0 to 3.",
        criteria: [
          "0 — routine; no time-sensitive impact",
          "1 — minor impact",
          "2 — active customer impact",
          "3 — severe or time-critical customer impact",
        ],
      },
    ],
    expectedOutput:
      "One primary queue plus an expected urgency score from the ordered rubric.",
    typescriptExample: `import { choice, score, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();

const result = await client.systemOne({
  state: {
    message: "My card was charged, but the upgrade never appeared.",
    customer_plan: "Starter",
    payment_status: "settled",
  },
  questions: {
    queue: choice("Choose the primary support queue.", {
      billing: "Payment, invoice, or charge issue",
      account: "Account, access, or entitlement issue",
      technical: "Product behavior or technical failure",
      cancellation: "Subscription cancellation",
      other: "None is clearly primary",
    }),
    urgency: score("Score review urgency.", [
      "Routine",
      "Minor impact",
      "Active customer impact",
      "Severe or time-critical impact",
    ]),
  },
});`,
    whyItWorks: [
      "A primary-route instruction resolves cases that could plausibly fit multiple queues.",
      "The urgency rubric is explicit instead of asking for an undefined number.",
    ],
    limits: [
      "Routing should not silently discard secondary issues.",
      "Urgency is a triage signal, not a service-level agreement.",
    ],
    sourceNotes: [
      {
        label: "Community Playground customer-support intent patterns",
        url: `${COMMUNITY_PLAYGROUND}/blob/main/web/catalog.json`,
        kind: "community",
      },
      {
        label: "JevHub urgency rubric",
        url: "https://jevhub.xyz/templates/support-routing",
        kind: "original",
      },
    ],
  },
  {
    slug: "lead-qualification",
    title: "Lead Qualification",
    description:
      "Separate real sales opportunities from partnerships, support requests, spam, and unclear inbound messages.",
    category: "sales",
    difficulty: "intermediate",
    primitives: ["choice", "noul", "score"],
    useCases: ["Inbound sales", "CRM triage", "Sales alerts"],
    stateExample: {
      message:
        "We have 35 support agents and need SSO. Can we get a security review and pricing call this week?",
      source: "contact_form",
    },
    questions: [
      {
        id: "inbound_type",
        type: "choice",
        instruction: "Choose the route for this inbound message.",
        criteria: {
          sales: "A potential customer evaluating a purchase",
          partnership: "A proposed business collaboration",
          support: "An existing customer seeking help",
          spam: "Unsolicited generic promotion",
          unclear: "Purpose is unclear",
        },
      },
      {
        id: "qualified",
        type: "noul",
        instruction:
          "Does the message contain concrete evidence of a sales opportunity worth human follow-up?",
      },
      {
        id: "priority",
        type: "score",
        instruction: "Score follow-up priority from 0 to 3.",
        criteria: [
          "0 — no sales follow-up",
          "1 — weak or early interest",
          "2 — concrete need or evaluation",
          "3 — concrete need plus near-term procurement action",
        ],
      },
    ],
    expectedOutput:
      "An inbound route, qualification probability, and ordered follow-up priority score.",
    typescriptExample: `import { choice, noul, score, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();

const result = await client.systemOne({
  state: {
    message:
      "We have 35 support agents and need SSO. Can we get a security review and pricing call this week?",
    source: "contact_form",
  },
  questions: {
    inbound_type: choice("Choose the route for this inbound message.", {
      sales: "A potential customer evaluating a purchase",
      partnership: "A proposed business collaboration",
      support: "An existing customer seeking help",
      spam: "Unsolicited generic promotion",
      unclear: "Purpose is unclear",
    }),
    qualified: noul(
      "Does the message contain concrete evidence of a sales opportunity worth human follow-up?"
    ),
    priority: score("Score follow-up priority.", [
      "No sales follow-up",
      "Weak or early interest",
      "Concrete need or evaluation",
      "Concrete need plus near-term procurement action",
    ]),
  },
});`,
    whyItWorks: [
      "The route distinguishes sales from other common contact-form traffic.",
      "Qualification is tied to evidence in the message rather than company-looking language alone.",
      "Priority is decomposed from qualification so teams can set different follow-up thresholds.",
    ],
    limits: [
      "Do not infer budget, authority, or company size unless the state supplies evidence.",
      "A high model score should not automatically enroll or contact a person without your normal consent rules.",
    ],
    sourceNotes: [
      {
        label: "Community Playground Sales & partnerships pack",
        url: `${COMMUNITY_PLAYGROUND}/blob/main/web/catalog.json`,
        kind: "community",
      },
      {
        label: "JevHub qualification and priority questions",
        url: "https://jevhub.xyz/templates/lead-qualification",
        kind: "original",
      },
    ],
  },
  {
    slug: "buying-intent",
    title: "Buying Intent",
    description:
      "Distinguish concrete purchasing behavior from casual interest, praise, or vague future intent.",
    category: "sales",
    difficulty: "basic",
    primitives: ["noul", "score"],
    useCases: ["Intent scoring", "Product-led sales", "Conversation triage"],
    stateExample: {
      message:
        "Can you send annual pricing for 20 seats and tell me whether SSO is included?",
      channel: "website_chat",
    },
    questions: [
      {
        id: "buying_intent",
        type: "noul",
        instruction:
          "Does the message show concrete intent to evaluate or purchase the product, rather than general interest?",
      },
      {
        id: "readiness",
        type: "score",
        instruction: "Score purchase readiness from 0 to 4.",
        criteria: [
          "0 — no purchasing signal",
          "1 — casual interest",
          "2 — active evaluation",
          "3 — asks about concrete purchase constraints",
          "4 — asks for a near-term commercial next step",
        ],
      },
    ],
    expectedOutput:
      "A buying-intent probability and an expected readiness score.",
    typescriptExample: `import { noul, score, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();

const result = await client.systemOne({
  state: {
    message:
      "Can you send annual pricing for 20 seats and tell me whether SSO is included?",
    channel: "website_chat",
  },
  questions: {
    buying_intent: noul(
      "Does the message show concrete intent to evaluate or purchase the product, rather than general interest?"
    ),
    readiness: score("Score purchase readiness.", [
      "No purchasing signal",
      "Casual interest",
      "Active evaluation",
      "Concrete purchase constraints",
      "Near-term commercial next step",
    ]),
  },
});`,
    whyItWorks: [
      "The question defines the contrast between concrete evaluation and vague interest.",
      "The score rubric gives downstream code a controllable threshold.",
    ],
    limits: [
      "Intent is not identity, budget, or authority.",
      "Use CRM facts as explicit state rather than asking the model to invent missing qualification data.",
    ],
    sourceNotes: [
      {
        label: "Community Playground definition of a sales route",
        url: `${COMMUNITY_PLAYGROUND}/blob/main/web/catalog.json`,
        kind: "community",
      },
      {
        label: "JevHub buying-intent rubric",
        url: "https://jevhub.xyz/templates/buying-intent",
        kind: "original",
      },
    ],
  },
  {
    slug: "spam-detection",
    title: "Spam Detection",
    description:
      "Screen contact-form messages for unsolicited generic promotion while keeping an explicit unclear route.",
    category: "safety",
    difficulty: "basic",
    primitives: ["choice", "noul"],
    useCases: ["Contact forms", "Inbox triage", "Community intake"],
    stateExample: {
      message:
        "We guarantee page-one rankings. Buy 10,000 backlinks today. Reply for our price list.",
      source: "contact_form",
    },
    questions: [
      {
        id: "message_type",
        type: "choice",
        instruction: "Choose the best route for this inbound message.",
        criteria: {
          sales: "A potential customer evaluating our product",
          partnership: "A concrete collaboration proposal",
          support: "An existing customer seeking help",
          spam: "Unsolicited generic promotion",
          unclear: "Purpose is unclear",
        },
      },
      {
        id: "unsolicited_promotion",
        type: "noul",
        instruction:
          "Is this message primarily unsolicited generic promotion rather than a relevant request?",
      },
    ],
    expectedOutput:
      "A route plus a spam probability that can be thresholded conservatively.",
    typescriptExample: `import { choice, noul, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();

const result = await client.systemOne({
  state: {
    message:
      "We guarantee page-one rankings. Buy 10,000 backlinks today. Reply for our price list.",
    source: "contact_form",
  },
  questions: {
    message_type: choice("Choose the best route for this inbound message.", {
      sales: "A potential customer evaluating our product",
      partnership: "A concrete collaboration proposal",
      support: "An existing customer seeking help",
      spam: "Unsolicited generic promotion",
      unclear: "Purpose is unclear",
    }),
    unsolicited_promotion: noul(
      "Is this message primarily unsolicited generic promotion rather than a relevant request?"
    ),
  },
});`,
    whyItWorks: [
      "An unclear route avoids forcing ambiguous messages into spam.",
      "A separate probability lets the application choose a conservative threshold.",
    ],
    limits: [
      "Do not automatically delete low-confidence messages.",
      "This is a semantic triage pattern, not a full anti-abuse system.",
    ],
    sourceNotes: [
      {
        label: "Community Playground sales spam/clarify categories",
        url: `${COMMUNITY_PLAYGROUND}/blob/main/web/catalog.json`,
        kind: "community",
      },
      {
        label: "Community Playground Social & community promotion category",
        url: `${COMMUNITY_PLAYGROUND}/blob/main/web/catalog.json`,
        kind: "community",
      },
    ],
  },
  {
    slug: "agent-router",
    title: "Agent Router",
    description:
      "Choose the next allowed agent or tool from a constrained graph without treating the model's choice as authorization.",
    category: "agents",
    difficulty: "intermediate",
    primitives: ["choice", "noul"],
    useCases: ["Multi-agent systems", "Tool routing", "Workflow branching"],
    stateExample: {
      request: "Check the current rate-limit settings before proposing a change.",
      current_node: "start",
      allowed_next: ["research_agent", "support_agent", "ops_agent"],
    },
    questions: [
      {
        id: "next_node",
        type: "choice",
        instruction: "Choose only among the allowed next nodes.",
        criteria: {
          research_agent: "Research external or background information",
          support_agent: "Handle user-support requests",
          ops_agent: "Inspect or propose operational configuration changes",
          clarify: "Not enough information to route safely",
        },
      },
      {
        id: "enough_information",
        type: "noul",
        instruction:
          "Is there enough information in the request and current graph state to choose a next node safely?",
      },
    ],
    expectedOutput:
      "A next-node choice constrained by the current graph and a probability that routing is sufficiently supported.",
    typescriptExample: `import { choice, noul, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();

const result = await client.systemOne({
  state: {
    request: "Check the current rate-limit settings before proposing a change.",
    current_node: "start",
    allowed_next: ["research_agent", "support_agent", "ops_agent"],
  },
  questions: {
    next_node: choice("Choose only among the allowed next nodes.", {
      research_agent: "Research background information",
      support_agent: "Handle user-support requests",
      ops_agent: "Inspect or propose operational configuration changes",
      clarify: "Not enough information to route safely",
    }),
    enough_information: noul(
      "Is there enough information to choose a next node safely?"
    ),
  },
});`,
    whyItWorks: [
      "The candidate set comes from the workflow graph, not from unconstrained model invention.",
      "The application remains responsible for permissions and execution.",
      "Clarification is a first-class outcome.",
    ],
    limits: [
      "A routed tool still needs deterministic authorization checks.",
      "Never allow model output to create a tool name that is not in the graph.",
    ],
    sourceNotes: [
      {
        label: "Community Playground Tool Router guide",
        url: `${COMMUNITY_PLAYGROUND}/blob/main/docs/tool-router.md`,
        kind: "community",
      },
    ],
  },
  {
    slug: "task-completion",
    title: "Task Completion",
    description:
      "Verify an agent's claim of completion against tool evidence and the observed final state.",
    category: "agents",
    difficulty: "intermediate",
    primitives: ["noul", "choice"],
    useCases: ["Agent QA", "Stop hooks", "Workflow verification"],
    stateExample: {
      requested_task: "Update the account plan to Pro.",
      assistant_claim: "Done — the account is now on Pro.",
      tool_events: [
        { tool: "update_plan", status: "error", detail: "permission denied" },
      ],
      final_observed_state: { plan: "Starter" },
    },
    questions: [
      {
        id: "task_complete",
        type: "noul",
        instruction:
          "Does tool evidence and the final observed state establish that the requested task was actually completed? The assistant's claim alone is not evidence.",
      },
      {
        id: "review_route",
        type: "choice",
        instruction: "Choose the next review route.",
        criteria: {
          close: "Evidence establishes completion",
          retry: "The task is incomplete but can be retried safely",
          debug: "Execution failed or evidence contradicts completion",
          human_review: "The evidence or authorization boundary needs a person",
        },
      },
    ],
    expectedOutput:
      "A completion probability grounded in evidence plus an operational review route.",
    typescriptExample: `import { choice, noul, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();

const result = await client.systemOne({
  state: {
    requested_task: "Update the account plan to Pro.",
    assistant_claim: "Done — the account is now on Pro.",
    tool_events: [
      { tool: "update_plan", status: "error", detail: "permission denied" },
    ],
    final_observed_state: { plan: "Starter" },
  },
  questions: {
    task_complete: noul(
      "Does tool evidence and the final state establish actual completion? The assistant's claim alone is not evidence."
    ),
    review_route: choice("Choose the next review route.", {
      close: "Evidence establishes completion",
      retry: "Incomplete but safe to retry",
      debug: "Execution failed or contradicts completion",
      human_review: "Needs human review",
    }),
  },
});`,
    whyItWorks: [
      "The state contains claims and independent evidence as separate fields.",
      "The completion question explicitly gives tool evidence higher authority than self-report.",
      "The review route gives the surrounding program a bounded next step.",
    ],
    limits: [
      "The verifier can only judge evidence you actually include.",
      "For high-impact actions, pair semantic verification with deterministic postconditions.",
    ],
    sourceNotes: [
      {
        label: "Community Playground agent_task_complete pattern",
        url: `${COMMUNITY_PLAYGROUND}/blob/main/web/catalog.json`,
        kind: "community",
      },
    ],
  },
  {
    slug: "content-moderation",
    title: "Content Moderation",
    description:
      "Classify community replies by their role and separately decide when a human moderator should review them.",
    category: "safety",
    difficulty: "basic",
    primitives: ["choice", "noul"],
    useCases: ["Community routing", "Comment triage", "Human-review queues"],
    stateExample: {
      reply:
        "This number is wrong — the release notes say 1.8%, not 18%. Here is the source.",
      context: "Reply to a technical product post",
    },
    questions: [
      {
        id: "reply_type",
        type: "choice",
        instruction: "Classify the primary role of this reply.",
        criteria: {
          question: "Genuine request for information",
          correction: "Relevant factual correction",
          joke: "Humor or playful sarcasm",
          promotion: "Unsolicited promotion or spam",
          hostility: "An attack meant to provoke",
          other: "None of the above",
        },
      },
      {
        id: "human_review",
        type: "noul",
        instruction:
          "Should a human moderator review this reply under the community's moderation workflow?",
      },
    ],
    expectedOutput:
      "A semantic reply category plus an independent probability that human review is warranted.",
    typescriptExample: `import { choice, noul, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();

const result = await client.systemOne({
  state: {
    reply:
      "This number is wrong — the release notes say 1.8%, not 18%. Here is the source.",
    context: "Reply to a technical product post",
  },
  questions: {
    reply_type: choice("Classify the primary role of this reply.", {
      question: "Genuine request for information",
      correction: "Relevant factual correction",
      joke: "Humor or playful sarcasm",
      promotion: "Unsolicited promotion or spam",
      hostility: "An attack meant to provoke",
      other: "None of the above",
    }),
    human_review: noul(
      "Should a human moderator review this reply under the community's moderation workflow?"
    ),
  },
});`,
    whyItWorks: [
      "Classification and review escalation are separate decisions.",
      "The category set distinguishes factual correction from hostility.",
    ],
    limits: [
      "Your actual moderation policy must define what gets removed, warned, or escalated.",
      "This demo is not a universal safety policy or legal compliance system.",
    ],
    sourceNotes: [
      {
        label: "Community Playground Social & community pack",
        url: `${COMMUNITY_PLAYGROUND}/blob/main/web/catalog.json`,
        kind: "community",
      },
      {
        label: "JevHub human-review question",
        url: "https://jevhub.xyz/templates/content-moderation",
        kind: "original",
      },
    ],
  },
];

export const templateBySlug = new Map(
  templates.map((template) => [template.slug, template]),
);

export const templateCategories = [
  { key: "support", label: "Support" },
  { key: "sales", label: "Sales" },
  { key: "agents", label: "Agents" },
  { key: "safety", label: "Safety & Community" },
] as const;
