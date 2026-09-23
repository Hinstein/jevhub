import { notFound } from "next/navigation";
import { ArticleShell } from "@/components/article-shell";
import { CodeBlock } from "@/components/code-block";
import { EcosystemCard } from "@/components/ecosystem-card";
import { JevDecisionExplainer } from "@/components/jev-decision-explainer";
import { JevPlayground } from "@/components/playground/jev-playground";
import { IdeaValidatorPage } from "@/components/idea-validator/idea-validator-page";
import { InboxTriagePage } from "@/components/inbox-triage/inbox-triage-page";
import { INBOX_TRIAGE_COPY } from "@/i18n/inbox-triage-copy";
import { IDEA_VALIDATOR_COPY } from "@/i18n/idea-validator-copy";
import { JevCostCalculator } from "@/components/calculator/jev-cost-calculator";
import { LocaleLink } from "@/components/locale-link";
import { StoreLink } from "@/components/store-link";
import { TemplateCard } from "@/components/template-card";
import { ecosystem, ecosystemCategories } from "@/content/ecosystem";
import { TEMPLATE_CONTENT_REVIEWED_AT, templates, templateBySlug } from "@/content/templates";
import { JEV_PRICING } from "@/data/jev-pricing";
import { INTL_COPY, localizedIntlCategory, localizedIntlEcosystemCategory, localizedIntlTemplate, type AddedLocale } from "@/i18n/intl-content";
import { localizedPrimitive } from "@/i18n/zh-content";
import type { Locale } from "@/i18n/config";

const featuredTemplates = ["refund-detection", "agent-router", "task-completion", "lead-qualification"];
const example = `import { choice, TypeSafeClient } from "@typesafe-ai/sdk";\n\nconst client = new TypeSafeClient();\nconst result = await client.systemOne({\n  state: { message: "I was charged twice. Please fix this ASAP." },\n  questions: {\n    category: choice("What is this ticket about?", {\n      billing: null, technical: null, other: null,\n    }),\n  },\n});`;
const install = `npm install @typesafe-ai/sdk`;
const quickstart = `import { choice, TypeSafeClient } from "@typesafe-ai/sdk";\n\nconst client = new TypeSafeClient();\nconst response = await client.systemOne({\n  state: { document: "I was charged twice. Please fix this ASAP." },\n  questions: {\n    category: choice("What is this ticket about?", {\n      billing: null, technical: null, other: null,\n    }),\n  },\n});\n\nconsole.log(response.answers.category.choice);`;
const multi = `import { choice, noul, score, TypeSafeClient } from "@typesafe-ai/sdk";\n\nconst client = new TypeSafeClient();\nconst response = await client.systemOne({\n  state: { message: "Our checkout failed twice and launch is tomorrow." },\n  questions: {\n    route: choice("Which queue should own this?", {\n      billing: "Payment and charge issues",\n      technical: "Product or integration failures",\n      other: "Everything else",\n    }),\n    urgent: noul("Is this time-sensitive?"),\n    severity: score("How severe is the impact?", [\n      "Low", "Moderate", "High", "Critical",\n    ]),\n  },\n});`;

function formatUsd(value: number, locale: AddedLocale) {
  return new Intl.NumberFormat(locale === "ja" ? "ja-JP" : locale === "fr" ? "fr-FR" : "pl-PL", { style: "currency", currency: "USD", minimumFractionDigits: value < 1 ? 3 : 2, maximumFractionDigits: value < 1 ? 4 : 2 }).format(value);
}

