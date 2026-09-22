"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getLocaleFromPathname,
  LANGUAGE_COPY,
  localizePath,
  NAV_LABELS,
} from "@/i18n/config";

export function Footer() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);

  const links = [
    {
      href: "/playground",
      label: NAV_LABELS[locale]["/playground"],
    },
    {
      href: "/what-is-jev",
      label: NAV_LABELS[locale]["/what-is-jev"],
    },
    {
      href: "/pricing",
      label: NAV_LABELS[locale]["/pricing"],
    },
    {
      href: "/ecosystem",
      label: NAV_LABELS[locale]["/ecosystem"],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-copy">
          <strong>JevHub</strong>
        </div>
        <nav
          className="footer-links"
          aria-label={LANGUAGE_COPY[locale].footerNav}
        >
          {links.map((item) => (
            <Link href={localizePath(item.href, locale)} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
