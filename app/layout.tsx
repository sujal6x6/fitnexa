import type { Metadata } from 'next';
import './globals.css';
import { SITE } from '@/lib/site';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic'; // settings come from D1 on every request, so admin edits show immediately
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings(); const o = s.seo;
  return { metadataBase: new URL(SITE.url), title: { default: o.title_default, template: o.title_template }, description: o.description, keywords: o.keywords || undefined,
    openGraph: { siteName: s.brand.name, type: 'website', images: o.og_image ? [o.og_image] : undefined }, twitter: { card: 'summary_large_image', site: o.twitter_handle || undefined },
    verification: o.google_verification ? { google: o.google_verification } : undefined };
}
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings(); const c = s.contact;
  const org = { '@context': 'https://schema.org', '@type': 'Organization', name: s.brand.name, legalName: s.brand.firm, url: SITE.url, logo: SITE.url + '/brand/logo.webp', sameAs: [c.instagram, c.facebook, c.youtube].filter(Boolean), telephone: c.phone_order, email: c.email || undefined, taxID: c.gstin };
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,700;1,800&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#0c0c0c" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
