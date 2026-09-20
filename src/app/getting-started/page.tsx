import Link from "next/link";
import { ArticleShell } from "@/components/article-shell";
import { CodeBlock } from "@/components/code-block";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Getting Started with Jev",
  "Install the official TypeSafe JavaScript SDK, send your first System One request, and understand state, Choice, Score, and Noul.",
  "/getting-started",
);

const install = `npm install @typesafe-ai/sdk`;

const quickstart = `import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();

const response = await client.systemOne({
  state: {
    document: "I was charged twice. Please fix this ASAP.",
  },
  questions: {
    category: choice("What is this ticket about?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);`;

const multi = `import { choice, noul, score, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();

const response = await client.systemOne({
  state: {
    message: "Our checkout failed twice and launch is tomorrow.",
  },
  questions: {
    route: choice("Which queue should own this?", {
      billing: "Payment and charge issues",
      technical: "Product or integration failures",
      other: "Everything else",
    }),
    urgent: noul("Is this time-sensitive?"),
    severity: score("How severe is the impact?", [
      "Low",
      "Moderate",
      "High",
      "Critical",
    ]),
  },
});`;

export default function GettingStartedPage() {
  return (
    <ArticleShell
      title="Getting started with Jev"
      description="The shortest path is: install the official SDK, set a TypeSafe API key, send state plus typed questions, then use the returned decision in your own code."
    >
      <h2>1. Prerequisites</h2>
      <p>
        The current official JavaScript SDK requires Node.js 20 or newer and a
        TypeSafe API key.
      </p>

      <h2>2. Install the official SDK</h2>
      <CodeBlock code={install} />
      <p>
        Set <code>TYPESAFE_API_KEY</code> in your server environment. Keep the
        key on the server. The official client refuses browser use by default
        because shipping the key to a web page would expose it.
      </p>

      <h2>3. Send a first decision</h2>
      <CodeBlock code={quickstart} />
      <p>
        This follows the shape of the official JavaScript SDK quickstart: a
        short support message becomes a bounded ticket-category decision.
      </p>

      <h2>4. Understand state</h2>
      <p>
        <code>state</code> is the information the model should judge. It can be
        text or JSON-compatible structured data. Prefer explicit fields when
        your application already knows facts such as payment status, user role,
        tool events, or allowed routes.
      </p>

      <h2>5. Understand questions</h2>
      <p>
        Each named question becomes a typed answer. Choice selects among named
        alternatives. Noul returns the probability of yes. Score uses an
        ordered list of rubric descriptions and returns an expected score plus
        probabilities.
      </p>
      <CodeBlock code={multi} />

      <h2>Common mistakes</h2>
      <ul>
        <li>
          Asking Jev to generate prose when the task does not have a bounded
          decision shape.
        </li>
        <li>Using vague Choice labels without criteria that separate them.</li>
        <li>
          Treating a model&apos;s route or recommendation as authorization to
          execute a high-impact action.
        </li>
        <li>
          Calling from the browser with a secret API key instead of a server
          environment.
        </li>
      </ul>

      <h2>Primary source</h2>
      <p>
        This page was checked against the official JavaScript SDK v0.6.0 source
        and README on 2026-09-21.
      </p>
      <p>
        <a
          href="https://github.com/typesafe-ai/typesafe-sdk-js"
          target="_blank"
          rel="noreferrer"
        >
          Official TypeSafe JavaScript SDK ↗
        </a>
      </p>

      <h2>Next</h2>
      <p>
        Try a concrete pattern in <Link href="/templates">Templates</Link>,
        calculate projected usage in the{" "}
        <Link href="/tools/jev-cost-calculator">Cost Calculator</Link>, or review
        the conceptual boundary in{" "}
        <Link href="/jev-vs-chatgpt">Jev vs ChatGPT</Link>.
      </p>
    </ArticleShell>
  );
}
