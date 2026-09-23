# Inbox Triage V0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a live, one-click sample email triage and a one-email custom trial as JevHub's second Real App, with 19 indexable English routes and local verification.

**Architecture:** A server-owned six-email fixture and one custom text input feed a fixed Choice/Noul/Score set over TypeSafe System One. Pure functions validate input and compose safe queues. A narrow API route owns the key, rate limit, timeout, and upstream errors. One shared page and copy map serve five locales.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, existing TypeSafe HTTP endpoint.

**Spec:** `docs/superpowers/specs/2026-09-23-inbox-triage-design.md`

## Global Constraints

- No database, authentication, Gmail connection, file upload, user API keys, message persistence, or generalized proxy.
- English `/apps/inbox-triage` is route 19; four non-English mirrors are `noindex,follow` and absent from the sitemap.
- Server owns samples, questions, criteria, model, and upstream URL; custom requests accept one 1–3,000 character plain-text message.
- Do not log or send user email text to analytics. The client must disclose TypeSafe processing before custom submission.
- Keep the existing five-locale structure and homepage information hierarchy. No `/apps` index or new marketplace.
- The local development server may run without a key, but a live run must return an honest unavailable message until `TYPESAFE_API_KEY` is set.

## Review Focus

- Blank or whitespace-only custom input must fail before calling TypeSafe.
- A user-supplied `model`, `questions`, or URL must never alter the fixed server request.
- A suspicious message must enter Review, never an automatic junk/deletion action.
- A malformed or partial upstream answer must produce a safe error, never a fabricated result.
- Email-like HTML or links must render as inert text in result cards.

---

### Task 1: Scope and clean baseline

**Files:** Modify `AGENTS.md`, `docs/V0.1_PRODUCT_SPEC.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/ACCEPTANCE_CRITERIA.md`, `docs/CONTENT_SPEC.md`, `tests/seo.test.ts`.

**Interfaces:** Documents establish the 19-route contract. The repaired SEO test checks the actual shared Idea Validator page component rather than requiring H1 markup in its route wrapper.

- [ ] **Step 1:** Amend scope docs with the approved second app, exact route and locale policy, fixed API boundary, privacy copy, and Phase 9 sequence after the existing Phase 8. Change all V0.1 English route counts to 19.
- [ ] **Step 2:** Change the stale Idea Validator SEO assertion to read `src/components/idea-validator/idea-validator-page.tsx` and assert its `<h1>{copy.title}</h1>` and limitation copy source. Add a route-count assertion for 19 after Task 4 adds the route.
- [ ] **Step 3:** Run `npm test -- tests/seo.test.ts` and verify the pre-existing failure is gone. Do not advance while unrelated failures remain.

### Task 2: Pure decision model

**Files:** Create `src/lib/inbox-triage.ts`, `src/content/inbox-demo.ts`, `tests/inbox-triage.test.ts`.

**Interfaces:** Export `INBOX_LIMITS`, `DEMO_EMAILS`, `validateInboxRequest(input)`, `buildInboxQuestions(emails)`, and `composeInboxResult(emails, upstream)`; return `{ mode, emails, summary }` with per-email `messageType`, `replyProbability`, `timeSensitivity`, `queue`, and Choice probabilities.

- [ ] **Step 1:** Write failing Vitest cases for exactly six distinct synthetic samples, whitespace and overlong custom text, forbidden extra fields, 18 fixed demo questions, per-email references to `emails[i]`, and all three queue decisions.
- [ ] **Step 2:** Run `npm test -- tests/inbox-triage.test.ts` and confirm the expected failures.
- [ ] **Step 3:** Implement the smallest typed validators, question map, upstream response checks, and queue composition. Use Choice options `conversation`, `account_update`, `newsletter`, `promotion`, `sales_outreach`, `suspected_junk`, `other`; a Noul for explicit reply request; a three-level Score for textual time pressure.
- [ ] **Step 4:** Run `npm test -- tests/inbox-triage.test.ts`. Add cases for a sales request that needs reply, a security update needing review, uncertain category, suspicious mail, and malformed upstream answers.

### Task 3: Bounded server route

**Files:** Create `src/app/api/inbox-triage/route.ts`, `tests/inbox-triage-route.test.ts`; modify `.env.example`.

