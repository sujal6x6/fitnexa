import { nowIso, uuid } from './db';
import type { z } from 'zod';
import type { productSchema } from './schemas';
type P = z.infer<typeof productSchema>;
/** One transaction: the product row plus its (re-ordered) image list. */
export function productWriteStatements(id: string, p: P, create: boolean): [string, unknown[]][] {
  const f = [p.name, p.slug, p.sku, p.category_id, p.price_paise, p.compare_price_paise, p.short_description, p.description, JSON.stringify(p.features), JSON.stringify(p.specifications), p.warranty, p.stock, p.is_featured ? 1 : 0, p.is_active ? 1 : 0, p.seo_title, p.seo_description];
  const stmts: [string, unknown[]][] = create
    ? [['INSERT INTO products (name, slug, sku, category_id, price_paise, compare_price_paise, short_description, description, features, specifications, warranty, stock, is_featured, is_active, seo_title, seo_description, id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [...f, id]]]
    : [['UPDATE products SET name=?, slug=?, sku=?, category_id=?, price_paise=?, compare_price_paise=?, short_description=?, description=?, features=?, specifications=?, warranty=?, stock=?, is_featured=?, is_active=?, seo_title=?, seo_description=?, updated_at=? WHERE id=?', [...f, nowIso(), id]],
       ['DELETE FROM product_images WHERE product_id = ?', [id]]];
  p.images.forEach((url, i) => stmts.push(['INSERT INTO product_images (id, product_id, url, alt, position) VALUES (?,?,?,?,?)', [uuid(), id, url, p.name, i]]));
  return stmts;
}
