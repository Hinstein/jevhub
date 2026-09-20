import Link from "next/link";
import { ArticleShell } from "@/components/article-shell";
import { EcosystemCard } from "@/components/ecosystem-card";
import { ecosystem, ecosystemCategories } from "@/content/ecosystem";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Jev Ecosystem: SDKs, Integrations, and Tools",
  "Browse a curated Jev ecosystem directory of official SDKs, community clients, integrations, agent tools, playgrounds, and research.",
  "/ecosystem",
);

export default function EcosystemPage() {
  return (
    <ArticleShell
      path="/ecosystem"
      eyebrow="Curated directory"
      title="Jev ecosystem"
      description="A deliberately small directory of projects checked at their original repositories. JevHub does not rank these projects or treat inclusion as an endorsement."
    >
      <div className="callout">
        Discovery starts with public sources such as Awesome Jev, but every item
        below is checked at its original repository before inclusion.
      </div>

      {ecosystemCategories.map((category) => {
        const items = ecosystem.filter((item) => item.category === category);
        return (
          <section className="ecosystem-section" key={category}>
            <h2>{category}</h2>
            <div className="ecosystem-grid">
              {items.map((item) => (
                <EcosystemCard item={item} key={item.repoUrl} />
              ))}
            </div>
          </section>
        );
      })}

      <h2>How this directory is maintained</h2>
      <ul>
        <li>Items must have a public, directly verifiable project URL.</li>
        <li>Descriptions are written by JevHub rather than copied from a list.</li>
        <li>No stars, ratings, or “best project” rankings are used in V0.1.</li>
        <li>
          V0.1 is manually curated; it does not automatically mirror another
          directory.
        </li>
      </ul>

      <p>
        Want to learn the primitives first? Read{" "}
        <Link href="/what-is-jev">What is Jev?</Link> or start from{" "}
        <Link href="/templates">eight practical templates</Link>.
      </p>
    </ArticleShell>
  );
}
