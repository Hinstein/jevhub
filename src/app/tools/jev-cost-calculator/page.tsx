import Link from "next/link";
import { ArticleShell } from "@/components/article-shell";
import { JevCostCalculator } from "@/components/calculator/jev-cost-calculator";
import { JEV_PRICING } from "@/data/jev-pricing";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Jev Cost Calculator",
  "Estimate Jev cost from average input tokens and request volume using the currently listed TypeSafe input-token price.",
  "/tools/jev-cost-calculator",
);

export default function CostCalculatorPage() {
  return (
    <ArticleShell
      eyebrow="Free tool"
      title="Jev cost calculator"
      description="Estimate per-request, daily, monthly, and annual Jev input-token cost. All calculator inputs stay in your browser."
    >
      <JevCostCalculator />

      <h2>How the estimate works</h2>
      <p>
        The calculator multiplies average input tokens by request volume, then
        applies the current input-token price of $
        {JEV_PRICING.pricePerMillionInputTokens} per million tokens. Daily mode
        uses 365.25 / 12 days per average month.
      </p>

      <h2>What this does not estimate</h2>
      <ul>
        <li>Your own database, logging, queue, or hosting costs.</li>
        <li>Any separate generative-model calls around Jev.</li>
        <li>Future pricing changes after the last verification date.</li>
      </ul>

      <p>
        Read the <Link href="/pricing">pricing notes</Link>, see{" "}
        <Link href="/getting-started">how to make a first request</Link>, or
        browse <Link href="/templates">Jev templates</Link>.
      </p>

      <p className="small">
        Official price source:{" "}
        <a href={JEV_PRICING.sourceUrl} target="_blank" rel="noreferrer">
          TypeSafe ↗
        </a>
        . Last verified {JEV_PRICING.lastVerifiedAt}.
      </p>
    </ArticleShell>
  );
}
