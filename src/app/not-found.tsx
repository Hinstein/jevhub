import Link from "next/link";

export default function NotFound() {
  return (
    <div className="article">
      <div className="eyebrow">404</div>
      <h1>That page is not in JevHub.</h1>
      <p className="hero-copy">
        Start with the Jev guide, calculator, templates, or ecosystem directory.
      </p>
      <div className="actions">
        <Link className="button-primary" href="/">
          Back home
        </Link>
        <Link className="button-secondary" href="/templates">
          Browse templates
        </Link>
      </div>
    </div>
  );
}
