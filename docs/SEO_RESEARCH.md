# JevHub Google SEO research

Date: 2026-09-21

Scope: executable actions for the deployed JevHub V0.1 site, based only on
Google Search Central, Google Search Console help, Lighthouse/Chrome official
documentation, and Schema.org. This document does not change application code.

## Executive conclusion

JevHub's existing audit shows that the main technical foundation is already in
place: 16 approved indexable routes, unique metadata and canonicals, crawlable
internal links, HTTPS, robots.txt, sitemap.xml, the `/go/store` noindex
boundary, favicon/logo, Open Graph image, and Organization/WebSite/
BreadcrumbList markup. See [docs/SEO_AUDIT.md](./SEO_AUDIT.md).

The highest-priority remaining work is account-level Google Search Console
work and then measurement-driven iteration. Google explicitly says that
meeting technical requirements and best practices does not guarantee crawling,
indexing, or serving in results, and that a sitemap is a discovery hint rather
than a ranking or indexing guarantee.

Sources: [Google Search Essentials](https://developers.google.com/search/docs/essentials),
[How Google Search works](https://developers.google.com/search/docs/fundamentals/how-search-works),
[Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
[Google crawling and indexing FAQ](https://developers.google.com/search/help/crawling-index-faq).

## Priority plan

Priority labels:

- **P0 — do immediately:** required to establish Google ownership, discovery,
  and a trustworthy baseline.
- **P1 — do next:** materially improves eligibility, usability, or the ability
  to diagnose search performance.
- **P2 — maintain and iterate:** useful after baseline data exists; not a reason
  to add speculative V0.2 features or pages.

## P0 — Search Console account actions

These actions cannot be completed or proven by repository code or the server
alone.

### 1. Add and verify the correct Search Console property

Recommended account setup:

1. Add the **Domain property** `jevhub.xyz` if DNS access is available. It
   covers HTTP/HTTPS and subdomains and is verified through DNS.
2. Keep or add the **URL-prefix property** `https://jevhub.xyz/` as a focused
   view. The deployed Google HTML verification file supports this property
   type, not a Domain property.
3. Confirm that `https://jevhub.xyz/` is the intended canonical host and that
   any alternate host/protocol is redirected or otherwise consistently treated.

Source: [Add a website or platform property to Search Console](https://support.google.com/webmasters/answer/34592).

### 2. Submit the production sitemap

In the verified property, submit:

`https://jevhub.xyz/sitemap.xml`

Check the Sitemaps report for the last download time, processing status, and
errors. The deployed sitemap should contain exactly the 16 approved indexable
routes and should not contain `/go/store`.

The existing `robots.txt` sitemap directive is also useful for discovery, but
Search Console submission is needed for account-level status and error
visibility. Submission is a hint; it does not guarantee crawling, indexing, or
ranking.

Source: [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

### 3. Inspect representative URLs and request crawling

Use URL Inspection on at least:

- `/`
- `/getting-started`
- `/pricing`
- `/tools/jev-cost-calculator`
- `/templates`
- one `/templates/<slug>` detail page
- `/ecosystem`

For each, check the live test and indexed result for crawl permission,
indexing eligibility, selected canonical, rendered HTML, and loaded resources.
Request indexing for the home page and important representative pages after
the first deployment; request indexing again only after substantive changes.
Use the sitemap for the full set of routes rather than trying to submit every
URL repeatedly.

Google states that URL Inspection requests require owner or full-user access,
have quotas, and do not guarantee immediate or eventual inclusion. Crawling can
take days to weeks.

Source: [Ask Google to recrawl your URLs](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl),
[SEO guide for web developers](https://developers.google.com/search/docs/fundamentals/get-started-developers).

## P0 — code/server verification to keep in every release

The current audit reports these as complete. They should be rechecked after
each deployment, but no new implementation is justified by the official
guidance at this point.

### 4. Preserve crawlability and indexing boundaries

- The 16 intended pages must return successful HTML responses and remain
  reachable without login.
- `robots.txt` must not block the intended pages or the resources needed to
  render them.
- `/go/store` must remain crawlable enough for Google to see its
  `X-Robots-Tag: noindex, nofollow`, while remaining outside the sitemap.
- Do not use `robots.txt` as a substitute for `noindex`; Google can still know
  or index a blocked URL without being able to read its content.
- Do not add query, filter, pagination, or empty category URLs to the indexable
  set.

Sources: [SEO guide for web developers](https://developers.google.com/search/docs/fundamentals/get-started-developers),
[Meta tags and attributes Google supports](https://developers.google.com/search/docs/crawling-indexing/special-tags),
[Specify a canonical with `rel=canonical` and other methods](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

### 5. Keep one consistent canonical URL per indexable page

Every indexable page should keep a self-referential canonical in the HTML
source, use the same preferred absolute URL in the sitemap and internal links,
and be served consistently over HTTPS. Redirect duplicate host/protocol URLs to
the preferred host where applicable. Canonical declarations are hints, so
Google may select a different canonical if content or signals conflict.

Source: [Canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization),
[Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

### 6. Keep titles, descriptions, headings, visible text, and links useful

For each of the 16 pages, keep the current uniqueness contract and review the
actual wording against user intent:

- one clear, accurate page title;
- a useful H1 and visible page text that explain the page without requiring
  client-side interaction;
- a concise description that accurately summarizes the page, while recognizing
  that Google may generate a different snippet;
- descriptive, crawlable `<a href="...">` internal links with relevant anchor
  text;
- no keyword stuffing or claims that are not supported by the official Jev
  sources required by the project constraints.

This is the main content-side ranking opportunity. It is not achieved merely by
adding more metadata or repeating keywords.

Sources: [Google Search Essentials](https://developers.google.com/search/docs/essentials),
[SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide),
[SEO link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable),
[Meta tags and attributes Google supports](https://developers.google.com/search/docs/crawling-indexing/special-tags).

## P1 — performance, mobile, and rendered-page checks

### 7. Run Lighthouse/PageSpeed checks on representative routes

Run the official Lighthouse SEO, performance, accessibility, and best-practice
audits on the home page plus representative guide, calculator, template, and
ecosystem pages, in mobile and desktop modes. Fix failures that affect
crawlability, mobile usability, loading, layout stability, or interaction
responsiveness without expanding V0.1 scope.

Lighthouse is a diagnostic tool, not a ranking guarantee. Its SEO audit should
be supplemented by URL Inspection because Lighthouse cannot prove what Google
has indexed.

Sources: [Lighthouse](https://developer.chrome.com/docs/lighthouse),
[Lighthouse: Optimize website speed](https://developer.chrome.com/docs/devtools/lighthouse/),
[Lighthouse: page blocked from indexing](https://developer.chrome.com/docs/lighthouse/seo/is-crawlable).

### 8. Monitor Core Web Vitals in Search Console and real-user data

Use Search Console's Core Web Vitals report after enough real traffic exists.
The current Google guidance identifies these targets for a good experience:

- LCP: 2.5 seconds or less;
- INP: less than 200 ms;
- CLS: less than 0.1.

Treat these as user-experience targets, not a promise of higher rankings. Fix
systemic problems first, especially mobile layout shifts, slow first content,
and calculator/navigation interactions.

Source: [Understanding Core Web Vitals and Google Search results](https://developers.google.com/search/docs/appearance/core-web-vitals).

### 9. Verify what Google can render and discover

The site uses Next.js, so release checks should confirm that important content,
links, metadata, and JSON-LD are present in the server-rendered or rendered
HTML Google can inspect. Links intended for discovery should be ordinary anchor
elements with `href`; content must not exist only behind an unsupported or
fragile client-side interaction.

Sources: [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics),
[Fix search-related JavaScript problems](https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript),
[SEO guide for web developers](https://developers.google.com/search/docs/fundamentals/get-started-developers).

## P1 — structured data and brand surfaces

### 10. Validate existing Organization, WebSite, and BreadcrumbList markup

The current implementation is directionally correct for this site. Validate it
with Google's Rich Results Test and then inspect representative live URLs in
Search Console. Keep markup representative of visible content and do not add
types merely to increase the number of schemas.

- `Organization` on the home page can help Google understand and disambiguate
  the independent JevHub organization; the crawlable logo is a valid useful
  property when it represents the organization.
- `BreadcrumbList` is appropriate for content hierarchy, including the
  Template path, when the trail represents a normal user path and has at least
  two list items.
- `WebSite` remains supported for site-name understanding. Do not add or
  maintain the retired sitelinks search-box feature as if it were an available
  rich result.
- Do not add `Article` markup to every static guide automatically unless the
  page genuinely represents an article and the markup matches the visible
  content. Google's Article feature is for news, sports, or blog articles; the
  V0.1 pages are primarily guides, tools, templates, and a directory.

Google can issue a structured-data manual action when markup is misleading, and
valid markup still does not guarantee a rich result.

Sources: [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization),
[Breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb),
[Structured data feature gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery),
[General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies),
[Schema.org Organization](https://schema.org/Organization),
[Schema.org WebSite](https://schema.org/WebSite),
[Schema.org BreadcrumbList](https://schema.org/BreadcrumbList),
[Schema.org Article](https://schema.org/Article).

### 11. Keep favicon and logo eligible, stable, and crawlable

The current audit reports `/favicon.ico` and `/logo.png` as publicly reachable.
Keep one stable, representative, square favicon linked from the home page;
Google recommends a favicon larger than 48x48 pixels even though its minimum is
8x8. Google may take days or weeks to recrawl it, and display is not guaranteed.
Keep the Organization logo URL crawlable and indexable, and do not use the
generic logo as the page's content image or pretend that an Open Graph image is
a ranking signal.

Sources: [Define a favicon for Search results](https://developers.google.com/search/docs/appearance/favicon-in-search),
[Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization),
[Image SEO best practices](https://developers.google.com/search/docs/appearance/google-images).

## P1 — content and trust quality

### 12. Strengthen the existing 16 pages using real query intent

After Search Console begins collecting queries, review each page's impressions,
queries, CTR, and clicks. Improve the page whose observed queries do not match
its title, H1, description, or body. Prioritize genuinely useful explanations,
examples, limitations, source links, and clear navigation over producing more
URLs.

For JevHub specifically, preserve the project rules: factual Jev pricing/API
claims must be checked against TypeSafe's official sources; community examples
must be labeled as such; and the independent-site disclaimer must remain
prominent. Do not create programmatic SEO pages, thin variants, fake benchmarks,
or unsupported comparisons.

Source: [Google Search Essentials](https://developers.google.com/search/docs/essentials),
[SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide),
[Search Console performance reports](https://support.google.com/webmasters/answer/10268906).

## P2 — ongoing Search Console monitoring

Once the property is verified and data exists, check at least monthly and after
deployments:

- **Page indexing:** indexed versus excluded URLs and the reason for every
  unexpected exclusion;
- **Performance:** queries, pages, impressions, clicks, CTR, and trends;
- **Core Web Vitals:** mobile and desktop status;
- **Enhancements / structured data:** invalid items and changes in valid items;
- **Manual actions and Security Issues:** confirm there are no actions or
  compromises;
- **robots.txt and crawl stats:** confirm Google can fetch the site and its
  important resources.

Use trends in impressions and clicks as the primary success signal, not a single
average-position number. Search Console data begins accumulating after the
property is added and may take time to become useful.

Sources: [Search Console overview](https://support.google.com/webmasters/answer/7451491),
[Page indexing report](https://support.google.com/webmasters/answer/7440203),
[Search performance reports](https://support.google.com/webmasters/answer/10268906),
[Search Console property settings](https://support.google.com/webmasters/answer/7687465),
[Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals).

## Responsibility matrix

| Action | Code/repository | Server/deployment | Search Console account |
|---|---:|---:|---:|
| Unique titles, descriptions, H1, canonical | Yes | Verify live output | Inspect result |
| 16-route sitemap and `/go/store` exclusion | Yes | Serve and keep 200 | Submit and monitor |
| robots/noindex boundaries | Yes | Preserve headers and access | Test live URL |
| HTTPS, host redirects, 200/404/5xx, public assets | No/partly | Yes | Inspect crawl status |
| Organization/WebSite/Breadcrumb JSON-LD | Yes | Serve rendered HTML | Rich Results Test + URL Inspection |
| Favicon/logo/OG assets | Yes | Serve stable URLs | Wait for recrawl and inspect |
| Lighthouse and mobile/CWV fixes | Usually | Measure production | Monitor real-user report |
| Property verification | No | Provide file or DNS record | **Required** |
| Sitemap submission | No | Publish sitemap | **Required** |
| Request indexing | No | No server substitute | **Required** |
| Query/CTR/indexing/Manual Actions monitoring | No | Logs can supplement | **Required** |

## Definition of done for the next SEO gate

The next gate should be considered complete only when all of the following have
direct evidence:

1. Domain or URL-prefix property is verified in the owner's Search Console.
2. `https://jevhub.xyz/sitemap.xml` is submitted and has no processing error.
3. Live URL Inspection passes for the home page and representative page types;
   Google-selected canonicals are reviewed.
4. The 16 intended URLs are submitted through the sitemap and the indexing
   report has been reviewed for unexpected exclusions.
5. Structured data is validated for representative pages, with no unresolved
   critical errors or manual action.
6. Lighthouse/mobile checks have been run and any material crawlability or
   usability failures are either fixed or documented.
7. After recrawl, Search Console performance and Core Web Vitals are monitored
   for a meaningful period before judging SEO success.

None of these steps can honestly promise a particular Google ranking or an
instant indexing date; Google's own documentation says those outcomes are not
guaranteed.

