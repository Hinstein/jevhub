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
    "Independent guide to TypeSafe AI's Jev System One model. Try the Jev playground, learn the API, check current pricing, and explore practical Choice, Score, and Noul examples.",
  storeUrl:
    "https://jevhub.store/?utm_source=jevhub.xyz&utm_medium=referral&utm_campaign=store",
  disclaimer:
    "Independent community resource. Not affiliated with or endorsed by TypeSafe AI.",
} as const;

export const INDEXABLE_ROUTES = [
  "/",
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

export const NAV_ITEMS = [
  { href: "/playground", label: "Playground" },
  { href: "/what-is-jev", label: "What is Jev" },
  { href: "/getting-started", label: "API" },
  { href: "/pricing", label: "Pricing" },
  { href: "/templates", label: "Examples" },
  { href: "/ecosystem", label: "Ecosystem" },
] as const;
