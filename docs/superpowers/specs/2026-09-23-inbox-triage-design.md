# Inbox Triage V0 design

## Intent and scope

JevHub should let a first-time visitor see a real, bounded Jev decision without an account or Gmail access, then optionally try one email they are allowed to share. The experiment measures whether visitors move from a synthetic demo to their own text. This is JevHub's second Real App after Startup Idea Validator, not an email client.

The English `/apps/inbox-triage` page is the nineteenth indexable page. The existing five locale system also serves `/zh-CN`, `/ja-JP`, `/fr-FR`, and `/pl-PL` mirrors; non-English pages are `noindex,follow` and omitted from the sitemap. No `/apps` index or navigation restructure is added in this release. The homepage presents both apps and links to each.

## First-visit flow

The first screen shows six clearly synthetic email previews and one primary action, **Sort sample inbox**. The samples are visible immediately; there is no separate load step. Pressing the button calls the real Jev service. A pending state shows honest progress without pretending that a completed batch is being streamed. Results appear on the same page as three action queues: **Needs reply**, **Review**, and **Read later**. Each card shows its original sender/subject, message type, and textual time sensitivity. Expanded details show the selected Choice and its top probabilities, the Noul reply probability, and the Score. The page does not fabricate an explanation Jev did not return.

After the sample result, **Try one of your emails** opens one text area. The visitor may paste a sender, subject, and body together; the text is sent as-is, so no fragile email parser or multi-field form is required. The user may submit one email at a time, then try another. No uploads, attachments, Gmail OAuth, mailbox synchronization, automatic labels, deletion, or reply drafting. The page warns before custom submission that JevHub does not persist the text and sends it to TypeSafe; the visitor should omit sensitive or unshareable material.

## Decision model

Each email receives three fixed questions: `message_type` (Choice), `reply_requested` (Noul), and `time_sensitivity` (Score). Type options are conversation, account update, newsletter, promotion, sales outreach, suspected junk, and other. The reply question asks whether the visible text requests a direct response; it does not infer the recipient's relationship to the sender or thread history. The Score describes explicit time pressure in three ordered levels. The questions only rely on supplied text. JevHub code turns the typed outputs into queues and keeps uncertain or suspicious cases in **Review**; it never takes an email action.

For the six sample messages, the server owns the synthetic inputs. For custom submissions, the server accepts one plain-text message at a time, at most 3,000 characters. Request bodies over 16 KB are rejected. The client never supplies model, questions, criteria, upstream URL, or API key. The server calls TypeSafe `/v1/systemone` using `TYPESAFE_API_KEY`, `jev-latest` by default, a timeout, and `no-store` responses. One request with a structured `emails` state and three per-item questions is the initial implementation; integration checks must confirm the real model accepts and correctly isolates six items. A failed batch is reported as a failed batch, never as made-up results.

## Safety and privacy

Only plain text is accepted and rendered as text. Links and HTML in submitted messages are never made active. There is no database, server log of text, localStorage history, or analytics property containing sender, subject, body, or inferred category for custom messages. Analytics only records page view, sample submit/result, custom mode open, custom submit/result, and item count. Response headers disable caching. Basic server-side rate limits count both runs and submitted messages; CDN/WAF protection is required for a public deployment because in-memory limits are per instance.

The copy says, “JevHub does not save your email text. Your submission is sent to TypeSafe for processing. Do not paste sensitive content or messages you are not allowed to share.” It links to TypeSafe's privacy policy. It does not promise zero retention or perfect classification.

## SEO and site position

English title: **AI Email Triage Demo: Sort Messages by Action with Jev | JevHub**. Description: **Try a live Jev email triage demo with six sample messages, then paste one email to see suggested reply, review, and read-later queues. No Gmail connection or signup.** Canonical is `https://jevhub.xyz/apps/inbox-triage`. The page has one H1, an honest explanation of the no-Gmail scope, structured `WebApplication` and breadcrumb data, and a path to Playground and the support-routing template. It does not claim the Jevmail author's performance or price as a JevHub result. The site's independent-resource disclaimer remains visible.

## Verification and release

Tests cover sample fixture integrity, input boundaries, fixed server questions, response parsing, queue composition including uncertain and suspicious mail, rate limiting, key isolation, upstream errors, localized routes, metadata, canonical, sitemap count 19, and noindex mirrors. Run lint, typecheck, tests, build, then a local server smoke test at desktop and 375 px mobile width. The live Jev path requires a server-side key; without it, the UI must display a clear unavailable state. Deploy only after the local checks pass and the deployment target and key are configured.

## Sources

- TypeSafe state and question types: https://docs.typesafe.ai/concepts/state and https://docs.typesafe.ai/primitives
- TypeSafe API and response shape: https://docs.typesafe.ai/api
- TypeSafe privacy policy: https://typesafe.ai/legal/privacy-policy
- Interaction reference only: https://github.com/fazlerocks/jevmail and https://github.com/fazlerocks/jevmail/blob/main/src/lib/classify.ts