export function InternationalizedHomePage({ locale }: { locale: AddedLocale }) {
  const copy = INTL_COPY[locale];
  const ideaCopy = IDEA_VALIDATOR_COPY[locale];
  const inboxCopy = INBOX_TRIAGE_COPY[locale];
  const featured = templates.filter((template) => featuredTemplates.includes(template.slug));
  return <>
    <section className="hero"><div className="shell"><div className="eyebrow">{copy.home.intro.eyebrow}</div><h1>{copy.home.intro.title}</h1><p className="hero-copy">{copy.home.intro.description}</p><div className="actions"><LocaleLink className="button-primary" href="/apps/startup-idea-validator" locale={locale}>{ideaCopy.title}</LocaleLink><LocaleLink className="button-secondary" href="/playground" locale={locale}>{copy.common.playground}</LocaleLink></div></div></section>
    <section className="section home-app-section"><div className="shell"><div className="home-app-card"><div><div className="eyebrow">{ideaCopy.appLabel}</div><h2>{ideaCopy.title}</h2><p>{ideaCopy.description}</p><div className="idea-preview-grid home-idea-preview" aria-hidden="true">{Object.values(ideaCopy.dimensionLabels).map((label) => <span key={label}>{label}</span>)}</div><div className="actions"><LocaleLink className="button-primary" href="/apps/startup-idea-validator" locale={locale}>{ideaCopy.submit} →</LocaleLink></div></div><div className="home-app-score" aria-hidden="true"><span>Jev</span><strong>72</strong><b>SHIP</b><small>{ideaCopy.meta[0]} · {ideaCopy.meta[1]}</small></div></div></div></section>
    <section className="section home-app-section"><div className="shell"><div className="home-app-card home-inbox-card"><div><div className="eyebrow">{inboxCopy.eyebrow}</div><h2>{inboxCopy.title}</h2><p>{inboxCopy.description}</p><div className="actions"><LocaleLink className="button-primary" href="/apps/inbox-triage" locale={locale}>{inboxCopy.sampleButton} →</LocaleLink></div></div><div className="home-inbox-preview" aria-hidden="true"><span>INBOX / 06</span><strong>↗ <small>{inboxCopy.queues.needs_reply.title}</small></strong><strong>◇ <small>{inboxCopy.queues.review.title}</small></strong><strong>↓ <small>{inboxCopy.queues.read_later.title}</small></strong></div></div></div></section>
    <section className="section"><div className="shell"><JevDecisionExplainer locale={locale} compact /><div className="actions"><LocaleLink className="button-primary" href="/playground" locale={locale}>{copy.home.flowCta}</LocaleLink></div></div></section>
    <section className="section"><div className="shell"><div className="section-heading"><div className="eyebrow">{copy.home.startEyebrow}</div><h2>{copy.home.startTitle}</h2><p>{copy.home.startDescription}</p></div><div className="grid grid-3">{copy.home.cards.map((card, index) => { const href = ["/what-is-jev", "/playground", "/getting-started", "/pricing", "/templates"][index]; return <LocaleLink className="card card-link" href={href} locale={locale} key={href}><div className="eyebrow">{card.kicker}</div><h3>{card.title}</h3><p>{card.description}</p></LocaleLink>; })}</div></div></section>
    <section className="section"><div className="shell"><div className="section-heading"><div className="eyebrow">{copy.home.useCasesIntro.eyebrow}</div><h2>{copy.home.useCasesIntro.title}</h2><p>{copy.home.useCasesIntro.description}</p></div><div className="grid grid-4">{copy.home.useCases.map(([title, body]) => <div className="card" key={title}><h3>{title}</h3><p>{body}</p></div>)}</div></div></section>
    <section className="section"><div className="shell"><div className="section-heading"><div className="eyebrow">{copy.home.examplesIntro.eyebrow}</div><h2>{copy.home.examplesIntro.title}</h2><p>{copy.home.examplesIntro.description}</p></div><div className="grid grid-2">{featured.map((template) => <TemplateCard key={template.slug} template={template} locale={locale} />)}</div><div className="actions"><LocaleLink className="button-secondary" href="/templates" locale={locale}>{copy.home.seeAllExamples}</LocaleLink></div></div></section>
    <section className="section"><div className="shell"><div className="section-heading"><div className="eyebrow">{copy.home.pricingIntro.eyebrow}</div><h2>{copy.home.pricingIntro.title}</h2><p>{copy.home.pricingIntro.description}</p></div><div className="grid grid-3"><div className="card"><div className="eyebrow">{copy.home.inputLabel}</div><h3>{formatUsd(JEV_PRICING.pricePerMillionInputTokens, locale)} / 1M</h3><p>{copy.home.inputDescription}</p></div><div className="card"><div className="eyebrow">{copy.home.outputLabel}</div><h3>{JEV_PRICING.pricePerMillionOutputTokens === 0 ? copy.home.outputFree : formatUsd(JEV_PRICING.pricePerMillionOutputTokens, locale)}</h3><p>{copy.home.outputDescription}</p></div><div className="card"><div className="eyebrow">{copy.home.verifiedLabel}</div><h3>{JEV_PRICING.lastVerifiedAt}</h3><p>{copy.home.verifiedDescription}</p></div></div><p className="small home-source-note"><a href={JEV_PRICING.sourceUrl} target="_blank" rel="noreferrer">{copy.home.source}</a></p><div className="actions"><LocaleLink className="button-primary" href="/pricing" locale={locale}>{copy.home.pricingButton}</LocaleLink><LocaleLink className="button-secondary" href="/tools/jev-cost-calculator" locale={locale}>{copy.home.calculatorButton}</LocaleLink></div></div></section>
    <section className="section"><div className="shell"><div className="section-heading"><div className="eyebrow">{copy.home.ecosystemIntro.eyebrow}</div><h2>{copy.home.ecosystemIntro.title}</h2><p>{copy.home.ecosystemIntro.description}</p></div><div className="grid grid-3">{ecosystem.slice(0, 6).map((item) => <EcosystemCard item={item} key={item.repoUrl} locale={locale} />)}</div><div className="actions"><LocaleLink className="button-secondary" href="/ecosystem" locale={locale}>{copy.home.ecosystemButton}</LocaleLink></div></div></section>
    <section className="section"><div className="shell"><div className="section-heading"><div className="eyebrow">{copy.home.faqIntro.eyebrow}</div><h2>{copy.home.faqIntro.title}</h2></div><div className="faq-list">{copy.home.faq.map((faq) => <div className="faq-item" key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></div>)}</div></div></section>
  </>;
}

