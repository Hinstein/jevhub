import type { ReactNode } from "react";
import { BreadcrumbStructuredData } from "@/components/structured-data";
import { localizePath, type Locale } from "@/i18n/config";
import type { BreadcrumbItem } from "@/lib/structured-data";

type Props = {
  eyebrow?: string;
  title: string;
  description: string;
  path: string;
  breadcrumbParent?: BreadcrumbItem;
  locale?: Locale;
  children: ReactNode;
};

export function ArticleShell({
  eyebrow,
  title,
  description,
  path,
  breadcrumbParent,
  locale = "en",
  children,
}: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: locale === "zh" ? "首页" : "Home", path: localizePath("/", locale) },
    ...(breadcrumbParent
      ? [
          {
            ...breadcrumbParent,
            path: localizePath(breadcrumbParent.path, locale),
          },
        ]
      : []),
    { name: title, path: localizePath(path, locale) },
  ];

  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbs} />
      <article className="article">
        <header className="article-header">
          <div className="eyebrow">
            {eyebrow ?? (locale === "zh" ? "JevHub 指南" : "JevHub guide")}
          </div>
          <h1>{title}</h1>
          <p className="hero-copy">{description}</p>
        </header>
        {children}
      </article>
    </>
  );
}
