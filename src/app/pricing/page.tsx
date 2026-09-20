import Link from "next/link";
import { ArticleShell } from "@/components/article-shell";
import { StoreLink } from "@/components/store-link";
import { JEV_PRICING } from "@/data/jev-pricing";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Jev Pricing",
  "Current Jev input and output pricing, simple cost examples, the official source, and a live Jev cost calculator.",
  "/pricing",
);

const examples = [
  { label: "1M input tokens", tokens: 1_000_000 },
  { label: "100M input tokens", tokens: 100_000_000 },
  { label: "1B input tokens", tokens: 1_000_000_000 },
];

function usd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 3 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

export default function PricingPage() {
  return (
    <ArticleShell
      title="Jev pricing"
      description={`As last verified on ${JEV_PRICING.lastVerifiedAt}, TypeSafe lists Jev input at $${JEV_PRICING.pricePerMillionInputTokens} per million tokens. Output is listed as free to meter.`}
    >
      <div className="callout">
        Pricing changes. JevHub keeps one pricing config for the entire site and
        links back to the official TypeSafe source below.
      </div>

      <h2>Current listed price</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Usage</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Input</td>
              <td>
                {usd(JEV_PRICING.pricePerMillionInputTokens)} per 1M tokens
              </td>
            </tr>
            <tr>
              <td>Output</td>
              <td>
                {JEV_PRICING.pricePerMillionOutputTokens === 0
                  ? "Free to meter"
                  : usd(JEV_PRICING.pricePerMillionOutputTokens)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Three simple examples</h2>
      <div className="grid grid-3">
        {examples.map((example) => {
          const cost =
            (example.tokens / 1_000_000) *
            JEV_PRICING.pricePerMillionInputTokens;
          return (
            <div className="card" key={example.label}>
              <div className="eyebrow">{example.label}</div>
              <h3>{usd(cost)}</h3>
              <p>Input-token cost at the currently listed rate.</p>
            </div>
          );
        })}
      </div>

      <h2>Request count is not enough by itself</h2>
      <p>
        Jev is priced by input tokens, so one million short decisions can cost
        much less than one million decisions that each carry a large state.
        Estimate both average input size and request volume.
      </p>

      <div className="actions">
        <Link className="button-primary" href="/tools/jev-cost-calculator">
          Open Jev cost calculator
        </Link>
        <Link className="button-secondary" href="/getting-started">
          Read the quickstart
        </Link>
      </div>

      <h2>Official source</h2>
      <p>
        Last verified: <strong>{JEV_PRICING.lastVerifiedAt}</strong>.
      </p>
      <p>
        <a href={JEV_PRICING.sourceUrl} target="_blank" rel="noreferrer">
          TypeSafe launch post and pricing ↗
        </a>
      </p>

      <h2>About the JevHub Store</h2>
      <p>
        JevHub keeps commerce separate from this information site. If you visit
        the independent Store, you leave this project. JevHub does not treat the
        Store as an official TypeSafe property.
      </p>
      <div className="actions">
        <StoreLink />
      </div>
      <p>
        You can also review <Link href="/what-is-jev">what Jev is</Link> or
        compare its role with a generative model in{" "}
        <Link href="/jev-vs-chatgpt">Jev vs ChatGPT</Link>.
      </p>
    </ArticleShell>
  );
}
