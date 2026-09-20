# JevHub

JevHub is an independent Jev learning, tools, templates, and ecosystem site for **jevhub.xyz**.

> JevHub is not affiliated with or endorsed by TypeSafe AI. The commerce site **jevhub.store** is a separate project and is only linked through `/go/store`.

## V0.1 scope

The first release intentionally stays small:

- 16 indexable pages
- 5 core learning / SEO pages
- 1 local Jev cost calculator
- 1 template index + 8 practical template pages
- 1 curated ecosystem page with 20–30 checked projects
- 1 noindex redirect to `jevhub.store`
- no database
- no auth
- no payments
- no marketplace
- no online Jev API playground

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Vitest

V0.1 uses no runtime database and no Jev API key.

## Local development

```bash
npm install
npm run dev
```

Quality gate:

```bash
npm run check
```

That runs lint, typecheck, unit/content tests, and a production build.

## Optional analytics

Set either a GA4 measurement ID or a self-hosted Umami website:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://analytics.example.com/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id
NEXT_PUBLIC_UMAMI_DOMAINS=jevhub.xyz
```

The site emits page views and these custom events:

- `page_view`
- `calculator_used`
- `template_code_copied`
- `ecosystem_outbound_clicked`
- `store_click`

When both providers are configured, custom events are sent to both. Without a
provider configuration, analytics is a no-op.

## Content truth

Jev pricing is stored once in `src/data/jev-pricing.ts`. Any pricing update should change that file and its `lastVerifiedAt` together.

Official TypeSafe SDK behavior should be checked against:

- https://github.com/typesafe-ai/typesafe-sdk-js
- https://docs.typesafe.ai

Community examples are labeled as community sources and are not presented as official TypeSafe recommendations.

## Planning docs

Read these before changing V0.1 scope:

1. `docs/V0.1_PRODUCT_SPEC.md`
2. `docs/REFERENCE_PROJECTS.md`
3. `docs/CONTENT_SPEC.md`
4. `docs/IMPLEMENTATION_PLAN.md`
5. `docs/ACCEPTANCE_CRITERIA.md`
6. `AGENTS.md`

## Release rule

When the V0.1 acceptance gates pass, stop adding features. Deploy, connect Search Console/analytics, observe real queries and clicks, then decide V0.2 from data.
