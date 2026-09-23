export const LOGO_ASSETS = {
  svg: "/icon.svg",
  png: "/logo.png",
  favicon: "/favicon.ico",
} as const;

export const SITE = {
  name: "JevHub",
  url: "https://jevhub.xyz",
  logoPath: LOGO_ASSETS.png,
  socialImagePath: "/opengraph-image",
  description:
    "Independent Jev AI hub for real apps, an interactive playground, API guides, pricing, examples, and the TypeSafe Jev ecosystem.",
  storeUrl:
    "https://jevhub.store/?utm_source=jevhub.xyz&utm_medium=referral&utm_campaign=store",
  disclaimer:
    "Independent community resource. Not affiliated with or endorsed by TypeSafe AI.",
} as const;

export const INDEXABLE_ROUTES = [
  "/",
  "/apps/startup-idea-validator",
  "/apps/inbox-triage",
  "/playground",
  "/what-is-jev",
  "/pricing",
  "/getting-started",
  "/jev-vs-chatgpt",
  "/tools/jev-cost-calculator",
  "/templates",
  "/templates/refund-detection",
  "/templates/support-routing",
  "/templates/lead-qualification",
  "/templates/buying-intent",
  "/templates/spam-detection",
  "/templates/agent-router",
  "/templates/task-completion",
  "/templates/content-moderation",
  "/ecosystem",
] as const;

export const LOCALIZED_ROUTES = INDEXABLE_ROUTES;

export const NAV_ITEMS = [
  { href: "/playground", label: "Playground" },
  { href: "/what-is-jev", label: "Learn Jev" },
  { href: "/templates", label: "Examples" },
  { href: "/ecosystem", label: "Ecosystem" },
] as const;

export const APP_NAV_ITEMS = [
  { href: "/apps/startup-idea-validator", label: "Idea Validator" },
  { href: "/apps/inbox-triage", label: "Inbox Triage" },
] as const;
