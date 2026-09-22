import type { Metadata } from "next";
import { INDEXABLE_ROUTES } from "@/lib/site";
import { localizedPageMetadata } from "@/lib/metadata";
import { INTL_PAGE_METADATA, localizedIntlTemplate, type AddedLocale } from "@/i18n/intl-content";
import { templateBySlug } from "@/content/templates";

export function intlRoutePath(slug?: string[]) {
  return slug?.length ? `/${slug.join("/")}` : "/";
}

export function intlStaticParams() {
  return INDEXABLE_ROUTES.map((route) => ({
    slug: route === "/" ? [] : route.slice(1).split("/"),
  }));
}

export function intlMetadata(locale: AddedLocale, path: string): Metadata {
  const direct = INTL_PAGE_METADATA[locale][path];
  if (direct) {
    return localizedPageMetadata(locale, direct.title, direct.description, path);
  }

  if (path.startsWith("/templates/")) {
    const source = templateBySlug.get(path.slice("/templates/".length));
    if (source) {
      const template = localizedIntlTemplate(source, locale);
      return localizedPageMetadata(
        locale,
        `${template.title} — Jev template`,
        template.description,
        path,
      );
    }
  }

  return {};
}