export function InternationalizedPlaygroundPage({ locale }: { locale: AddedLocale }) {
  const copy = INTL_COPY[locale];
  return <><section className="playground-hero"><div className="shell"><div className="eyebrow">{copy.playground.intro.eyebrow}</div><h1>{copy.playground.intro.title}</h1><p className="hero-copy">{copy.playground.intro.description}</p><div className="playground-hero-meta">{copy.playground.meta.map((item) => <span key={item}>✓ {item}</span>)}</div></div></section><JevPlayground locale={locale} /><section className="playground-notes"><div className="shell grid grid-2"><div className="card"><div className="eyebrow">{copy.playground.intro.title}</div><h2>{copy.playground.howTitle}</h2><p>{copy.playground.howBody}</p></div><div className="card"><div className="eyebrow">{copy.common.nextHeading}</div><h2>{copy.playground.continueTitle}</h2><p>{copy.playground.continueBody} <LocaleLink href="/what-is-jev" locale={locale}>{copy.playground.whatLink}</LocaleLink> <LocaleLink href="/templates" locale={locale}>{copy.playground.templatesLink}</LocaleLink>.</p></div></div></section></>;
}

export function InternationalizedWhatIsJevPage({ locale }: { locale: AddedLocale }) {
  const copy = INTL_COPY[locale];
  return <ArticleShell locale={locale} path="/what-is-jev" eyebrow={copy.what.intro.eyebrow} title={copy.what.intro.title} description={copy.what.intro.description}><div className="callout">{copy.what.callout}</div><JevDecisionExplainer locale={locale} /><h2>{copy.what.firstHeading}</h2><p>{copy.what.firstBody}</p><div className="actions"><LocaleLink className="button-primary" href="/playground" locale={locale}>{copy.common.playground}</LocaleLink><LocaleLink className="button-secondary" href="/getting-started" locale={locale}>{copy.common.quickstart}</LocaleLink></div><h2>{copy.what.sdkHeading}</h2><p>{copy.what.sdkBody}</p><CodeBlock code={example} locale={locale} /><h2>{copy.what.choiceHeading}</h2><p>{copy.what.choiceBody}</p><h2>{copy.what.scoreHeading}</h2><p>{copy.what.scoreBody}</p><h2>{copy.what.noulHeading}</h2><p>{copy.what.noulBody}</p><h2>{copy.what.useHeading}</h2><ul>{copy.what.useItems.map((item) => <li key={item}>{item}</li>)}</ul><h2>{copy.what.avoidHeading}</h2><ul>{copy.what.avoidItems.map((item) => <li key={item}>{item}</li>)}</ul><h2>{copy.what.nextHeading}</h2><p>{copy.what.nextBody} <LocaleLink href="/playground" locale={locale}>{copy.common.playground}</LocaleLink>、<LocaleLink href="/getting-started" locale={locale}>{copy.common.quickstart}</LocaleLink>、<LocaleLink href="/pricing" locale={locale}>{copy.common.pricing}</LocaleLink>、<LocaleLink href="/templates" locale={locale}>{copy.common.templates}</LocaleLink>。</p></ArticleShell>;
}

