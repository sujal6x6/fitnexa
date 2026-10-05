import { all, first, inList, parseJson } from './db';
export type Product = {
  id: string; sku: string; slug: string; name: string; price_paise: number; compare_price_paise: number | null;
  short_description: string | null; description: string | null; features: string[]; specifications: Record<string, string>;
  warranty: string | null; stock: number; is_featured: boolean; is_active: boolean; seo_title: string | null; seo_description: string | null;
  category: { name: string; slug: string } | null; images: { url: string; alt: string | null; position: number }[];
};
export type Category = { id: string; name: string; slug: string; description: string | null; image_url: string | null };
const BASE = 'SELECT p.*, c.name AS cat_name, c.slug AS cat_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id';

async function hydrate(rows: any[]): Promise<Product[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const imgs = await all<any>(`SELECT product_id, url, alt, position FROM product_images WHERE product_id IN (${inList(ids.length)}) ORDER BY position`, ...ids);
  return rows.map(({ cat_name, cat_slug, ...r }) => ({ ...r, features: parseJson(r.features, []), specifications: parseJson(r.specifications, {}),
    is_featured: !!r.is_featured, is_active: !!r.is_active, category: cat_name ? { name: cat_name, slug: cat_slug } : null,
    images: imgs.filter((i) => i.product_id === r.id).map(({ url, alt, position }) => ({ url, alt, position })) }));
}
export const getCategories = (): Promise<Category[]> => all('SELECT id, name, slug, description, image_url FROM categories WHERE is_active = 1 ORDER BY position');

export async function getProducts(o: { q?: string; category?: string; sort?: string; max?: number; featured?: boolean; limit?: number; exclude?: string } = {}) {
  const where = ['p.is_active = 1']; const params: unknown[] = [];
  if (o.category) { where.push('c.slug = ?'); params.push(o.category); }
  if (o.q) { const like = '%' + o.q.replace(/[\\%_]/g, (m) => '\\' + m) + '%'; where.push("(p.name LIKE ? ESCAPE '\\' OR p.sku LIKE ? ESCAPE '\\')"); params.push(like, like); }
  if (o.max) { where.push('p.price_paise <= ?'); params.push(o.max * 100); }
  if (o.featured) where.push('p.is_featured = 1');
  if (o.exclude) { where.push('p.id <> ?'); params.push(o.exclude); }
  const order = o.sort === 'price_desc' ? 'p.price_paise DESC' : o.sort === 'price_asc' ? 'p.price_paise ASC' : 'p.created_at ASC, p.rowid ASC';
  let sql = `${BASE} WHERE ${where.join(' AND ')} ORDER BY ${order}`;
  if (o.limit) { sql += ' LIMIT ?'; params.push(o.limit); }
  return hydrate(await all(sql, ...params));
}
export async function getProductBySlug(slug: string) {
  const r = await first(`${BASE} WHERE p.slug = ? AND p.is_active = 1`, slug);
  return r ? (await hydrate([r]))[0] : null;
}
