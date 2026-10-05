import type { Metadata } from 'next';
import './globals.css';
import { SITE } from '@/lib/site';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic'; // settings come from D1 on every request, so admin edits show immediately
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings(); const o = s.seo;
  const image = o.og_image ? (String(o.og_image).startsWith('/') ? SITE.url + o.og_image : o.og_image) : undefined;
  return { metadataBase: new URL(SITE.url), title: { default: o.title_default, template: o.title_template }, description: o.description, keywords: o.keywords || undefined,
    alternates: { canonical: '/' }, robots: { index: true, follow: true },
    openGraph: { siteName: s.brand.name, type: 'website', locale: 'en_IN', url: SITE.url, title: o.title_default, description: o.description, images: image ? [{ url: image }] : undefined },
    twitter: { card: 'summary_large_image', site: o.twitter_handle || undefined, title: o.title_default, description: o.description, images: image ? [image] : undefined },
    verification: o.google_verification ? { google: o.google_verification } : undefined };
}
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings(); const c = s.contact;
  const ld = [
    { '@context': 'https://schema.org', '@type': ['Organization', 'Store'], name: s.brand.name, legalName: s.brand.firm, url: SITE.url, logo: SITE.url + '/brand/logo.webp', sameAs: [c.instagram, c.facebook, c.youtube].filter(Boolean), telephone: c.phone_order, email: c.email || undefined, taxID: c.gstin,
      address: { '@type': 'PostalAddress', streetAddress: c.address, addressLocality: s.seo.locality, addressRegion: s.seo.region, addressCountry: s.seo.country || 'IN' } },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: s.brand.name, url: SITE.url, potentialAction: { '@type': 'SearchAction', target: `${SITE.url}/shop?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
  ];
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,700;1,800&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#0c0c0c" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
