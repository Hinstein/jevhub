import type { Metadata } from "next";
import { ChinesePage } from "@/components/chinese-pages";
import { INDEXABLE_ROUTES } from "@/lib/site";
import { localizedPageMetadata } from "@/lib/metadata";
import { getTemplateTranslation, ZH_PAGE_METADATA } from "@/i18n/zh-content";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return INDEXABLE_ROUTES.map((route) => ({
    slug: route === "/" ? [] : route.slice(1).split("/"),
  }));
}

function routePath(slug?: string[]) {
  return slug?.length ? `/${slug.join("/")}` : "/";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = routePath((await params).slug);
  const directMetadata = ZH_PAGE_METADATA[path];

  if (directMetadata) {
    return localizedPageMetadata(
      "zh",
      directMetadata.title,
      directMetadata.description,
      path,
    );
  }

  if (path.startsWith("/templates/")) {
    const slug = path.slice("/templates/".length);
    const translation = getTemplateTranslation(slug);
    if (translation) {
      return localizedPageMetadata(
        "zh",
        `${translation.title} — Jev 模板`,
        translation.description,
        path,
      );
    }
  }

  return {};
}

export default async function ChineseLocalizedPage({ params }: Props) {
  return <ChinesePage path={routePath((await params).slug)} />;
}
