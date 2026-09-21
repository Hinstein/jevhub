"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  getLocaleFromPathname,
  LANGUAGE_COPY,
  localizePath,
  NAV_LABELS,
  withoutLocale,
} from "@/i18n/config";
import { NAV_ITEMS } from "@/lib/site";
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
            <Image src="/logo.png" alt="" width={32} height={32} priority />
          </span>
          <span>JevHub</span>
        </Link>

        <nav className="desktop-nav" aria-label={copy.primaryNav}>
          {navItems.map((item) => (
            <Link
              className={currentPath === item.href ? "nav-link nav-active" : "nav-link"}
              href={item.href}
              aria-current={currentPath === item.href ? "page" : undefined}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <StoreLink locale={locale} />
          <Link
            className="language-switcher"
            href={localizePath(pathname, locale === "en" ? "zh" : "en")}
            hrefLang={locale === "en" ? "zh-CN" : "en"}
            aria-label={`${copy.languageLabel}: ${copy.switchTo}`}
          >
            {copy.switchTo}
          </Link>
        </nav>

        <details className="mobile-nav">
          <summary aria-label={copy.menu}>{copy.menu}</summary>
          <nav className="mobile-menu" aria-label={copy.primaryNav}>
            {navItems.map((item) => (
              <Link
                href={item.href}
                aria-current={currentPath === item.href ? "page" : undefined}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
            <StoreLink className="store-link" locale={locale} />
            <Link
              href={localizePath(pathname, locale === "en" ? "zh" : "en")}
              hrefLang={locale === "en" ? "zh-CN" : "en"}
            >
              {copy.switchTo}
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