**Interfaces:** `POST /api/inbox-triage` accepts `{ mode: "demo" }` or `{ mode: "custom", text: string }`. It returns composed results or `{ error, code? }`; every response has `Cache-Control: no-store`.

- [ ] **Step 1:** Write failing route tests for missing key, request size, invalid JSON, custom boundaries, fixed upstream URL/model/questions, no raw text in errors, upstream 429/5xx/timeout, malformed answer, and weighted rate limiting.
- [ ] **Step 2:** Run `npm test -- tests/inbox-triage-route.test.ts` and confirm failures.
- [ ] **Step 3:** Implement fixed server request with `TYPESAFE_API_KEY`, `jev-latest` or server env override, timeout, no-store, 15 runs and 30 emails per IP per hour in memory; demo costs six email units, custom costs one. Add `.env.example` controls.
- [ ] **Step 4:** Run route tests and the full `npm test` suite before proceeding.

### Task 4: App page, localization, and SEO

**Files:** Create `src/app/apps/inbox-triage/page.tsx`, `src/components/inbox-triage/inbox-triage-page.tsx`, `src/components/inbox-triage/inbox-triage.tsx`, `src/i18n/inbox-triage-copy.ts`; modify `src/lib/site.ts`, `src/i18n/intl-route.ts`, `src/components/internationalized-pages.tsx`, `src/components/chinese-pages.tsx`, `src/i18n/intl-content.ts`, `src/i18n/zh-content.ts`, `tests/i18n.test.ts`, `tests/seo.test.ts`, `tests/public-copy.test.ts`, `src/app/globals.css`.

**Interfaces:** One shared `InboxTriagePage({locale})` serves English and localized catch-all routes. The client calls only `/api/inbox-triage`. The page has a single H1, WebApplication and breadcrumb JSON-LD, and English self-canonical metadata.

- [ ] **Step 1:** Add failing route, metadata, sitemap, noindex, language-switch, and public-copy assertions. Add a static test that result cards render text, with no `dangerouslySetInnerHTML` or auto-linked email content.
- [ ] **Step 2:** Run targeted tests and confirm expected failures.
- [ ] **Step 3:** Implement localized copy in all five languages, shared page and client component, sample-first flow, loading/error/result states, custom privacy notice, queue cards, expandable typed signals, and mobile CSS.
- [ ] **Step 4:** Run targeted tests, typecheck, and lint. Inspect desktop and 375 px viewport locally before advancing.

### Task 5: Homepage, analytics, and release verification

**Files:** Modify `src/app/page.tsx`, `src/components/internationalized-pages.tsx`, `src/lib/analytics.ts`, `README.md`, and tests touching homepage and analytics.

**Interfaces:** Homepage offers two Real App cards. Analytics records only mode, locale, count, and success/failure event names; no raw email fields.

- [ ] **Step 1:** Add failing tests for both homepage links and content-free analytics event properties.
- [ ] **Step 2:** Implement the two-card section and localized links. Add `inbox_triage_view`, `inbox_triage_demo_submit`, `inbox_triage_demo_result`, `inbox_triage_custom_open`, `inbox_triage_custom_submit`, `inbox_triage_custom_result` events.
- [ ] **Step 3:** Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` in that order; fix failures and rerun the failing gate.
- [ ] **Step 4:** Start `npm run dev` locally, load homepage and Inbox Triage in a browser, inspect 375 px layout, and verify the no-key state. With a server key, verify one live sample and one custom request. Then prepare deployment on the user's chosen host.

### Task 6: Deploy after local verification

**Files:** Host configuration only if the selected platform needs it; no application scope expansion.

**Interfaces:** A preview URL for the user with `TYPESAFE_API_KEY` server-side, 19-page sitemap, and functioning sample/custom actions.

- [ ] **Step 1:** Confirm the deployment platform and server-side key are available without exposing the key in logs or browser output.
- [ ] **Step 2:** Configure the host's build and environment settings, deploy a preview, and inspect homepage, Inbox Triage, mobile navigation, robots, sitemap, and an API run.
- [ ] **Step 3:** Provide the preview URL and any remaining limitation to the user for review.
