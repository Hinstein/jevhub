import {
  breadcrumbStructuredData,
  type BreadcrumbItem,
  siteStructuredData,
} from "@/lib/structured-data";

function serialize(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}

export function SiteStructuredData() {
  return <JsonLd data={siteStructuredData()} />;
}

export function BreadcrumbStructuredData({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  return <JsonLd data={breadcrumbStructuredData(items)} />;
}
