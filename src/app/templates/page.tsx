import Link from "next/link";
import { ArticleShell } from "@/components/article-shell";
import { TemplateCard } from "@/components/template-card";
import {
  templateCategories,
  templates,
  TEMPLATE_CONTENT_REVIEWED_AT,
} from "@/content/templates";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Jev Examples & Templates: Choice, Score, and Noul",
  "Browse Jev API examples and eight practical decision templates covering Choice, Score, Noul, support, sales, agents, moderation, and other bounded decisions.",
  "/templates",
);

export default function TemplatesPage() {
  return (
    <ArticleShell
      path="/templates"
      eyebrow="Examples & templates"
      title="Jev examples and decision templates"
      description="Use Jev API examples for Choice, Score, and Noul questions, then adapt eight common bounded decision patterns to your own application."
    >
      <div className="callout">
        This page collects Jev API examples, Choice examples, Score examples,
        and Noul examples for bounded decisions. See a finished scoring pattern
        in the{" "}
        <Link href="/apps/startup-idea-validator">Startup Idea Validator</Link>,
        inspect raw decisions in the <Link href="/playground">Jev Playground</Link>,
        then copy a pattern into your own server application and adapt the
        criteria to your policy.
        <br />
        <span className="small">
          Source examples last reviewed: {TEMPLATE_CONTENT_REVIEWED_AT}.
        </span>
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
