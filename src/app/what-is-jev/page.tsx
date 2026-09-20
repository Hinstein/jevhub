import Link from "next/link";
import { ArticleShell } from "@/components/article-shell";
import { CodeBlock } from "@/components/code-block";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "What is Jev?",
  "A practical explanation of Jev, TypeSafe AI's System One decision model, including Choice, Score, Noul, and where it fits next to generative LLMs.",
  "/what-is-jev",
);

const example = `import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const result = await client.systemOne({
  state: { message: "I was charged twice. Please fix this ASAP." },
  questions: {
    category: choice("What is this ticket about?", {
      billing: null, technical: null, other: null,
    }),
  },
});`;

export default function WhatIsJevPage() {
  return (
    <ArticleShell
      title="What is Jev?"
      description="Jev is TypeSafe AI's first public System One model: it takes state plus typed questions and returns bounded decisions with probabilities instead of free-form prose."
    >
      <div className="callout">
        Jev is best thought of as a semantic decision primitive for software,
        not as another chat assistant.
      </div>

      <h2>Jev in one minute</h2>
      <p>
        A normal generative LLM can produce almost any string. Jev gives up that
        open-ended output space. Your application defines the shape of the
        decision in advance, and Jev fills that shape with a typed answer and
        uncertainty information.
      </p>
      <CodeBlock code={example} />

      <h2>The three question primitives</h2>
      <h3>Choice</h3>
      <p>
        Choice selects one label from a named set. Use it for categories,
        routes, tool selection, or any other mutually exclusive branch.
      </p>
      <h3>Score</h3>
      <p>
        Score evaluates state against an ordered rubric. The official
        JavaScript SDK represents the rubric as a list with at least two score
        levels, indexed from zero.
      </p>
      <h3>Noul</h3>
      <p>
        Noul is a yes/no question. The returned <code>noul</code> value is the
        probability of the yes outcome. It is useful for checks such as “does
        the evidence establish completion?” or “is this message a qualified
        lead?”
      </p>

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
        Continue with the <Link href="/getting-started">getting-started guide</Link>,
        estimate usage in the <Link href="/tools/jev-cost-calculator">cost calculator</Link>,
        or browse <Link href="/templates">practical templates</Link>.
      </p>
    </ArticleShell>
  );
}
