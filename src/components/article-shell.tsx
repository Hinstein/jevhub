import type { ReactNode } from "react";
import { BreadcrumbStructuredData } from "@/components/structured-data";
import type { BreadcrumbItem } from "@/lib/structured-data";

type Props = {
  eyebrow?: string;
  title: string;
  description: string;
  path: string;
  breadcrumbParent?: BreadcrumbItem;
  children: ReactNode;
};

export function ArticleShell({
  eyebrow = "JevHub guide",
  title,
  description,
  path,
  breadcrumbParent,
  children,
}: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Home", path: "/" },
    ...(breadcrumbParent ? [breadcrumbParent] : []),
    { name: title, path },
  ];

  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbs} />
      <article className="article">
        <header className="article-header">
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p className="hero-copy">{description}</p>
        </header>
        {children}
      </article>
    </>
  );
}
