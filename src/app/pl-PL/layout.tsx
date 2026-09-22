import { LOCALE_CONFIG } from "@/i18n/config";

export default function PolishLocaleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div lang={LOCALE_CONFIG.pl.htmlLang}>{children}</div>;
}
