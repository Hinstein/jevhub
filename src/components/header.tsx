"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  APPS_NAV_LABEL,
  getLocaleFromPathname,
  LANGUAGE_COPY,
  localizePath,
  NAV_LABELS,
  withoutLocale,
} from "@/i18n/config";
import { APP_NAV_ITEMS, NAV_ITEMS } from "@/lib/site";
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
  const appItems = APP_NAV_ITEMS.map((item) => ({
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
          <details className="apps-menu">
            <summary className={appItems.some((item) => currentPath === withoutLocale(item.href)) ? "nav-link nav-active" : "nav-link"}>{APPS_NAV_LABEL[locale]} <span aria-hidden="true">⌄</span></summary>
            <div className="apps-menu-panel">
              {appItems.map((item) => <Link href={item.href} key={item.href} aria-current={currentPath === withoutLocale(item.href) ? "page" : undefined} onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>{item.label}</Link>)}
            </div>
          </details>
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
            <div className="mobile-apps-label">{APPS_NAV_LABEL[locale]}</div>
            {appItems.map((item) => <Link href={item.href} key={item.href} aria-current={currentPath === withoutLocale(item.href) ? "page" : undefined} onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>{item.label}</Link>)}
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
            <LanguageSwitcher />
          </nav>
        </details>
      </div>
    </header>
  );
}
