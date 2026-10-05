import type { MetadataRoute } from 'next';
import { all } from '@/lib/db';
import { SITE } from '@/lib/site';
import { PAGES } from '@/lib/pages';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: { slug: string; updated_at: string }[] = [];
  try { products = await all('SELECT slug, updated_at FROM products WHERE is_active = 1'); } catch {}
  return [{ url: SITE.url }, { url: `${SITE.url}/shop` }, ...Object.keys(PAGES).map((s) => ({ url: `${SITE.url}/info/${s}` })), ...products.map((p) => ({ url: `${SITE.url}/product/${p.slug}`, lastModified: p.updated_at }))];
}
