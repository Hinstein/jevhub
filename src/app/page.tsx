import Link from "next/link";
import { EcosystemCard } from "@/components/ecosystem-card";
import { JevDecisionExplainer } from "@/components/jev-decision-explainer";
import { StoreLink } from "@/components/store-link";
import { TemplateCard } from "@/components/template-card";
import { ecosystem } from "@/content/ecosystem";
import { templates } from "@/content/templates";

const featuredTemplates = [
  "refund-detection",
  "agent-router",
  "task-completion",
  "lead-qualification",
];

export default function HomePage() {
  const featured = templates.filter((template) =>
    featuredTemplates.includes(template.slug),
  );

  return (
    <>
      <section className="hero">
        <div className="shell">
          <div className="eyebrow">Independent Jev AI hub</div>
          <h1>Learn Jev, try real apps, and build with it.</h1>
          <p className="hero-copy">
            Explore TypeSafe AI&apos;s Jev System One model through a real
            applications, an interactive Playground, practical examples, pricing,
            and API guides for structured decisions.
          </p>
          <div className="actions">
            <Link
              className="button-primary"
              href="/apps/startup-idea-validator"
            >
              Try Idea Validator
            </Link>
            <Link className="button-secondary" href="/playground">
              Open Jev Playground
            </Link>
          </div>
        </div>
      </section>

      <section className="section home-app-section">
        <div className="shell">
          <div className="home-app-card">
            <div>
              <div className="eyebrow">Try a real Jev app</div>
              <h2>Should you build it?</h2>
              <p>
                Describe a startup or product idea. Jev scores eight bounded
                dimensions in one request, then JevHub calculates a transparent
                KILL, FIX, or SHIP result.
              </p>
              <div className="idea-preview-grid home-idea-preview" aria-hidden="true">
                {[
                  "Problem",
                  "Customer",
                  "Demand",
                  "Value",
                  "Reach",
                  "Different",
                  "Buildable",
                  "Shareable",
                ].map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="actions">
                <Link
                  className="button-primary"
                  href="/apps/startup-idea-validator"
                >
                  Score my idea →
                </Link>
              </div>
            </div>
            <div className="home-app-score" aria-hidden="true">
              <span>Example</span>
              <strong>72</strong>
              <b>SHIP</b>
              <small>8 structured scores · 1 Jev request</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section home-app-section">
        <div className="shell">
          <div className="home-app-card home-inbox-card">
            <div>
              <div className="eyebrow">Second real Jev app</div>
              <h2>What needs your attention?</h2>
              <p>Sort six synthetic emails into Needs reply, Review, and Read later in one Jev request. Then try one message of your own without connecting an inbox.</p>
              <div className="actions"><Link className="button-primary" href="/apps/inbox-triage">Try Inbox Triage →</Link></div>
            </div>
            <div className="home-inbox-preview" aria-hidden="true"><span>INBOX / 06</span><strong>↗ <small>reply</small></strong><strong>◇ <small>review</small></strong><strong>↓ <small>later</small></strong></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">What Jev is good at</div>
            <h2>Use Jev when the answer space is defined.</h2>
            <p>
              Jev returns typed decisions and probabilities for bounded tasks.
              It is not a replacement for open-ended text generation.
            </p>
          </div>
          <div className="grid grid-4">
            {[
              ["Classification", "Choose one label from a defined set."],
              ["Routing", "Choose the next queue, tool, or workflow branch."],
              ["Scoring", "Evaluate input against an ordered rubric."],
              ["Verification", "Estimate whether supplied evidence supports a yes/no condition."],
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
            <div className="eyebrow">Developer Playground</div>
            <h2>See the raw Jev decisions behind the apps.</h2>
            <p>
              Edit state, Choice, Score, and Noul questions yourself, then
              inspect typed results and probability distributions.
            </p>
          </div>
          <JevDecisionExplainer compact />
          <div className="actions">
            <Link className="button-primary" href="/playground">
              Open Jev Playground →
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">Learn Jev</div>
            <h2>Understand the model, API, and cost.</h2>
            <p>
              Start with the concept, then move to the server-side API and
              current TypeSafe pricing.
            </p>
          </div>
          <div className="grid grid-3">
            <Link className="card card-link" href="/what-is-jev">
              <div className="eyebrow">Learn</div>
              <h3>What is Jev AI?</h3>
              <p>
                Understand System One, typed decisions, probabilities, Choice,
                Score, and Noul.
              </p>
            </Link>
            <Link className="card card-link" href="/getting-started">
              <div className="eyebrow">API</div>
              <h3>Jev API Quickstart</h3>
              <p>
                Keep your TypeSafe API key on the server and send your first
                structured request.
              </p>
            </Link>
            <article className="card">
              <div className="eyebrow">Pricing</div>
              <h3>
                <Link className="card-title-link" href="/pricing">
                  Jev Pricing
                </Link>
              </h3>
              <p>
                Check the current official rate and estimate your own workload
                with the free calculator.
              </p>
              <Link
                className="button-secondary card-action"
                href="/tools/jev-cost-calculator"
              >
                Open Cost Calculator →
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">Build with Jev</div>
            <h2>Start from a bounded pattern, not a blank prompt.</h2>
            <p>
              Copy practical Jev examples for support, sales, agents, and
              moderation, then adapt the criteria to your application.
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
            <div className="eyebrow">Explore</div>
            <h2>See what people are building with Jev.</h2>
            <p>
              JevHub checks a small set of SDKs, playgrounds, integrations,
              agent tools, and open-source projects at their original sources.
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
          <div className="card home-store-card">
            <div className="eyebrow">JevHub Store</div>
            <h2>Need a separate purchase path?</h2>
            <p>
              The Store remains a separate site. JevHub stays focused on apps,
              learning, examples, and the ecosystem.
            </p>
            <div className="actions">
              <StoreLink />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">Jev AI FAQ</div>
            <h2>Start with the question you actually have.</h2>
          </div>
          <div className="faq-list">
            <div className="faq-item">
              <h3>What is Jev AI?</h3>
              <p>
                Jev is TypeSafe AI&apos;s System One model for typed, probabilistic
                decisions. Read <Link href="/what-is-jev">What is Jev?</Link>.
              </p>
            </div>
            <div className="faq-item">
              <h3>Can I try Jev without writing code?</h3>
              <p>
                Yes. Try the{" "}
                <Link href="/apps/startup-idea-validator">
                  Startup Idea Validator
                </Link>{" "}
                 to score an idea, <Link href="/apps/inbox-triage">Inbox Triage</Link>{" "}
                 to sort sample emails, or the <Link href="/playground">Playground</Link>{" "}
                 to inspect raw decisions.
              </p>
            </div>
            <div className="faq-item">
              <h3>How do I use the Jev API?</h3>
              <p>
                Follow the <Link href="/getting-started">Jev API quickstart</Link>{" "}
                and keep the TypeSafe API key on your server.
              </p>
            </div>
            <div className="faq-item">
              <h3>How much does Jev cost?</h3>
              <p>
                Check the <Link href="/pricing">Jev pricing page</Link> and use
                the <Link href="/tools/jev-cost-calculator">cost calculator</Link>{" "}
                for your own traffic assumptions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
