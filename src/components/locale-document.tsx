"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getLocaleFromPathname } from "@/i18n/config";

export function LocaleDocument() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    document.documentElement.lang =
      getLocaleFromPathname(pathname) === "zh" ? "zh-CN" : "en";
  }, [pathname]);

  return null;
}
