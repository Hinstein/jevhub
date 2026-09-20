export type AnalyticsEvent =
  | "calculator_used"
  | "template_code_copied"
  | "ecosystem_outbound_clicked"
  | "store_click";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: AnalyticsEvent,
  params: Record<string, string | number | boolean> = {},
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
