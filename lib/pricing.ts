import { all, first, inList } from './db';
import { HttpError } from './http';
import { parseJson } from './db';

export type Line = { productId: string; name: string; slug: string; sku: string; image: string | null; unit: number; qty: number; stock: number };
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const r = await first<{ value: string }>('SELECT value FROM site_settings WHERE key = ?', key);
  return r ? parseJson<T>(r.value, fallback) : fallback;
}
async function applyCoupon(code: string, subtotal: number) {
  const c = await first<any>('SELECT * FROM coupons WHERE code = ? AND is_active = 1', code.trim().toUpperCase());
  const now = Date.now();
  if (!c || (c.starts_at && new Date(c.starts_at).getTime() > now) || (c.ends_at && new Date(c.ends_at).getTime() < now)
    || (c.usage_limit != null && c.used_count >= c.usage_limit)) throw new HttpError(400, 'This coupon is not valid.');
  if (subtotal < c.min_order_paise) throw new HttpError(400, 'Your order is below the minimum for this coupon.');
  let off = c.discount_type === 'percent' ? Math.floor((subtotal * c.discount_value) / 100) : c.discount_value;
  if (c.max_discount_paise != null) off = Math.min(off, c.max_discount_paise);
  return { code: c.code as string, discount: Math.min(off, subtotal) };
}
/** The ONLY place prices are computed. The browser never sends prices; everything is re-read from the database. */
export async function priceCart(items: { productId: string; qty: number }[], couponCode?: string | null, strict = true) {
  if (!items.length) throw new HttpError(400, 'Your cart is empty.');
  const ids = [...new Set(items.map((i) => i.productId))];
  const rows = await all<any>(`SELECT p.id, p.name, p.slug, p.sku, p.price_paise, p.stock,
      (SELECT url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) AS image
    FROM products p WHERE p.is_active = 1 AND p.id IN (${inList(ids.length)})`, ...ids);
  const by = new Map(rows.map((p) => [p.id, p]));
  const lines: Line[] = []; let adjusted = false;
  for (const it of items) {
    const p = by.get(it.productId);
    if (!p) { if (strict) throw new HttpError(400, 'An item in your cart is no longer available.'); adjusted = true; continue; }
    let qty = it.qty;
    if (qty > p.stock) { if (strict) throw new HttpError(409, `Only ${p.stock} of ${p.name} in stock.`); qty = p.stock; adjusted = true; }
    if (qty < 1) continue;
    lines.push({ productId: p.id, name: p.name, slug: p.slug, sku: p.sku, image: p.image ?? null, unit: p.price_paise, qty, stock: p.stock });
  }
  const subtotal = lines.reduce((a, l) => a + l.unit * l.qty, 0);
  let discount = 0, coupon: string | null = null, couponError: string | null = null;
  if (couponCode?.trim() && lines.length) {
    try { const r = await applyCoupon(couponCode, subtotal); discount = r.discount; coupon = r.code; }
    catch (e) { if (strict) throw e; couponError = (e as Error).message; }
  }
  const ship = await getSetting('shipping', { flat_paise: 0, free_above_paise: 0 });
  const shipping = ship.free_above_paise > 0 && subtotal >= ship.free_above_paise ? 0 : ship.flat_paise;
  return { lines, subtotal, discount, shipping, total: subtotal - discount + shipping, coupon, couponError, adjusted };
}
