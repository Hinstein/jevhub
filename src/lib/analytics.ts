export type AnalyticsEvent =
  | "calculator_used"
  | "template_code_copied"
  | "ecosystem_outbound_clicked"
  | "playground_run"
  | "idea_validator_view"
  | "idea_validator_submit"
  | "idea_validator_result"
  | "idea_validator_retry"
  | "idea_validator_share"
  | "inbox_triage_view"
  | "inbox_triage_demo_submit"
  | "inbox_triage_demo_result"
  | "inbox_triage_custom_open"
  | "inbox_triage_custom_submit"
  | "inbox_triage_custom_result"
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
