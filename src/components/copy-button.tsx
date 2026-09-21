"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { trackEvent } from "@/lib/analytics";

type Props = {
  text: string;
  templateSlug?: string;
  locale?: Locale;
};

export function CopyButton({ text, templateSlug, locale = "en" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (templateSlug) {
        trackEvent("template_code_copied", {
          template: templateSlug,
        });
      }
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      className="copy-button"
      type="button"
      onClick={copy}
      aria-label={locale === "zh" ? "复制代码" : "Copy code to clipboard"}
    >
      {copied ? (locale === "zh" ? "已复制" : "Copied") : locale === "zh" ? "复制" : "Copy"}
    </button>
  );
}
