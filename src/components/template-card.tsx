import Link from "next/link";
import { localizePath, type Locale } from "@/i18n/config";
import { localizedPrimitive } from "@/i18n/zh-content";
import type { JevTemplate } from "@/types/template";
import { localizedTemplate } from "@/i18n/zh-content";

export function TemplateCard({
  template,
  locale = "en",
}: {
  template: JevTemplate;
  locale?: Locale;
}) {
  const content = localizedTemplate(template, locale);

  return (
    <Link
      className="card card-link"
      href={localizePath(`/templates/${template.slug}`, locale)}
    >
      <div className="badges">
        {content.primitives.map((primitive) => (
          <span className="badge" key={primitive}>
            {localizedPrimitive(primitive, locale)}
          </span>
        ))}
      </div>
      <h3>{content.title}</h3>
      <p>{content.description}</p>
    </Link>
  );
}
