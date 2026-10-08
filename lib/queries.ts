import { all, batch, first, inList, parseJson } from './db';
export type Product = {
  id: string; sku: string; slug: string; name: string; price_paise: number; compare_price_paise: number | null;
  short_description: string | null; description: string | null; features: string[]; specifications: Record<string, string>;
  warranty: string | null; stock: number; is_featured: boolean; is_active: boolean; seo_title: string | null; seo_description: string | null;
  category: { name: string; slug: string } | null; images: { url: string; alt: string | null; position: number }[];
};
export type Category = { id: string; name: string; slug: string; description: string | null; image_url: string | null };
const BASE = 'SELECT p.*, c.name AS cat_name, c.slug AS cat_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id';
const TREADMILL_COVER = '/products/treadmill-category-cover.png';

async function ensureTreadmillProducts() {
  await batch([
    ['INSERT INTO categories (name, slug, description, image_url, position, is_active) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET name = excluded.name, description = excluded.description, image_url = excluded.image_url, position = excluded.position, is_active = excluded.is_active',
      ['Treadmills', 'treadmills', 'Manual treadmills and compact cardio machines for home workouts.', TREADMILL_COVER, 5, 1]],
    ['INSERT INTO products (sku, slug, name, category_id, price_paise, short_description, description, features, specifications, stock, is_featured, is_active, seo_title, seo_description) VALUES (?, ?, ?, (SELECT id FROM categories WHERE slug = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(sku) DO UPDATE SET slug = excluded.slug, name = excluded.name, category_id = excluded.category_id, short_description = excluded.short_description, description = excluded.description, features = excluded.features, specifications = excluded.specifications, stock = excluded.stock, is_active = excluded.is_active, seo_title = excluded.seo_title, seo_description = excluded.seo_description, updated_at = strftime(\'%Y-%m-%dT%H:%M:%fZ\',\'now\')',
      ['FN-001', 'fitnexa-fn-001-manual-treadmill', 'FITNEXA FN-001 Manual Treadmill', 'treadmills', 0, 'Simple, durable manual treadmill for compact home workouts.', 'The FITNEXA FN-001 is a simple, durable, and space-saving manual treadmill designed for home workouts. It operates without electricity and features an LCD display to track daily workout performance.', '["Manual running treadmill","Running surface: 1000 x 340 mm","Maximum user weight: 100 KG (tested)","Product weight: 31 KG","Heavy-duty steel frame","LCD display: Speed, Distance, Time, Scan and Calories","Foldable and space-saving design","Ideal for home use"]', '{"Type":"Manual Treadmill","Running Surface":"1000 x 340 mm","Maximum User Weight":"100 KG (Tested)","Product Weight":"31 KG","Frame":"Heavy-Duty Steel Frame","Display":"Speed, Distance, Time, Scan and Calories","Usage":"Home Use"}', 10, 0, 1, 'FITNEXA FN-001 Manual Treadmill', 'Simple, durable and foldable manual treadmill for home workouts with LCD display.']],
    ['INSERT INTO products (sku, slug, name, category_id, price_paise, short_description, description, features, specifications, stock, is_featured, is_active, seo_title, seo_description) VALUES (?, ?, ?, (SELECT id FROM categories WHERE slug = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(sku) DO UPDATE SET slug = excluded.slug, name = excluded.name, category_id = excluded.category_id, short_description = excluded.short_description, description = excluded.description, features = excluded.features, specifications = excluded.specifications, stock = excluded.stock, is_active = excluded.is_active, seo_title = excluded.seo_title, seo_description = excluded.seo_description, updated_at = strftime(\'%Y-%m-%dT%H:%M:%fZ\',\'now\')',
      ['FN-002', 'fitnexa-fn-002-3-in-1-manual-treadmill', 'FITNEXA FN-002 3 in 1 Manual Treadmill', 'treadmills', 0, '3 in 1 treadmill with twister and push-up stand for home fitness.', 'The FITNEXA FN-002 is a multifunctional 3-in-1 fitness machine combining a manual treadmill, twister, and push-up stand. Its sturdy construction and 2-level inclination make it a practical all-in-one solution for home fitness.', '["3 in 1: Treadmill + Twister + Push-up Stand","Manual running treadmill","Running surface: 1000 x 340 mm","Maximum user weight: 100 KG (tested)","Product weight: 35 KG","2-level inclination","Heavy-duty steel frame","LCD display: Speed, Distance, Time, Scan and Calories","Foldable and space-saving design","Ideal for home use"]', '{"Type":"3 in 1 Manual Treadmill with Twister and Push-up Stand","Running Surface":"1000 x 340 mm","Maximum User Weight":"100 KG (Tested)","Product Weight":"35 KG","Inclination":"2 Level Inclination","Frame":"Heavy-Duty Steel Frame","Display":"Speed, Distance, Time, Scan and Calories","Usage":"Home Use"}', 10, 0, 1, 'FITNEXA FN-002 3 in 1 Manual Treadmill', 'Multifunctional 3 in 1 manual treadmill with twister, push-up stand, LCD display and foldable frame.']],
    ['INSERT INTO products (sku, slug, name, category_id, price_paise, short_description, description, features, specifications, stock, is_featured, is_active, seo_title, seo_description) VALUES (?, ?, ?, (SELECT id FROM categories WHERE slug = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(sku) DO UPDATE SET slug = excluded.slug, name = excluded.name, category_id = excluded.category_id, short_description = excluded.short_description, description = excluded.description, features = excluded.features, specifications = excluded.specifications, stock = excluded.stock, is_active = excluded.is_active, seo_title = excluded.seo_title, seo_description = excluded.seo_description, updated_at = strftime(\'%Y-%m-%dT%H:%M:%fZ\',\'now\')',
      ['FN-003', 'fitnexa-fn-003-4-in-1-manual-treadmill-deluxe', 'FITNEXA FN-003 4 in 1 Manual Treadmill Deluxe', 'treadmills', 0, '4 in 1 deluxe treadmill with twister, push-up bar and stepper.', 'The FITNEXA FN-003 Deluxe is a complete 4-in-1 home fitness solution, combining a manual treadmill, twister, push-up bar, and stepper. Designed for versatile workouts, it allows users to perform cardio and multiple exercises using a single compact fitness machine.', '["4 in 1: Treadmill + Twister + Push-up Bar + Stepper","Manual running treadmill","Running surface: 1000 x 340 mm","Maximum user weight: 100 KG (tested)","Product weight: 58 KG","2-level inclination","Heavy-duty steel frame","LCD display: Speed, Distance, Time, Scan and Calories","Foldable and space-saving design","Ideal for home use"]', '{"Type":"4 in 1 Manual Treadmill with Twister, Push-up Bar and Stepper","Running Surface":"1000 x 340 mm","Maximum User Weight":"100 KG (Tested)","Product Weight":"58 KG","Inclination":"2 Level Inclination","Frame":"Heavy-Duty Steel Frame","Display":"Speed, Distance, Time, Scan and Calories","Usage":"Home Use"}', 10, 0, 1, 'FITNEXA FN-003 4 in 1 Manual Treadmill Deluxe', 'Complete 4 in 1 manual treadmill with twister, push-up bar, stepper, LCD display and foldable frame.']],
    ['DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE sku IN (?, ?, ?))', ['FN-001', 'FN-002', 'FN-003']],
    ['INSERT INTO product_images (product_id, url, alt, position) SELECT id, ?, ?, 0 FROM products WHERE sku = ?', [TREADMILL_COVER, 'FITNEXA treadmill cover image', 'FN-001']],
    ['INSERT INTO product_images (product_id, url, alt, position) SELECT id, ?, ?, 0 FROM products WHERE sku = ?', [TREADMILL_COVER, 'FITNEXA treadmill cover image', 'FN-002']],
    ['INSERT INTO product_images (product_id, url, alt, position) SELECT id, ?, ?, 0 FROM products WHERE sku = ?', [TREADMILL_COVER, 'FITNEXA treadmill cover image', 'FN-003']],
    ['INSERT INTO product_images (product_id, url, alt, position) SELECT id, ?, ?, 1 FROM products WHERE sku = ?', ['/products/fn-001-002-003-treadmills-poster.jpeg', 'FITNEXA manual treadmill specifications poster', 'FN-001']],
    ['INSERT INTO product_images (product_id, url, alt, position) SELECT id, ?, ?, 1 FROM products WHERE sku = ?', ['/products/fn-001-002-003-treadmills-poster.jpeg', 'FITNEXA manual treadmill specifications poster', 'FN-002']],
    ['INSERT INTO product_images (product_id, url, alt, position) SELECT id, ?, ?, 1 FROM products WHERE sku = ?', ['/products/fn-001-002-003-treadmills-poster.jpeg', 'FITNEXA manual treadmill specifications poster', 'FN-003']],
  ]);
}

