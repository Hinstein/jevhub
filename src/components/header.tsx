"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getLocaleFromPathname,
  LANGUAGE_COPY,
  localizePath,
  NAV_LABELS,
  withoutLocale,
} from "@/i18n/config";
import { NAV_ITEMS } from "@/lib/site";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { StoreLink } from "@/components/store-link";

export function Header() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = LANGUAGE_COPY[locale];
  const currentPath = withoutLocale(pathname);
  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    href: localizePath(item.href, locale),
    label: NAV_LABELS[locale][item.href],
  }));

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href={localizePath("/", locale)}>
          <span className="brand-mark" aria-hidden="true">
            <Logo alt="" size={32} priority />
          </span>
          <span>JevHub</span>
        </Link>

        <nav className="desktop-nav" aria-label={copy.primaryNav}>
          {navItems.map((item) => (
            <Link
              className={currentPath === withoutLocale(item.href) ? "nav-link nav-active" : "nav-link"}
              href={item.href}
              aria-current={currentPath === withoutLocale(item.href) ? "page" : undefined}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <StoreLink locale={locale} />
          <LanguageSwitcher />
        </nav>

        <details className="mobile-nav">
          <summary aria-label={copy.menu}>{copy.menu}</summary>
          <nav className="mobile-menu" aria-label={copy.primaryNav}>
            {navItems.map((item) => (
              <Link
                href={item.href}
                aria-current={currentPath === withoutLocale(item.href) ? "page" : undefined}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
            <StoreLink className="store-link" locale={locale} />
            {showLanguageSwitcher ? <LanguageSwitcher /> : null}
          </nav>
        </details>
      </div>
    </header>
  );
}
