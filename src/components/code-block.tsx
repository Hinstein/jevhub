import { CopyButton } from "@/components/copy-button";
import type { Locale } from "@/i18n/config";

type Props = {
  code: string;
  templateSlug?: string;
  locale?: Locale;
};

export function CodeBlock({ code, templateSlug, locale = "en" }: Props) {
  return (
    <div className="code-wrap">
      <CopyButton text={code} templateSlug={templateSlug} locale={locale} />
      <pre className="code-block">
        <code>{code}</code>
      </pre>
    </div>
  );
}
