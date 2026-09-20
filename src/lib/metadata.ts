import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const canonical = new URL(path, SITE.url).toString();
  const socialImage = new URL(SITE.socialImagePath, SITE.url).toString();

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title,
      description,
      url: canonical,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}
