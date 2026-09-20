import type { EcosystemItem } from "@/types/ecosystem";
import { EcosystemOutboundLink } from "@/components/outbound-link";

export function EcosystemCard({ item }: { item: EcosystemItem }) {
  return (
    <article className="card">
      <div className="eyebrow">{item.category}</div>
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <div className="ecosystem-links">
        <EcosystemOutboundLink
          href={item.repoUrl}
          label="GitHub"
          itemName={item.name}
        />
        {item.websiteUrl ? (
          <EcosystemOutboundLink
            href={item.websiteUrl}
            label="Website"
            itemName={item.name}
          />
        ) : null}
      </div>
    </article>
  );
}
