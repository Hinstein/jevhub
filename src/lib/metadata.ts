import type { Metadata } from "next";
import { localizePath, type Locale } from "@/i18n/config";
import { SITE } from "@/lib/site";

function absoluteUrl(path: string) {
  return path === "/" ? SITE.url : new URL(path, SITE.url).toString();
}

export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const canonical = absoluteUrl(path);
  const socialImage = new URL(SITE.socialImagePath, SITE.url).toString();

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        "x-default": canonical,
      },
    },
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

export function localizedPageMetadata(
  locale: Locale,
  title: string,
  description: string,
  path: string,
): Metadata {
  const localizedPath = localizePath(path, locale);
  const canonical = absoluteUrl(localizedPath);
  const socialImage = new URL(SITE.socialImagePath, SITE.url).toString();

  return {
    title,
    description,
    robots: locale !== "en" ? { index: false, follow: true } : undefined,
    alternates: {
      canonical,
    },
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
