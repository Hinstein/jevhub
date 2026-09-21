import Link from "next/link";
import { EcosystemCard } from "@/components/ecosystem-card";
import { JevDecisionExplainer } from "@/components/jev-decision-explainer";
import { TemplateCard } from "@/components/template-card";
import { ecosystem } from "@/content/ecosystem";
import { templates } from "@/content/templates";
import { JEV_PRICING } from "@/data/jev-pricing";

const featuredTemplates = [
  "refund-detection",
  "agent-router",
  "task-completion",
  "lead-qualification",
];

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 3 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

export default function HomePage() {
  const featured = templates.filter((template) =>
    featuredTemplates.includes(template.slug),
  );

  return (
    <>
      <section className="hero">
        <div className="shell">
          <div className="eyebrow">Independent Jev AI resource</div>
          <h1>Jev AI — TypeSafe&apos;s System One Model</h1>
          <p className="hero-copy">
            Jev is TypeSafe AI&apos;s System One model for structured decisions.
            Instead of generating free-form text, Jev returns typed Choice,
            Score, and Noul decisions with probabilities that software can
            consume directly. Try Jev online, learn the API, check current
            pricing, and explore practical examples.
          </p>
          <div className="actions">
            <Link className="button-primary" href="/playground">
              Try Jev Playground
            </Link>
            <Link className="button-secondary" href="/what-is-jev">
              What is Jev?
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <JevDecisionExplainer compact />
          <div className="actions">
            <Link className="button-primary" href="/playground">
              Try this in Jev Playground →
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">Start with your question</div>
            <h2>Jev AI guides, API, pricing, and examples.</h2>
            <p>
              Choose the page that matches what you need to understand or build
              next.
            </p>
          </div>
          <div className="grid grid-3">
            <Link className="card card-link" href="/what-is-jev">
              <div className="eyebrow">Learn</div>
              <h3>What is Jev AI?</h3>
              <p>
                Understand System One, typed decisions, probabilities, and the
                Choice, Score, and Noul primitives.
              </p>
            </Link>
            <Link className="card card-link" href="/playground">
              <div className="eyebrow">Try</div>
              <h3>Jev Playground</h3>
              <p>
                Run a structured decision online and inspect its result and
                probability distribution.
              </p>
            </Link>
            <Link className="card card-link" href="/getting-started">
              <div className="eyebrow">Build</div>
              <h3>Jev API Quickstart</h3>
              <p>
                Install the JavaScript SDK, keep your API key on the server,
                and send a first request.
              </p>
            </Link>
            <article className="card">
              <div className="eyebrow">Price</div>
              <h3>
                <Link className="card-title-link" href="/pricing">
                  Jev Pricing &amp; Calculator
                </Link>
              </h3>
              <p>
                Check the current input-token price, then estimate usage for
                your workload.
              </p>
              <Link
                className="button-secondary card-action"
                href="/tools/jev-cost-calculator"
              >
                Open Cost Calculator →
              </Link>
            </article>
            <Link className="card card-link" href="/templates">
              <div className="eyebrow">Examples</div>
              <h3>Jev Examples &amp; Templates</h3>
              <p>
                Copy practical Choice, Score, and Noul patterns for bounded
                decisions.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">Jev AI use cases</div>
            <h2>What can Jev AI do?</h2>
            <p>
              Jev is designed for decisions with a defined answer space, not
              for free-form text generation.
            </p>
          </div>
          <div className="grid grid-4">
            {[
              ["Classification", "Choose one label from a defined set."],
              [
                "Routing",
                "Send a request to the right queue, tool, or workflow branch.",
              ],
              ["Scoring", "Evaluate state against an ordered rubric."],
              [
                "Verification",
                "Estimate whether supplied evidence supports a yes/no condition.",
              ],
            ].map(([title, text]) => (
              <div className="card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">Jev examples</div>
            <h2>Start from a bounded task, not a blank prompt.</h2>
            <p>
              These examples show how to define questions and criteria before
              your application acts on a result.
            </p>
          </div>
          <div className="grid grid-2">
            {featured.map((template) => (
              <TemplateCard key={template.slug} template={template} />
            ))}
          </div>
          <div className="actions">
            <Link className="button-secondary" href="/templates">
              See all 8 Jev examples
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">Jev pricing</div>
            <h2>How much does Jev cost?</h2>
            <p>
              The current listed rate is kept in one shared pricing config and
              linked to the official TypeSafe source.
            </p>
          </div>
          <div className="grid grid-3">
            <div className="card">
              <div className="eyebrow">Input</div>
              <h3>
                {formatUsd(JEV_PRICING.pricePerMillionInputTokens)} per 1M
                tokens
              </h3>
              <p>Input tokens are the current billed usage unit.</p>
            </div>
            <div className="card">
              <div className="eyebrow">Output</div>
              <h3>
                {JEV_PRICING.pricePerMillionOutputTokens === 0
                  ? "Free to meter"
                  : formatUsd(JEV_PRICING.pricePerMillionOutputTokens)}
              </h3>
              <p>See the pricing page for the source and caveats.</p>
            </div>
            <div className="card">
              <div className="eyebrow">Last verified</div>
              <h3>{JEV_PRICING.lastVerifiedAt}</h3>
              <p>Pricing can change; verify before budgeting production use.</p>
            </div>
          </div>
          <p className="small home-source-note">
            <a href={JEV_PRICING.sourceUrl} target="_blank" rel="noreferrer">
              Official TypeSafe pricing source ↗
            </a>
          </p>
          <div className="actions">
            <Link className="button-primary" href="/pricing">
              See Jev Pricing
            </Link>
            <Link
              className="button-secondary"
              href="/tools/jev-cost-calculator"
            >
              Open Cost Calculator
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">Ecosystem</div>
            <h2>Explore Jev tools and integrations.</h2>
            <p>
              JevHub curates a small set of projects and checks each original
              repository before listing it.
            </p>
          </div>
          <div className="grid grid-3">
            {ecosystem.slice(0, 6).map((item) => (
              <EcosystemCard item={item} key={item.repoUrl} />
            ))}
          </div>
          <div className="actions">
            <Link className="button-secondary" href="/ecosystem">
              Browse the Jev Ecosystem
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">Jev AI FAQ</div>
            <h2>Questions developers ask before trying Jev.</h2>
          </div>
          <div className="faq-list">
            <div className="faq-item">
              <h3>What is Jev AI?</h3>
              <p>
                Jev is TypeSafe AI&apos;s first public System One model for
                structured decisions. It returns typed answers and probabilities
                that software can consume directly; read{" "}
                <Link href="/what-is-jev">what Jev is</Link> for the full
                explanation.
              </p>
            </div>
            <div className="faq-item">
              <h3>Is Jev an LLM?</h3>
              <p>
                Not in the conventional generative-LLM sense. TypeSafe
                describes Jev as a System One Model, a different model class
                designed for typed decisions rather than open-ended text
                generation. The{" "}
                <Link href="/jev-vs-chatgpt">Jev vs ChatGPT comparison</Link>{" "}
                explains when each shape is useful.
              </p>
            </div>
            <div className="faq-item">
              <h3>What is Jev used for?</h3>
              <p>
                Use it for bounded classification, routing, scoring, and
                verification where the allowed outcomes are known in advance.
                The <Link href="/templates">Jev examples</Link> show common
                patterns.
              </p>
            </div>
            <div className="faq-item">
              <h3>How much does Jev cost?</h3>
              <p>
                The listed input-token price and output pricing status are
                maintained on the <Link href="/pricing">Jev pricing page</Link>
                . Use the{" "}
                <Link href="/tools/jev-cost-calculator">cost calculator</Link>{" "}
                for an estimate based on your traffic.
              </p>
            </div>
            <div className="faq-item">
              <h3>How do I use the Jev API?</h3>
              <p>
                Install the official JavaScript SDK, keep your TypeSafe API key
                on the server, and send a first typed request with the{" "}
                <Link href="/getting-started">Jev API quickstart</Link>.
              </p>
            </div>
            <div className="faq-item">
              <h3>Can I try Jev online?</h3>
              <p>
                Yes. Open the <Link href="/playground">Jev Playground</Link> to
                run an example in the browser, then use the API guide when you
                are ready to connect your own server.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
