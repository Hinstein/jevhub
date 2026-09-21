"use client";

import type { MouseEvent, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getLocaleFromPathname, type Locale } from "@/i18n/config";
import { trackEvent } from "@/lib/analytics";

type Props = {
  className?: string;
  children?: ReactNode;
  locale?: Locale;
};

export function StoreLink({
  className = "store-link",
  children,
  locale,
}: Props) {
  const pathname = usePathname() ?? "/";
  const currentLocale = locale ?? getLocaleFromPathname(pathname);

  function onClick(_event: MouseEvent<HTMLAnchorElement>) {
    trackEvent("store_click", { destination: "jevhub.store" });
  }

  return (
    <a className={className} href="/go/store" onClick={onClick}>
      {children ?? (currentLocale === "zh" ? "Store ↗" : "Store ↗")}
    </a>
  );
}
