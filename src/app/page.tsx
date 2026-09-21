import Link from "next/link";
import { TemplateCard } from "@/components/template-card";
import { EcosystemCard } from "@/components/ecosystem-card";
import { StoreLink } from "@/components/store-link";
import { templates } from "@/content/templates";
import { ecosystem } from "@/content/ecosystem";

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
          <div className="eyebrow">Independent Jev resource</div>
          <h1>Learn, build, and explore Jev.</h1>
          <p className="hero-copy">
            Practical guides, a cost calculator, reusable decision templates,
            and a curated directory for TypeSafe AI&apos;s Jev decision model.
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
          <div className="section-heading">
            <div className="eyebrow">Four paths</div>
            <h2>Use JevHub for the part you need.</h2>
            <p>
              Start with the concept, estimate cost, copy a bounded decision
              pattern, or inspect the surrounding ecosystem.
            </p>
          </div>
          <div className="grid grid-4">
            <Link className="card card-link" href="/what-is-jev">
              <div className="eyebrow">Learn</div>
              <h3>What is Jev?</h3>
              <p>Understand typed decisions, probabilities, and where Jev fits.</p>
            </Link>
            <Link
              className="card card-link"
              href="/tools/jev-cost-calculator"
            >
              <div className="eyebrow">Calculate</div>
              <h3>Estimate usage cost</h3>
              <p>Turn token volume and request volume into monthly cost.</p>
            </Link>
            <Link className="card card-link" href="/templates">
              <div className="eyebrow">Build</div>
              <h3>Copy decision templates</h3>
              <p>Start from closed Choice, Score, and Noul patterns.</p>
            </Link>
            <Link className="card card-link" href="/ecosystem">
              <div className="eyebrow">Explore</div>
              <h3>Browse the ecosystem</h3>
              <p>Find SDKs, integrations, agent tools, and community projects.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">What Jev is good at</div>
            <h2>Decisions that software can consume directly.</h2>
            <p>
              Jev is shaped for bounded decisions: classify, route, score, or
              estimate a yes/no probability. It is not a free-form text
              generator.
            </p>
          </div>
          <div className="grid grid-4">
            {[
              ["Classify", "Choose one label from a defined set."],
              ["Route", "Pick the next allowed path in a workflow."],
              ["Score", "Map state onto an ordered rubric."],
              ["Check", "Estimate whether a yes/no condition is supported."],
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
            <div className="eyebrow">Featured templates</div>
            <h2>Start from a bounded task, not a blank prompt.</h2>
          </div>
          <div className="grid grid-2">
            {featured.map((template) => (
              <TemplateCard key={template.slug} template={template} />
            ))}
          </div>
          <div className="actions">
            <Link className="button-secondary" href="/templates">
              See all 8 templates
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">Ecosystem preview</div>
            <h2>Jev is already showing up in real developer tooling.</h2>
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
              Explore the directory
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="card">
            <div className="eyebrow">Separate store</div>
            <h2>JevHub&apos;s content site and store stay independent.</h2>
            <p>
              The Store is an external JevHub property. Learning, templates,
              and ecosystem content remain available here whether or not the
              Store changes.
            </p>
            <div className="actions">
              <StoreLink />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
