import { SITE } from "@/lib/site";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function siteStructuredData() {
  const organizationId = `${SITE.url}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        logo: {
          "@type": "ImageObject",
          url: new URL(SITE.logoPath, SITE.url).toString(),
          width: 512,
          height: 512,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        publisher: {
          "@id": organizationId,
        },
      },
    ],
  } as const;
}

export function breadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, SITE.url).toString(),
    })),
  } as const;
}
