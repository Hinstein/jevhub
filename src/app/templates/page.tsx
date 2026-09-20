import { ArticleShell } from "@/components/article-shell";
import { TemplateCard } from "@/components/template-card";
import { templateCategories, templates } from "@/content/templates";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Jev Templates: Choice, Score, and Noul Patterns",
  "Explore eight practical Jev templates for support, sales, agents, moderation, and other bounded decisions, with TypeScript examples and limits.",
  "/templates",
);

export default function TemplatesPage() {
  return (
    <ArticleShell
      path="/templates"
      eyebrow="Template library"
      title="Jev decision templates"
      description="Eight small patterns for bounded decisions. Each template includes example state, question design, TypeScript, limits, and sources."
    >
      <div className="callout">
        These are learning templates, not an online Jev runner. Copy the pattern
        into your own server application and adapt the criteria to your policy.
      </div>

      {templateCategories.map((category) => {
        const items = templates.filter(
          (template) => template.category === category.key,
        );
        return (
          <section key={category.key}>
            <h2>{category.label}</h2>
            <div className="grid grid-2">
              {items.map((template) => (
                <TemplateCard key={template.slug} template={template} />
              ))}
            </div>
          </section>
        );
      })}
    </ArticleShell>
  );
}
