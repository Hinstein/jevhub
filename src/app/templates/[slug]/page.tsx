import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleShell } from "@/components/article-shell";
import { CodeBlock } from "@/components/code-block";
import { templateBySlug, templates } from "@/content/templates";
import { pageMetadata } from "@/lib/metadata";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return templates.map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = templateBySlug.get(slug);
  if (!template) return {};

  return pageMetadata(
    `${template.title} — Jev Template`,
    template.description,
    `/templates/${template.slug}`,
  );
}

function renderCriteria(
  criteria: Record<string, string | null> | string[] | undefined,
) {
  if (!criteria) return null;

  if (Array.isArray(criteria)) {
    return (
      <ol>
        {criteria.map((criterion) => (
          <li key={criterion}>{criterion}</li>
        ))}
      </ol>
    );
  }

  return (
    <ul>
      {Object.entries(criteria).map(([key, value]) => (
        <li key={key}>
          <code>{key}</code>
          {value ? ` — ${value}` : ""}
        </li>
      ))}
    </ul>
  );
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const template = templateBySlug.get(slug);
  if (!template) notFound();

  return (
    <ArticleShell
      path={`/templates/${template.slug}`}
      breadcrumbParent={{ name: "Templates", path: "/templates" }}
      eyebrow={`${template.category} · ${template.difficulty}`}
      title={template.title}
      description={template.description}
    >
      <div className="badges">
        {template.primitives.map((primitive) => (
          <span className="badge" key={primitive}>
            {primitive}
          </span>
        ))}
      </div>

      <h2>When to use it</h2>
      <ul>
        {template.useCases.map((useCase) => (
          <li key={useCase}>{useCase}</li>
        ))}
      </ul>

      <h2>Example state</h2>
      <CodeBlock code={JSON.stringify(template.stateExample, null, 2)} />

      <h2>Decision questions</h2>
      {template.questions.map((question) => (
        <section className="card" key={question.id}>
          <div className="badges">
            <span className="badge">{question.type}</span>
            <span className="badge">{question.id}</span>
          </div>
          <h3>{question.instruction}</h3>
          {renderCriteria(question.criteria)}
        </section>
      ))}

      <h2>Expected structured output</h2>
      <p>{template.expectedOutput}</p>

      <h2>TypeScript example</h2>
      <CodeBlock code={template.typescriptExample} templateSlug={template.slug} />

      <h2>Why this design works</h2>
      <ul>
        {template.whyItWorks.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <h2>Limits and boundaries</h2>
      <ul>
        {template.limits.map((limit) => (
          <li key={limit}>{limit}</li>
        ))}
      </ul>

      <h2>Sources and inspiration</h2>
      <div className="source-list">
        {template.sourceNotes.map((source) => (
          <div className="source-row" key={`${source.kind}-${source.url}`}>
            <span className="source-kind">{source.kind}</span>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.label} ↗
            </a>
          </div>
        ))}
      </div>

      <h2>Continue</h2>
      <p>
        Browse <Link href="/templates">all templates</Link>, learn the{" "}
        <Link href="/getting-started">official SDK shape</Link>, or estimate
        production volume with the{" "}
        <Link href="/tools/jev-cost-calculator">cost calculator</Link>.
      </p>
    </ArticleShell>
  );
}
