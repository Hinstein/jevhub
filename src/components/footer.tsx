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

  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <strong>JevHub</strong>
          <p>{disclaimer}</p>
        </div>
        <div>
          <Link href={localizePath("/what-is-jev", locale)}>
            {locale === "zh" ? "什么是 Jev？" : "What is Jev?"}
          </Link>
          {" · "}
          <Link href={localizePath("/pricing", locale)}>
            {locale === "zh" ? "定价" : "Pricing"}
          </Link>
          {" · "}
          <Link href={localizePath("/ecosystem", locale)}>
            {locale === "zh" ? "生态目录" : "Ecosystem"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