async function hydrate(rows: any[]): Promise<Product[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const imgs = await all<any>(`SELECT product_id, url, alt, position FROM product_images WHERE product_id IN (${inList(ids.length)}) ORDER BY position`, ...ids);
  return rows.map(({ cat_name, cat_slug, ...r }) => {
    const images = imgs.filter((i) => i.product_id === r.id).map(({ url, alt, position }) => ({ url, alt, position }));
    if (cat_slug === 'treadmills') {
      const cover = { url: TREADMILL_COVER, alt: 'FITNEXA treadmill cover image', position: 0 };
      if (images.length) images[0] = cover;
      else images.push(cover);
    }
    return { ...r, features: parseJson(r.features, []), specifications: parseJson(r.specifications, {}),
      is_featured: !!r.is_featured, is_active: !!r.is_active, category: cat_name ? { name: cat_name, slug: cat_slug } : null,
      images };
  });
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
  let rows = await all(sql, ...params);
  if (o.category === 'treadmills' && rows.length === 0 && !o.q && !o.max) {
    await ensureTreadmillProducts();
    rows = await all(sql, ...params);
  }
  return hydrate(rows);
}
export async function getProductBySlug(slug: string) {
  const r = await first(`${BASE} WHERE p.slug = ? AND p.is_active = 1`, slug);
  return r ? (await hydrate([r]))[0] : null;
}
