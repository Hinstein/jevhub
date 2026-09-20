"use client";

import { trackEvent } from "@/lib/analytics";

type Props = {
  href: string;
  label: string;
  itemName: string;
};

export function EcosystemOutboundLink({ href, label, itemName }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() =>
        trackEvent("ecosystem_outbound_clicked", {
          item: itemName,
          destination: href,
        })
      }
    >
      {label} ↗
    </a>
  );
}
