"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getLocaleFromPathname,
  LANGUAGE_COPY,
  localizePath,
  LOCALE_CONFIG,
  LOCALES,
} from "@/i18n/config";

function GlobeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="language-globe"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.8 12h16.4M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5S14.1 18.2 12 20.5C9.9 18.2 8.8 15.4 8.8 12S9.9 5.8 12 3.5Z" />
    </svg>
  );
}

export function LanguageSwitcher() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = LANGUAGE_COPY[locale];

  return (
    <details className="language-menu">
      <summary
        className="language-menu-trigger"
        aria-label={copy.selectLanguage}
        title={copy.selectLanguage}
      >
        <GlobeIcon />
        <span className="language-menu-current">
          {LOCALE_CONFIG[locale].nativeName}
        </span>
        <span aria-hidden="true" className="language-menu-chevron">
          ▾
        </span>
      </summary>
      <div className="language-menu-panel" role="menu">
        {LOCALES.map((targetLocale) => {
          const target = LOCALE_CONFIG[targetLocale];
          const isCurrent = targetLocale === locale;
          return (
            <Link
              aria-current={isCurrent ? "page" : undefined}
              aria-label={`${target.name}: ${target.nativeName}`}
              className={
                isCurrent
                  ? "language-option language-option-active"
                  : "language-option"
              }
              href={localizePath(pathname, targetLocale)}
              hrefLang={target.hrefLang}
              key={targetLocale}
              role="menuitem"
            >
              <span>{target.nativeName}</span>
              <span className="language-option-code">
                {targetLocale === "en" ? "EN" : target.hrefLang}
              </span>
            </Link>
          );
        })}
      </div>
    </details>
  );
}
