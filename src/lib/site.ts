export const SITE = {
  name: "JevHub",
  url: "https://jevhub.xyz",
  homeUrl: "https://jevhub.xyz/",
  logoPath: "/logo.png",
  socialImagePath: "/opengraph-image",
  description:
    "Independent guides, cost tools, practical templates, and a curated ecosystem directory for TypeSafe AI's Jev decision model.",
  storeUrl:
    "https://jevhub.store/?utm_source=jevhub.xyz&utm_medium=referral&utm_campaign=store",
  disclaimer:
    "Independent community resource. Not affiliated with or endorsed by TypeSafe AI.",
} as const;

export const INDEXABLE_ROUTES = [
  "/",
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
  { href: "/what-is-jev", label: "Learn" },
  { href: "/tools/jev-cost-calculator", label: "Calculator" },
  { href: "/templates", label: "Templates" },
  { href: "/ecosystem", label: "Ecosystem" },
] as const;
