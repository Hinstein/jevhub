import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InboxTriagePage } from "@/components/inbox-triage/inbox-triage-page";
import { LOCALES } from "@/i18n/config";
import { INBOX_TRIAGE_COPY } from "@/i18n/inbox-triage-copy";
import { DEMO_EMAILS, DEMO_PREVIEW, getDemoEmails } from "@/content/inbox-demo";

describe("Inbox Triage public page", () => {
  it("keeps the keyless preview complete and free of fabricated Jev scores", () => {
    expect(DEMO_PREVIEW.map((item) => item.id).sort()).toEqual(DEMO_EMAILS.map((item) => item.id).sort());
    expect(new Set(DEMO_PREVIEW.map((item) => item.id)).size).toBe(DEMO_EMAILS.length);
    expect(new Set(DEMO_PREVIEW.map((item) => item.queue))).toEqual(new Set(["needs_reply", "review", "read_later"]));
    for (const item of DEMO_PREVIEW) {
      expect(item).not.toHaveProperty("confidence");
      expect(item).not.toHaveProperty("replyProbability");
    }
  });

  it.each(LOCALES)("renders one headline, six visible samples, and a custom entry in %s", (locale) => {
    const markup = renderToStaticMarkup(<InboxTriagePage locale={locale} />);
    const emails = getDemoEmails(locale);
    expect((markup.match(/<h1>/g) ?? []).length).toBe(1);
    for (const email of emails) expect(markup).toContain(email.subject.replaceAll("'", "&#x27;"));
    expect(markup).toContain(INBOX_TRIAGE_COPY[locale].customStep);
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