export function InternationalizedPricingPage({ locale }: { locale: AddedLocale }) {
  const copy = INTL_COPY[locale];
  const examples = [1_000_000, 100_000_000, 1_000_000_000];
  return <ArticleShell locale={locale} path="/pricing" eyebrow={copy.pricing.intro.eyebrow} title={copy.pricing.intro.title} description={copy.pricing.intro.description}><div className="callout">{copy.pricing.callout}</div><h2>{copy.pricing.currentHeading}</h2><div className="table-wrap"><table><thead><tr><th>{copy.pricing.input}</th><th>{copy.pricing.output}</th></tr></thead><tbody><tr><td>{formatUsd(JEV_PRICING.pricePerMillionInputTokens, locale)} / 1M</td><td>{JEV_PRICING.pricePerMillionOutputTokens === 0 ? copy.home.outputFree : formatUsd(JEV_PRICING.pricePerMillionOutputTokens, locale)}</td></tr></tbody></table></div><h2>{copy.pricing.examplesHeading}</h2><div className="grid grid-3">{examples.map((tokens, index) => <div className="card" key={tokens}><div className="eyebrow">{copy.pricing.examples[index]}</div><h3>{formatUsd((tokens / 1_000_000) * JEV_PRICING.pricePerMillionInputTokens, locale)}</h3><p>{copy.pricing.exampleNote}</p></div>)}</div><h2>{copy.pricing.tokenHeading}</h2><p>{copy.pricing.tokenBody}</p><div className="actions"><LocaleLink className="button-primary" href="/tools/jev-cost-calculator" locale={locale}>{copy.pricing.calculatorButton}</LocaleLink><LocaleLink className="button-secondary" href="/getting-started" locale={locale}>{copy.pricing.quickstartButton}</LocaleLink></div><h2>{copy.pricing.sourceHeading}</h2><p><a href={JEV_PRICING.sourceUrl} target="_blank" rel="noreferrer">{copy.home.source}</a></p><h2>{copy.pricing.storeHeading}</h2><p>{copy.pricing.storeBody}</p><StoreLink locale={locale} /></ArticleShell>;
}

export function InternationalizedGettingStartedPage({ locale }: { locale: AddedLocale }) {
  const copy = INTL_COPY[locale];
  return <ArticleShell locale={locale} path="/getting-started" eyebrow={copy.gettingStarted.intro.eyebrow} title={copy.gettingStarted.intro.title} description={copy.gettingStarted.intro.description}><h2>{copy.gettingStarted.headings[0]}</h2><p>{copy.gettingStarted.paragraphs[0]}</p><h2>{copy.gettingStarted.headings[1]}</h2><CodeBlock code={install} locale={locale} /><p>{copy.gettingStarted.paragraphs[0]}</p><h2>{copy.gettingStarted.headings[2]}</h2><CodeBlock code={quickstart} locale={locale} /><p>{copy.gettingStarted.paragraphs[1]}</p><h2>{copy.gettingStarted.headings[3]}</h2><p>{copy.gettingStarted.paragraphs[2]}</p><h2>{copy.gettingStarted.headings[4]}</h2><p>{copy.gettingStarted.paragraphs[3]}</p><CodeBlock code={multi} locale={locale} /><h2>{copy.gettingStarted.headings[5]}</h2><p>{copy.gettingStarted.paragraphs[4]}</p><h2>{copy.gettingStarted.headings[6]}</h2><p><a href="https://github.com/typesafe-ai/typesafe-sdk-js" target="_blank" rel="noreferrer">{copy.home.source}</a></p><p>{copy.gettingStarted.nextBody} <LocaleLink href="/playground" locale={locale}>{copy.common.playground}</LocaleLink>、<LocaleLink href="/templates" locale={locale}>{copy.common.templates}</LocaleLink>、<LocaleLink href="/pricing" locale={locale}>{copy.common.pricing}</LocaleLink>。</p></ArticleShell>;
}

