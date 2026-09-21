# JevHub V0.1 SEO audit

Date: 2026-09-21

> Scope note (2026-09-21): the local code and CI define 17 indexable English
> routes, including the approved public `/playground`. Re-run the live
> production URL/Lighthouse checks for all 17 routes after deployment.

This audit keeps the V0.1 boundary: improve crawlability, page understanding,
sharing metadata, and Google verification without adding programmatic SEO pages
or a second content system.

## Primary references

- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [Google's developer SEO guide](https://developers.google.com/search/docs/fundamentals/get-started-developers)
- [Google canonicalization guidance](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google Breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Google favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search)

## Code and local contract audit

Verified for the 17 V0.1 indexable routes:

- unique `<title>`, meta description, and canonical URL;
- one visible H1 and at least two crawlable internal links per non-home page;
- reciprocal `en`, `zh-CN`, and `x-default` alternates for the English and
  localized route sets;
- absolute canonical URLs and absolute sitemap URLs on `https://jevhub.xyz`;
- `robots.txt` allows the content pages and references the sitemap;
- sitemap contains exactly the 17 approved routes, no `/go/store`, and no fabricated
  modification dates;
- `/go/store` remains crawlable but returns `X-Robots-Tag: noindex, nofollow`;
- Organization, WebSite, and content-page BreadcrumbList JSON-LD;
- Google verification file, HTTPS, favicon, and dynamic Open Graph image are
  publicly reachable.

Changes made in the SEO pass:

- every content page now declares the shared 1200x630 Open Graph image and uses
  `summary_large_image` for Twitter cards;
- Organization JSON-LD points to the crawlable 512x512 PNG at `/logo.png`;
- the Google-compatible multi-size `/favicon.ico` is the preferred site icon;
- the SEO contract tests cover share-image metadata and the raster Organization
  logo;
- the main entry pages use search-intent-specific titles and descriptions while
  keeping the approved 17-route V0.1 set explicit.
- the Templates, Getting Started, Pricing, and template-detail pages link to
  the approved Playground where that context is useful;
- template source links, ecosystem entries, and source-led comparison pages
  expose review/check dates instead of implying that claims are timeless;
- the Jev vs ChatGPT page links its benchmark caveat to TypeSafe's official
  launch post.

## Production verification to rerun after deployment

The previous live verification predates the approved public Playground. After
this change is deployed, rerun the production checks for all 17 routes:

- Lighthouse mobile checks for the home page, Playground, What is Jev, Cost
  Calculator, one Template detail page, and Ecosystem;
- all sitemap URLs return successful HTML responses with unique metadata and
  self-referential canonicals;
- `/robots.txt`, `/sitemap.xml`, `/api/playground`, the logo assets, OG image,
  and Google verification file return the expected responses;
- `/go/store` remains a 307 redirect with `X-Robots-Tag: noindex, nofollow`
  and stays out of the sitemap.

## Account-level work still required

Server code cannot prove actions inside a Google account. In Search Console:

1. verify the `https://jevhub.xyz` URL-prefix property using the deployed HTML
   verification file;
2. submit `https://jevhub.xyz/sitemap.xml`;
3. inspect the home page and representative guide, template, calculator, and
   ecosystem URLs, then request indexing where appropriate;
4. run the Rich Results Test and monitor Page indexing, Core Web Vitals,
   impressions, clicks, and queries after recrawl.

Google may take several days to recrawl and reflect a favicon or page changes;
Search Console requests are hints, not an indexing guarantee.
