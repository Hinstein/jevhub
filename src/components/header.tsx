import Link from "next/link";
import { NAV_ITEMS } from "@/lib/site";
import { StoreLink } from "@/components/store-link";

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            J
          </span>
          <span>JevHub</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <StoreLink />
        </nav>

        <details className="mobile-nav">
          <summary aria-label="Open navigation">Menu</summary>
          <nav className="mobile-menu" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <StoreLink className="store-link" />
          </nav>
        </details>
      </div>
    </header>
  );
}
