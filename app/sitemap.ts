import type { MetadataRoute } from 'next';
import { all } from '@/lib/db';
import { SITE } from '@/lib/site';
import { PAGES } from '@/lib/pages';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: { slug: string; updated_at: string }[] = [];
  let categories: { slug: string }[] = [];
  try { products = await all('SELECT slug, updated_at FROM products WHERE is_active = 1'); } catch {}
  try { categories = await all('SELECT slug FROM categories WHERE is_active = 1 ORDER BY position'); } catch {}
  return [
    { url: SITE.url, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE.url}/shop`, changeFrequency: 'daily', priority: 0.9 },
    ...categories.map((c) => ({ url: `${SITE.url}/shop?category=${c.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...Object.keys(PAGES).map((s) => ({ url: `${SITE.url}/info/${s}`, changeFrequency: 'monthly' as const, priority: ['about', 'contact', 'delivery'].includes(s) ? 0.7 : 0.45 })),
    ...products.map((p) => ({ url: `${SITE.url}/product/${p.slug}`, lastModified: p.updated_at, changeFrequency: 'weekly' as const, priority: 0.85 })),
  ];
}
