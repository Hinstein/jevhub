import { LOCALE_CONFIG } from "@/i18n/config";

export default function JapaneseLocaleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div lang={LOCALE_CONFIG.ja.htmlLang}>{children}</div>;
}
