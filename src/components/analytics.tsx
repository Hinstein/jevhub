"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    if (!gaId || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [gaId, pathname]);

  return null;
}