export function InternationalizedComparisonPage({ locale }: { locale: AddedLocale }) {
  const copy = INTL_COPY[locale];
  return <ArticleShell locale={locale} path="/jev-vs-chatgpt" eyebrow={copy.comparison.intro.eyebrow} title={copy.comparison.intro.title} description={copy.comparison.intro.description}><div className="table-wrap"><table><thead><tr>{copy.comparison.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{copy.comparison.rows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div><h2>{copy.comparison.questionHeading}</h2><p>{copy.comparison.questionBody}</p><h2>{copy.comparison.architectureHeading}</h2><div className="callout">{copy.comparison.architectureBody}</div><h2>{copy.comparison.limitsHeading}</h2><p>{copy.comparison.limitsBody}</p><p>{copy.comparison.nextBody} <LocaleLink href="/what-is-jev" locale={locale}>{copy.common.whatIsJev}</LocaleLink>、<LocaleLink href="/templates" locale={locale}>{copy.common.templates}</LocaleLink>。</p></ArticleShell>;
}

export function InternationalizedCalculatorPage({ locale }: { locale: AddedLocale }) {
  const copy = INTL_COPY[locale];
  return <ArticleShell locale={locale} path="/tools/jev-cost-calculator" eyebrow={copy.calculator.intro.eyebrow} title={copy.calculator.intro.title} description={copy.calculator.intro.description}><JevCostCalculator locale={locale} /><h2>{copy.calculator.howHeading}</h2><p>{copy.calculator.howBody}</p><h2>{copy.calculator.notHeading}</h2><ul>{copy.calculator.notItems.map((item) => <li key={item}>{item}</li>)}</ul><p>{copy.calculator.nextBody} <LocaleLink href="/playground" locale={locale}>{copy.common.playground}</LocaleLink>、<LocaleLink href="/pricing" locale={locale}>{copy.common.pricing}</LocaleLink>、<LocaleLink href="/templates" locale={locale}>{copy.common.templates}</LocaleLink>。</p><p className="small"><a href={JEV_PRICING.sourceUrl} target="_blank" rel="noreferrer">{copy.home.source}</a> · {JEV_PRICING.lastVerifiedAt}</p></ArticleShell>;
}

export function InternationalizedTemplatesPage({ locale }: { locale: AddedLocale }) {
  const copy = INTL_COPY[locale];
  const categories = ["support", "sales", "agents", "safety"] as const;
  return <ArticleShell locale={locale} path="/templates" eyebrow={copy.templates.intro.eyebrow} title={copy.templates.intro.title} description={copy.templates.intro.description}><div className="callout">{copy.templates.callout}<br /><span className="small">{copy.templates.sourceNote}: {TEMPLATE_CONTENT_REVIEWED_AT}.</span></div>{categories.map((category) => <section key={category}><h2>{localizedIntlCategory(category, locale)}</h2><div className="grid grid-2">{templates.filter((template) => template.category === category).map((template) => <TemplateCard key={template.slug} template={localizedIntlTemplate(template, locale)} locale={locale} />)}</div></section>)}</ArticleShell>;
}

function renderCriteria(criteria: Record<string, string | null> | string[] | undefined) {
  if (!criteria) return null;
  return Array.isArray(criteria) ? <ol>{criteria.map((item) => <li key={item}>{item}</li>)}</ol> : <ul>{Object.entries(criteria).map(([key, value]) => <li key={key}><code>{key}</code>{value ? ` — ${value}` : ""}</li>)}</ul>;
}

export function InternationalizedTemplateDetailPage({ locale, slug }: { locale: AddedLocale; slug: string }) {
  const sourceTemplate = templateBySlug.get(slug);
  if (!sourceTemplate) notFound();
  const template = localizedIntlTemplate(sourceTemplate, locale);
  const copy = INTL_COPY[locale];
  return <ArticleShell locale={locale} path={`/templates/${template.slug}`} breadcrumbParent={{ name: copy.common.templates, path: "/templates" }} eyebrow={`${localizedIntlCategory(template.category, locale)} · ${template.difficulty}`} title={template.title} description={template.description}><div className="badges">{template.primitives.map((primitive) => <span className="badge" key={primitive}>{localizedPrimitive(primitive, locale)}</span>)}</div><h2>{locale === "ja" ? "使用する場面" : locale === "fr" ? "Quand l’utiliser" : "Kiedy używać"}</h2><ul>{template.useCases.map((item) => <li key={item}>{item}</li>)}</ul><h2>{locale === "ja" ? "State の例" : locale === "fr" ? "Exemple de state" : "Przykładowy state"}</h2><CodeBlock code={JSON.stringify(template.stateExample, null, 2)} locale={locale} /><h2>{locale === "ja" ? "判断の質問" : locale === "fr" ? "Questions de décision" : "Pytania decyzyjne"}</h2>{template.questions.map((question) => <section className="card" key={question.id}><div className="badges"><span className="badge">{localizedPrimitive(question.type, locale)}</span><span className="badge">{question.id}</span></div><h3>{question.instruction}</h3>{renderCriteria(question.criteria)}</section>)}<h2>{locale === "ja" ? "期待される出力" : locale === "fr" ? "Sortie attendue" : "Oczekiwane wyjście"}</h2><p>{template.expectedOutput}</p><h2>TypeScript</h2><CodeBlock code={template.typescriptExample} templateSlug={template.slug} locale={locale} /><h2>{locale === "ja" ? "この設計の理由" : locale === "fr" ? "Pourquoi ce modèle fonctionne" : "Dlaczego to działa"}</h2><ul>{template.whyItWorks.map((item) => <li key={item}>{item}</li>)}</ul><h2>{locale === "ja" ? "注意点" : locale === "fr" ? "Limites" : "Ograniczenia"}</h2><ul>{template.limits.map((item) => <li key={item}>{item}</li>)}</ul><h2>{copy.common.sourceHeading}</h2><p className="small">{template.lastReviewedAt}</p><div className="source-list">{template.sourceNotes.map((source) => <div className="source-row" key={`${source.kind}-${source.url}`}><span className="source-kind">{source.kind}</span><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a></div>)}</div><p>{copy.common.nextHeading}: <LocaleLink href="/playground" locale={locale}>{copy.common.playground}</LocaleLink>、<LocaleLink href="/templates" locale={locale}>{copy.common.templates}</LocaleLink>。</p></ArticleShell>;
}

export function InternationalizedEcosystemPage({ locale }: { locale: AddedLocale }) {
  const copy = INTL_COPY[locale];
  return <ArticleShell locale={locale} path="/ecosystem" eyebrow={copy.ecosystem.intro.eyebrow} title={copy.ecosystem.intro.title} description={copy.ecosystem.intro.description}><div className="callout">{copy.ecosystem.callout}</div>{ecosystemCategories.map((category) => <section className="ecosystem-section" key={category}><h2>{localizedIntlEcosystemCategory(category, locale)}</h2><div className="ecosystem-grid">{ecosystem.filter((item) => item.category === category).map((item) => <EcosystemCard item={item} key={item.repoUrl} locale={locale} />)}</div></section>)}<h2>{copy.ecosystem.maintenanceHeading}</h2><ul>{copy.ecosystem.maintenanceItems.map((item) => <li key={item}>{item}</li>)}</ul><p>{copy.ecosystem.nextBody} <LocaleLink href="/what-is-jev" locale={locale}>{copy.common.whatIsJev}</LocaleLink>、<LocaleLink href="/templates" locale={locale}>{copy.common.templates}</LocaleLink>。</p></ArticleShell>;
}

export function InternationalizedPage({ locale, path }: { locale: AddedLocale; path: string }) {
  if (path === "/") return <InternationalizedHomePage locale={locale} />;
  if (path === "/apps/startup-idea-validator") return <IdeaValidatorPage locale={locale} />;
  if (path === "/apps/inbox-triage") return <InboxTriagePage locale={locale} />;
  if (path === "/playground") return <InternationalizedPlaygroundPage locale={locale} />;
  if (path === "/what-is-jev") return <InternationalizedWhatIsJevPage locale={locale} />;
  if (path === "/pricing") return <InternationalizedPricingPage locale={locale} />;
  if (path === "/getting-started") return <InternationalizedGettingStartedPage locale={locale} />;
  if (path === "/jev-vs-chatgpt") return <InternationalizedComparisonPage locale={locale} />;
  if (path === "/tools/jev-cost-calculator") return <InternationalizedCalculatorPage locale={locale} />;
  if (path === "/templates") return <InternationalizedTemplatesPage locale={locale} />;
  if (path === "/ecosystem") return <InternationalizedEcosystemPage locale={locale} />;
  if (path.startsWith("/templates/")) return <InternationalizedTemplateDetailPage locale={locale} slug={path.slice("/templates/".length)} />;
  notFound();
}
