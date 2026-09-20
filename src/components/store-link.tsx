"use client";

import type { MouseEvent, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

type Props = {
  className?: string;
  children?: ReactNode;
};

export function StoreLink({ className = "store-link", children }: Props) {
  function onClick(_event: MouseEvent<HTMLAnchorElement>) {
    trackEvent("store_click", { destination: "jevhub.store" });
  }

  return (
    <a className={className} href="/go/store" onClick={onClick}>
      {children ?? "Store ↗"}
    </a>
  );
}
