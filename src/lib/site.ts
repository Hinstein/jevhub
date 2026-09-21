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
    "Independent Jev playground, guides, cost tools, practical templates, and a curated ecosystem directory for TypeSafe AI's Jev decision model.",
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
  { href: "/pricing", label: "Pricing" },
  { href: "/templates", label: "Templates" },
  { href: "/ecosystem", label: "Ecosystem" },
] as const;
