import type { EcosystemItem } from "@/types/ecosystem";
import { type Locale } from "@/i18n/config";
import {
  localizedEcosystemItem,
  localizedEcosystemCategory,
} from "@/i18n/zh-content";
import { EcosystemOutboundLink } from "@/components/outbound-link";

export function EcosystemCard({
  item,
  locale = "en",
}: {
  item: EcosystemItem;
  locale?: Locale;
}) {
  const content = localizedEcosystemItem(item, locale);

  return (
    <article className="card">
      <div className="eyebrow">
        {localizedEcosystemCategory(item.category, locale)}
      </div>
      <h3>{item.name}</h3>
      <p>{content.description}</p>
      <p className="small">
        {locale === "zh" ? "最近核验" : "Last checked"}: {item.lastCheckedAt}
      </p>
      <div className="ecosystem-links">
        <EcosystemOutboundLink
          href={item.repoUrl}
          label="GitHub"
          itemName={item.name}
        />
        {item.websiteUrl ? (
          <EcosystemOutboundLink
            href={item.websiteUrl}
            label={locale === "zh" ? "网站" : "Website"}
            itemName={item.name}
          />
        ) : null}
      </div>
    </article>
  );
}
