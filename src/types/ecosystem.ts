export type EcosystemCategory =
  | "Official"
  | "SDKs"
  | "Integrations"
  | "Playgrounds"
  | "Agent / Tooling"
  | "Open Source / Research";

export type EcosystemItem = {
  name: string;
  description: string;
  category: EcosystemCategory;
  repoUrl: string;
  websiteUrl?: string;
  source: string;
  lastCheckedAt: string;
};
