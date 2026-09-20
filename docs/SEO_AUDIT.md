# JevHub V0.1 SEO audit

Date: 2026-09-21

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

## Code and production audit

Verified for the 16 V0.1 indexable routes:

- unique `<title>`, meta description, and canonical URL;
- one visible H1 and at least two crawlable internal links per non-home page;
- absolute canonical URLs and absolute sitemap URLs on `https://jevhub.xyz`;
- `robots.txt` allows the content pages and references the sitemap;
- sitemap contains exactly the 16 approved routes, no `/go/store`, and no fabricated
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
  keeping the V0.1 route count unchanged.

## Latest production verification

Verified against `https://jevhub.xyz` after the logo and metadata release:

- Lighthouse mobile checks for the home page, What is Jev, Cost Calculator,
  one Template detail page, and Ecosystem: SEO, performance, accessibility,
  and best-practices categories all passed;
- all 16 sitemap URLs returned successful HTML responses with one H1, a unique
  title, a unique description, a self-referential canonical, and crawlable
  internal links;
- `/robots.txt`, `/sitemap.xml`, `/favicon.ico`, `/logo.png`, the OG image, and
  the Google verification file returned 200;
- `/go/store` remained a 307 redirect with `X-Robots-Tag: noindex, nofollow`
  and stayed out of the sitemap.

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
