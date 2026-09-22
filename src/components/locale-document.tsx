"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getLocaleFromPathname, LOCALE_CONFIG } from "@/i18n/config";

export function LocaleDocument() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    const locale = getLocaleFromPathname(pathname);
    document.documentElement.lang = LOCALE_CONFIG[locale].htmlLang;
  }, [pathname]);

  return null;
}
