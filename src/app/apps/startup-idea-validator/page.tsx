import Link from "next/link";
import { IdeaValidator } from "@/components/idea-validator/idea-validator";
import {
  BreadcrumbStructuredData,
  JsonLd,
} from "@/components/structured-data";
import { pageMetadata } from "@/lib/metadata";
import { SITE } from "@/lib/site";

const path = "/apps/startup-idea-validator";

export const metadata = pageMetadata(
  "Startup Idea Validator: Score Your Idea with Jev AI",
  "Describe your startup or product idea, choose your goal, and get an instant 8-factor score powered by Jev. No signup required.",
  path,
);

const applicationStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "JevHub Startup Idea Validator",
  url: new URL(path, SITE.url).toString(),
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  isAccessibleForFree: true,
  description:
    "A free startup and product idea scoring tool that uses eight structured Jev decisions.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function StartupIdeaValidatorPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Startup Idea Validator", path },
        ]}
      />
      <JsonLd data={applicationStructuredData} />

      <section className="idea-hero">
        <div className="shell">
          <div className="eyebrow">Free Jev app · No signup</div>
          <h1>Startup Idea Validator</h1>
          <p className="hero-copy">
            Describe a startup, SaaS, developer tool, or product idea. Choose
            what you want from it, then let Jev score eight practical dimensions
            in one structured decision request.
          </p>
          <div className="idea-hero-meta">
            <span>8 structured scores</span>
            <span>1 Jev request</span>
            <span>No saved idea history</span>
          </div>
        </div>
      </section>

      <div className="shell">
        <IdeaValidator />
      </div>

      <section className="section">
        <div className="shell idea-content">
          <div className="section-heading">
            <div className="eyebrow">How the score works</div>
            <h2>Eight questions, then normal application logic.</h2>
            <p>
              Jev does not write the final verdict. It scores a fixed set of
              dimensions from 0 to 4. JevHub converts those scores to 0–100,
              applies the weights, and computes the final result.
            </p>
          </div>

          <div className="grid grid-4">
            {[
              ["Real problem", "Is there a concrete problem or immediate appeal?"],
              ["Clear customer", "Is the intended user specific enough?"],
              ["Demand", "Does the description show existing effort or attention?"],
              ["Value", "Money, adoption, or fun depending on your goal."],
              ["Reach", "Can a small team realistically find the audience?"],
              ["Different", "Is the approach meaningfully distinct?"],
              ["Buildable", "Can one or two developers ship a useful first version?"],
              ["Shareable", "Can users easily explain or recommend the value?"],
            ].map(([title, body]) => (
              <div className="card" key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-3 idea-verdict-guide">
            <div className="card">
              <div className="eyebrow">0–49</div>
              <h3>KILL</h3>
              <p>Too many important signals are weak in the current description.</p>
            </div>
            <div className="card">
              <div className="eyebrow">50–64</div>
              <h3>FIX</h3>
              <p>The shape is plausible, but the weakest dimensions need work.</p>
            </div>
            <div className="card">
              <div className="eyebrow">65–100</div>
              <h3>SHIP</h3>
              <p>The description is strong enough to justify a small build or validation test.</p>
            </div>
          </div>

          <div className="callout idea-limit">
            <strong>This is an idea evaluation, not market research.</strong>
            <br />
            The tool judges the idea as you describe it. It does not independently
            verify demand, competitors, regulation, pricing, customer interviews,
            or willingness to pay.
          </div>

          <h2>Why use Jev for this?</h2>
          <p>
            This is a bounded scoring problem: the dimensions and score levels
            are known before the request runs. That makes it a natural example
            of Jev&apos;s structured decision model. If you want to inspect raw
            Choice, Score, and Noul outputs yourself, open the{" "}
            <Link href="/playground">Jev Playground</Link>.
          </p>

          <h2>Build the same pattern</h2>
          <p>
            The product layer stays separate from the decision layer: define
            fixed questions, let Jev return typed scores and probabilities, then
            keep thresholds and business rules in ordinary code. Browse the{" "}
            <Link href="/templates">Jev examples and templates</Link> or read the{" "}
            <Link href="/getting-started">Jev API quickstart</Link> to build your
            own version.
          </p>
        </div>
      </section>
    </>
  );
}
