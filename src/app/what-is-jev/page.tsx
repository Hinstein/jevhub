import Link from "next/link";
import { ArticleShell } from "@/components/article-shell";
import { CodeBlock } from "@/components/code-block";
import { JevDecisionExplainer } from "@/components/jev-decision-explainer";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "What Is Jev? TypeSafe AI's System One Explained",
  "Learn what Jev is, how TypeSafe AI's System One model returns typed probabilistic decisions, and when to use Choice, Score, and Noul.",
  "/what-is-jev",
);

const example = [
  'import { choice, TypeSafeClient } from "@typesafe-ai/sdk";',
  "",
  "const client = new TypeSafeClient();",
  "const result = await client.systemOne({",
  '  state: { message: "I was charged twice. Please fix this ASAP." },',
  "  questions: {",
  '    category: choice("What is this ticket about?", {',
  "      billing: null, technical: null, other: null,",
  "    }),",
  "  },",
  "});",
].join("\n");

export default function WhatIsJevPage() {
  return (
    <ArticleShell
      path="/what-is-jev"
      title="What is Jev?"
      description="Jev is TypeSafe AI's first public System One model: it takes state plus typed questions and returns bounded decisions with probabilities instead of free-form prose."
    >
      <div className="callout">
        Jev is best thought of as a semantic decision primitive for software,
        not as another chat assistant.
      </div>

      <JevDecisionExplainer />

      <h2>Try the idea before reading more</h2>
      <p>
        The <Link href="/playground">Jev Playground</Link> lets you edit the
        state, switch between Choice, Noul, and Score, and inspect the returned
        probability distribution without putting a TypeSafe API key in your
        browser.
      </p>
      <div className="actions">
        <Link className="button-primary" href="/playground">
          Open Jev Playground
        </Link>
        <Link className="button-secondary" href="/getting-started">
          Read the SDK quickstart
        </Link>
      </div>

      <h2>The same shape in TypeScript</h2>
      <p>
        The official JavaScript SDK expresses the same state + typed-question
        structure in code.
      </p>
      <CodeBlock code={example} />

      <h2>Where Jev fits well</h2>
      <ul>
        <li>Classifying support, sales, moderation, or document state.</li>
        <li>Routing a request across a bounded workflow graph.</li>
        <li>Scoring against an explicit severity or priority rubric.</li>
        <li>Filtering large volumes before sending a smaller set to an LLM.</li>
        <li>Verifying claims or agent actions against supplied evidence.</li>
      </ul>

      <h2>Where Jev is not the right tool</h2>
      <ul>
        <li>Writing an email, article, program, or free-form explanation.</li>
        <li>Creative generation with an open output space.</li>
        <li>Tasks where the valid answers cannot be defined or decomposed.</li>
        <li>
          Final authorization for high-impact actions without deterministic
          policy checks around the model.
        </li>
      </ul>

      <h2>Jev and LLMs can be used together</h2>
      <p>
        A common architecture is to let Jev classify, route, or filter first,
        then call a generative model only when you actually need generated
        language. That keeps the decision layer bounded while preserving the
        flexibility of GPT, Claude, or another LLM where it matters.
      </p>

      <h2>Primary sources</h2>
      <p>
        TypeSafe&apos;s launch post describes Jev as “structured state in,
        typed probabilistic decisions out.” The official JavaScript SDK exposes
        <code>choice</code>, <code>score</code>, <code>noul</code>, and
        <code>systemOne</code>.
      </p>
      <ul>
        <li>
          <a
            href="https://typesafe.ai/blog/introducing-system-one-models-and-jev"
            target="_blank"
            rel="noreferrer"
          >
            TypeSafe: Introducing System One Models &amp; Jev ↗
          </a>
        </li>
        <li>
          <a
            href="https://github.com/typesafe-ai/typesafe-sdk-js"
            target="_blank"
            rel="noreferrer"
          >
            Official TypeSafe JavaScript SDK ↗
          </a>
        </li>
      </ul>

      <h2>Next</h2>
      <p>
        Run a decision in the <Link href="/playground">Playground</Link>,
        estimate usage in the{" "}
        <Link href="/tools/jev-cost-calculator">cost calculator</Link>, or
        browse <Link href="/templates">practical templates</Link>.
      </p>
    </ArticleShell>
  );
}
