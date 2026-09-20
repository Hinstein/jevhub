import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function ArticleShell({
  eyebrow = "JevHub guide",
  title,
  description,
  children,
}: Props) {
  return (
    <article className="article">
      <header className="article-header">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="hero-copy">{description}</p>
      </header>
      {children}
    </article>
  );
}
