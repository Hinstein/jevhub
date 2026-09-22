import { LOCALE_CONFIG } from "@/i18n/config";

export default function ChineseLocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div lang={LOCALE_CONFIG.zh.htmlLang}>{children}</div>;
}
