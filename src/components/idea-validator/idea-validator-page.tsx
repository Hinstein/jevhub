import { BreadcrumbStructuredData, JsonLd } from "@/components/structured-data";
import { IdeaValidator } from "@/components/idea-validator/idea-validator";
import { LocaleLink } from "@/components/locale-link";
import { IDEA_VALIDATOR_COPY } from "@/i18n/idea-validator-copy";
import { localizePath, type Locale } from "@/i18n/config";
import { SITE } from "@/lib/site";

const basePath = "/apps/startup-idea-validator";

export function IdeaValidatorPage({ locale = "en" }: { locale?: Locale }) {
  const copy = IDEA_VALIDATOR_COPY[locale];
  const localizedPath = localizePath(basePath, locale);

  const applicationStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `JevHub — ${copy.title}`,
    url: new URL(localizedPath, SITE.url).toString(),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: locale,
    description: copy.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: locale === "zh" ? "首页" : "Home", path: localizePath("/", locale) },
          { name: copy.title, path: localizedPath },
        ]}
      />
      <JsonLd data={applicationStructuredData} />

      <section className="idea-hero">
        <div className="shell">
          <div className="eyebrow">{copy.appLabel}</div>
          <h1>{copy.title}</h1>
          <p className="hero-copy">{copy.description}</p>
          <div className="idea-hero-meta">
            {copy.meta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="shell">
        <IdeaValidator locale={locale} />
      </div>

      <section className="section">
        <div className="shell idea-content">
          <div className="section-heading">
            <div className="eyebrow">{copy.howEyebrow}</div>
            <h2>{copy.howTitle}</h2>
            <p>{copy.howBody}</p>
          </div>

          <div className="grid grid-4">
            {copy.dimensionCards.map(([title, body]) => (
              <div className="card" key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-3 idea-verdict-guide">
            {copy.verdictGuide.map(([range, verdict, body]) => (
              <div className="card" key={verdict}>
                <div className="eyebrow">{range}</div>
                <h3>{verdict}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>

          <div className="callout idea-limit">
            <strong>{copy.limitTitle}</strong>
            <br />
            {copy.limitBody}
          </div>

          <h2>{copy.whyTitle}</h2>
          <p>
            {copy.whyBodyPrefix}{" "}
            <LocaleLink href="/playground" locale={locale}>
              {copy.playgroundLink}
            </LocaleLink>
            .
          </p>

          <h2>{copy.buildTitle}</h2>
          <p>
            {copy.buildBodyPrefix}{" "}
            <LocaleLink href="/templates" locale={locale}>
              {copy.templatesLink}
            </LocaleLink>{" "}
            {copy.buildBodyMiddle}{" "}
            <LocaleLink href="/getting-started" locale={locale}>
              {copy.quickstartLink}
            </LocaleLink>{" "}
            {copy.buildBodySuffix}
          </p>
        </div>
      </section>
    </>
  );
}
