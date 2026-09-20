export type AnalyticsEvent =
  | "calculator_used"
  | "template_code_copied"
  | "ecosystem_outbound_clicked"
  | "store_click";

type AnalyticsParams = Record<string, string | number | boolean>;

type UmamiTracker = {
  track: (name: string, data?: AnalyticsParams) => void;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    umami?: UmamiTracker;
  }
}

export function trackEvent(
  name: AnalyticsEvent,
  params: AnalyticsParams = {},
) {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }

  if (typeof window.umami?.track === "function") {
    window.umami.track(name, params);
  }
}
