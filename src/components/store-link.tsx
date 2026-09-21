"use client";

import type { MouseEvent, ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  getLocaleFromPathname,
  localizePath,
  type Locale,
} from "@/i18n/config";
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
    <a
      className={className}
      href={localizePath("/go/store", currentLocale)}
      onClick={onClick}
    >
      {children ?? (currentLocale === "zh" ? "商店 ↗" : "Store ↗")}
    </a>
  );
}
