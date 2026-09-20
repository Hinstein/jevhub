import type { Metadata } from "next";
import Script from "next/script";
import "@/app/globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnalyticsRouteTracker } from "@/components/analytics";
import { SiteStructuredData } from "@/components/structured-data";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "JevHub: Jev Guides, Templates, Calculator, and Ecosystem",
    template: "%s | JevHub",
  },
  description: SITE.description,
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  alternates: {
    canonical: SITE.url,
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
    title: "JevHub: Jev Guides, Templates, Calculator, and Ecosystem",
    description: SITE.description,
    images: [
      {
        url: new URL(SITE.socialImagePath, SITE.url).toString(),
        width: 1200,
        height: 630,
        alt: "JevHub: Jev guides, templates, calculator, and ecosystem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JevHub: Jev Guides, Templates, Calculator, and Ecosystem",
    description: SITE.description,
    images: [new URL(SITE.socialImagePath, SITE.url).toString()],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiDomains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS;

  return (
    <html lang="en">
      <body>
        <SiteStructuredData />
        {umamiScriptUrl && umamiWebsiteId ? (
          <Script
            src={umamiScriptUrl}
            data-website-id={umamiWebsiteId}
            {...(umamiDomains ? { "data-domains": umamiDomains } : {})}
            strategy="afterInteractive"
          />
        ) : null}
        {gaId ? (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${gaId}', { send_page_view: false });
              `}
            </Script>
            <AnalyticsRouteTracker />
          </>
        ) : null}
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
