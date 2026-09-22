import { LOCALE_CONFIG } from "@/i18n/config";

export default function FrenchLocaleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div lang={LOCALE_CONFIG.fr.htmlLang}>{children}</div>;
}
