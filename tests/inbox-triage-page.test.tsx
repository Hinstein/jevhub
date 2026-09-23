import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InboxTriagePage } from "@/components/inbox-triage/inbox-triage-page";
import { LOCALES } from "@/i18n/config";
import { DEMO_EMAILS } from "@/content/inbox-demo";

describe("Inbox Triage public page", () => {
  it.each(LOCALES)("renders one headline, six visible samples, and a custom entry in %s", (locale) => {
    const markup = renderToStaticMarkup(<InboxTriagePage locale={locale} />);
    expect((markup.match(/<h1>/g) ?? []).length).toBe(1);
    for (const email of DEMO_EMAILS) expect(markup).toContain(email.subject.replaceAll("'", "&#x27;"));
    expect(markup).toContain("02 / YOUR EMAIL");
    expect(markup).toContain("WebApplication");
    expect(markup).toContain("/templates/support-routing");
  });

  it("renders email content as inert text and exposes privacy before custom submission", () => {
    const source = readFileSync(resolve(process.cwd(), "src/components/inbox-triage/inbox-triage.tsx"), "utf8");
    expect(source).not.toContain("dangerouslySetInnerHTML");
    expect(source).not.toContain("localStorage");
    expect(source).toContain("{sample.body}");
    expect(source).toContain("{copy.privacy}");
    expect(source).toContain('href="https://typesafe.ai/privacy"');
  });
});
