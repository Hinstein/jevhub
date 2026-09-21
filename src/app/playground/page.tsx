import Link from "next/link";
import { JevPlayground } from "@/components/playground/jev-playground";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Jev Playground: Try Typed AI Decisions",
  "Try Jev Choice, Noul, and Score decisions in a browser UI and inspect the returned decision, confidence, and probability distribution.",
  "/playground",
);

export default function PlaygroundPage() {
  return (
    <>
      <section className="playground-hero">
        <div className="shell">
          <div className="eyebrow">
            Structured decisions, visible probabilities
          </div>
          <h1>Jev Playground</h1>
          <p className="hero-copy">
            Try Jev directly in the browser. Add some context, choose Choice,
            Noul, or Score, then inspect the result and probability
            distribution.
          </p>
          <div className="playground-hero-meta">
            <span>✓ Ready-to-run examples</span>
            <span>✓ Single or multiple questions</span>
            <span>✓ Visible probability distributions</span>
          </div>
        </div>
      </section>

      <JevPlayground />

      <section className="playground-notes">
        <div className="shell grid grid-2">
          <div className="card">
            <div className="eyebrow">How to use it</div>
            <h2>Describe the situation, choose a decision type, then run Jev.</h2>
            <p>
              Start from a ready-made example or write your own state. JevHub
              shows the returned decision together with confidence and the full
              probability distribution.
            </p>
          </div>
          <div className="card">
            <div className="eyebrow">Continue learning</div>
            <h2>See how Jev makes decisions, then pick a practical pattern.</h2>
            <p>
              Read <Link href="/what-is-jev">What is Jev?</Link> to understand
              Choice, Noul, and Score, then use the{" "}
              <Link href="/templates">template library</Link> for real use
              cases.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
