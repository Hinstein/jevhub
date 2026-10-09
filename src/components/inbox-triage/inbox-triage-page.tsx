import { BreadcrumbStructuredData, JsonLd } from "@/components/structured-data";
import { InboxTriage } from "@/components/inbox-triage/inbox-triage";
import { LocaleLink } from "@/components/locale-link";
import { INBOX_TRIAGE_COPY } from "@/i18n/inbox-triage-copy";
import { LANGUAGE_COPY, LOCALE_CONFIG, localizePath, type Locale } from "@/i18n/config";
import { SITE } from "@/lib/site";

const basePath = "/apps/inbox-triage";

export function InboxTriagePage({ locale = "en" }: { locale?: Locale }) {
  const copy = INBOX_TRIAGE_COPY[locale];
  const localizedPath = localizePath(basePath, locale);
  return <>
    <BreadcrumbStructuredData items={[
      { name: LANGUAGE_COPY[locale].home, path: localizePath("/", locale) },
      { name: copy.title, path: localizedPath },
    ]} />
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: `JevHub — ${copy.title}`,
      url: new URL(localizedPath, SITE.url).toString(),
      applicationCategory: "ProductivityApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      inLanguage: LOCALE_CONFIG[locale].htmlLang,
      description: copy.description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    }} />

    <section className="inbox-hero">
      <div className="shell">
        <div className="eyebrow">{copy.eyebrow}</div>
        <h1>{copy.title}</h1>
        <p className="hero-copy">{copy.description}</p>
        <div className="inbox-hero-meta">{copy.meta.map((item) => <span key={item}>✓ {item}</span>)}</div>
        <a className="inbox-app-shortcut" href="#inboxrevamp">{copy.fullApp.heroLink} <span aria-hidden="true">↓</span></a>
      </div>
    </section>

    <InboxTriage locale={locale} />

    <section className="section inbox-followup">
      <div className="shell inbox-content">
        <section className="inbox-app-card" id="inboxrevamp" aria-labelledby="inboxrevamp-title">
          <div className="inbox-app-intro">
            <div className="eyebrow">{copy.fullApp.eyebrow}</div>
            <h2 id="inboxrevamp-title">{copy.fullApp.title}</h2>
            <p>{copy.fullApp.description}</p>
            <div className="actions">
              <a className="button-primary" href="https://inboxrevamp.com/" target="_blank" rel="noopener noreferrer" aria-describedby="inboxrevamp-note">{copy.fullApp.button} <span aria-hidden="true">↗</span></a>
            </div>
            <p className="inbox-app-note" id="inboxrevamp-note">{copy.fullApp.note}</p>
          </div>
          <ol className="inbox-app-steps">
            {copy.fullApp.steps.map((step, index) => <li key={step.title}>
              <span className="inbox-app-step-number" aria-hidden="true">0{index + 1}</span>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
            </li>)}
          </ol>
        </section>
        <div className="grid grid-2">
          <div className="card"><h2>{copy.howTitle}</h2><p>{copy.howBody}</p></div>
          <div className="card"><h2>{copy.limitTitle}</h2><p>{copy.limitBody}</p></div>
        </div>
        <div className="inbox-learn">
          <h2>{copy.learnTitle}</h2>
          <p>{copy.learnBody}</p>
          <div className="actions">
            <LocaleLink className="button-primary" href="/playground" locale={locale}>{copy.playgroundLink}</LocaleLink>
            <LocaleLink className="button-secondary" href="/templates/support-routing" locale={locale}>{copy.templateLink}</LocaleLink>
          </div>
        </div>
      </div>
    </section>
  </>;
}
