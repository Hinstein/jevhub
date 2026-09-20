"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

type Props = {
  text: string;
  templateSlug?: string;
};

export function CopyButton({ text, templateSlug }: Props) {
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
      aria-label="Copy code to clipboard"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
