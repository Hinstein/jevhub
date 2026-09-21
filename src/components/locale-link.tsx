import Link, { type LinkProps } from "next/link";
import type { ComponentProps } from "react";
import { localizePath, type Locale } from "@/i18n/config";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  locale?: Locale;
};

export function LocaleLink({ href, locale = "en", ...props }: Props) {
  return <Link {...(props as LinkProps)} href={localizePath(href, locale)} />;
}
