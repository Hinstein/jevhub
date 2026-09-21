import Link from "next/link";
import { JevPlayground } from "@/components/playground/jev-playground";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Jev Playground: Try Typed AI Decisions",
  "Run bounded Jev Choice, Noul, and Score decisions from a browser UI without exposing a TypeSafe API key in the client.",
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
            Try real Jev decision shapes from a browser UI. Edit the state,
            choose Choice, Noul, or Score, then inspect the typed result and
            probability distribution.
          </p>
          <div className="playground-hero-meta">
            <span>✓ Server-side TypeSafe credential</span>
            <span>✓ Bounded inputs</span>
            <span>✓ No signup on JevHub</span>
          </div>
        </div>
      </section>

      <JevPlayground />

      <section className="playground-notes">
        <div className="shell grid grid-2">
          <div className="card">
            <div className="eyebrow">How it works</div>
            <h2>Your browser never receives the TypeSafe API key.</h2>
            <p>
              JevHub validates a small decision payload, applies a best-effort
              request limit, and sends the bounded request from the server to
              TypeSafe.
            </p>
          </div>
          <div className="card">
            <div className="eyebrow">Learn the model</div>
            <h2>
              Understand the primitives before wiring them into production.
            </h2>
            <p>
              Read <Link href="/what-is-jev">What is Jev?</Link> for the
              state/question/decision model, then use the{" "}
              <Link href="/templates">template library</Link> for practical
              patterns.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
