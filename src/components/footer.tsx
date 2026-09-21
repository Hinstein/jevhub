"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLocaleFromPathname, localizePath } from "@/i18n/config";
import { SITE } from "@/lib/site";

export function Footer() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const disclaimer =
    locale === "zh"
      ? "独立社区资源，与 TypeSafe AI 无关联，也未获其认可。"
      : SITE.disclaimer;

  const links = [
    {
      href: "/playground",
      label: "Playground",
    },
    {
      href: "/what-is-jev",
      label: locale === "zh" ? "什么是 Jev？" : "What is Jev?",
    },
    {
      href: "/pricing",
      label: locale === "zh" ? "定价" : "Pricing",
    },
    {
      href: "/ecosystem",
      label: locale === "zh" ? "生态目录" : "Ecosystem",
    },
  ];

  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-copy">
          <strong>JevHub</strong>
          <p>{disclaimer}</p>
        </div>
        <nav
          className="footer-links"
          aria-label={locale === "zh" ? "页脚导航" : "Footer navigation"}
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
