import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/checkout', '/account', '/orders', '/payment', '/cart'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/admin', '/api', '/checkout', '/account', '/orders', '/payment', '/cart'] },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
