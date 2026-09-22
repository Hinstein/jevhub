export const LOCALES = ["en", "zh", "ja", "fr", "pl"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_CONFIG = {
  en: {
    pathPrefix: "",
    htmlLang: "en",
    hrefLang: "en",
    name: "English",
    nativeName: "English",
  },
  zh: {
    pathPrefix: "/zh-CN",
    htmlLang: "zh-CN",
    hrefLang: "zh-CN",
    name: "Simplified Chinese",
    nativeName: "简体中文",
  },
  ja: {
    pathPrefix: "/ja-JP",
    htmlLang: "ja-JP",
    hrefLang: "ja-JP",
    name: "Japanese",
    nativeName: "日本語",
  },
  fr: {
    pathPrefix: "/fr-FR",
    htmlLang: "fr-FR",
    hrefLang: "fr-FR",
    name: "French",
    nativeName: "Français",
  },
  pl: {
    pathPrefix: "/pl-PL",
    htmlLang: "pl-PL",
    hrefLang: "pl-PL",
    name: "Polish",
    nativeName: "Polski",
  },
} as const satisfies Record<
  Locale,
  {
    pathPrefix: string;
    htmlLang: string;
    hrefLang: string;
    name: string;
    nativeName: string;
  }
>;

export const LANGUAGE_COPY = {
  en: {
    name: "English",
    menu: "Menu",
    primaryNav: "Primary navigation",
    languageLabel: "Language",
    selectLanguage: "Select language",
    footerNav: "Footer navigation",
    home: "Home",
    guide: "JevHub guide",
    lastChecked: "Last checked",
    website: "Website",
    store: "Store ↗",
  },
  zh: {
    name: "中文",
    menu: "菜单",
    primaryNav: "主导航",
    languageLabel: "语言",
    selectLanguage: "选择语言",
    footerNav: "页脚导航",
    home: "首页",
    guide: "JevHub 指南",
    lastChecked: "最近核验",
    website: "网站",
    store: "商店 ↗",
  },
  ja: {
    name: "日本語",
    menu: "メニュー",
    primaryNav: "メインナビゲーション",
    languageLabel: "言語",
    selectLanguage: "言語を選択",
    footerNav: "フッターナビゲーション",
    home: "ホーム",
    guide: "JevHub ガイド",
    lastChecked: "最終確認",
    website: "ウェブサイト",
    store: "Store ↗",
  },
  fr: {
    name: "Français",
    menu: "Menu",
    primaryNav: "Navigation principale",
    languageLabel: "Langue",
    selectLanguage: "Choisir une langue",
    footerNav: "Navigation du pied de page",
    home: "Accueil",
    guide: "Guide JevHub",
    lastChecked: "Vérifié le",
    website: "Site web",
    store: "Store ↗",
  },
  pl: {
    name: "Polski",
    menu: "Menu",
    primaryNav: "Nawigacja główna",
    languageLabel: "Język",
    selectLanguage: "Wybierz język",
    footerNav: "Nawigacja stopki",
    home: "Strona główna",
    guide: "Przewodnik JevHub",
    lastChecked: "Ostatnia weryfikacja",
    website: "Strona internetowa",
    store: "Store ↗",
  },
} as const satisfies Record<
  Locale,
  {
    name: string;
    menu: string;
    primaryNav: string;
    languageLabel: string;
    selectLanguage: string;
    footerNav: string;
    home: string;
    guide: string;
    lastChecked: string;
    website: string;
    store: string;
  }
>;

export const NAV_LABELS = {
  en: {
    "/apps/startup-idea-validator": "Idea Validator",
    "/playground": "Playground",
    "/what-is-jev": "Learn Jev",
    "/getting-started": "API",
    "/pricing": "Pricing",
    "/templates": "Examples",
    "/ecosystem": "Ecosystem",
  },
  zh: {
    "/apps/startup-idea-validator": "点子评分",
    "/playground": "Playground",
    "/what-is-jev": "了解 Jev",
    "/getting-started": "API",
    "/pricing": "定价",
    "/templates": "示例",
    "/ecosystem": "生态目录",
  },
  ja: {
    "/apps/startup-idea-validator": "Idea Validator",
    "/playground": "Playground",
    "/what-is-jev": "Jevとは",
    "/getting-started": "API",
    "/pricing": "料金",
    "/templates": "例",
    "/ecosystem": "エコシステム",
  },
  fr: {
    "/apps/startup-idea-validator": "Idea Validator",
    "/playground": "Playground",
    "/what-is-jev": "Découvrir Jev",
    "/getting-started": "API",
    "/pricing": "Tarifs",
    "/templates": "Exemples",
    "/ecosystem": "Écosystème",
  },
  pl: {
    "/apps/startup-idea-validator": "Idea Validator",
    "/playground": "Playground",
    "/what-is-jev": "Poznaj Jev",
    "/getting-started": "API",
    "/pricing": "Cennik",
    "/templates": "Przykłady",
    "/ecosystem": "Ekosystem",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export function getLocaleFromPathname(pathname: string): Locale {
  for (const locale of LOCALES) {
    const prefix = LOCALE_CONFIG[locale].pathPrefix;
    if (prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      return locale;
    }
  }
  return DEFAULT_LOCALE;
}

export function withoutLocale(pathname: string): string {
  for (const locale of LOCALES) {
    const prefix = LOCALE_CONFIG[locale].pathPrefix;
    if (!prefix) continue;
    if (pathname === prefix || pathname === `${prefix}/`) return "/";
    if (pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length) || "/";
    }
  }
  return pathname || "/";
}

export function localizePath(pathname: string, locale: Locale): string {
  const path = withoutLocale(pathname);
  const prefix = LOCALE_CONFIG[locale].pathPrefix;
  if (!prefix) return path;
  return path === "/" ? prefix : `${prefix}${path}`;
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
