export const LOCALES = ["en", "zh"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const ZH_PATH_PREFIX = "/zh-CN";

export const LANGUAGE_COPY = {
  en: {
    name: "English",
    switchTo: "中文",
    menu: "Menu",
    primaryNav: "Primary navigation",
    languageLabel: "Language",
  },
  zh: {
    name: "中文",
    switchTo: "English",
    menu: "菜单",
    primaryNav: "主导航",
    languageLabel: "语言",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export const NAV_LABELS = {
  en: {
    "/playground": "Playground",
    "/what-is-jev": "What is Jev",
    "/pricing": "Pricing",
    "/templates": "Templates",
    "/ecosystem": "Ecosystem",
  },
  zh: {
    "/playground": "Playground",
    "/what-is-jev": "什么是 Jev",
    "/pricing": "定价",
    "/templates": "模板",
    "/ecosystem": "生态目录",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname === ZH_PATH_PREFIX || pathname.startsWith(`${ZH_PATH_PREFIX}/`)
    ? "zh"
    : "en";
}

export function withoutLocale(pathname: string): string {
  if (pathname === ZH_PATH_PREFIX || pathname === `${ZH_PATH_PREFIX}/`) {
    return "/";
  }
  if (pathname.startsWith(`${ZH_PATH_PREFIX}/`)) {
    return pathname.slice(ZH_PATH_PREFIX.length) || "/";
  }
  return pathname || "/";
}

export function localizePath(pathname: string, locale: Locale): string {
  const path = withoutLocale(pathname);
  if (locale === "en") return path;
  return path === "/" ? ZH_PATH_PREFIX : `${ZH_PATH_PREFIX}${path}`;
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
