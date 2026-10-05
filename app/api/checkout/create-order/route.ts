import { NextResponse } from 'next/server';
import { z } from 'zod';
import { batch, run, uuid, nowIso } from '@/lib/db';
import { priceCart } from '@/lib/pricing';
import { createRazorpayOrder } from '@/lib/razorpay';
import { getRazorpayConfig } from '@/lib/payment-config';
import { clientIp, handle, HttpError } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { normalisePhone } from '@/lib/format';
import { hex } from '@/lib/encoding';

const schema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), qty: z.number().int().min(1).max(20) })).min(1).max(30),
  couponCode: z.string().max(40).optional().nullable(),
  name: z.string().trim().min(2).max(80),
  phone: z.string().transform(normalisePhone).pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')),
  email: z.string().trim().toLowerCase().email(),
  line1: z.string().trim().min(5).max(200), line2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().min(2).max(80), state: z.string().trim().min(2).max(80), pincode: z.string().regex(/^\d{6}$/, 'Enter a 6-digit pincode'),
});
const rand = (n: number) => hex(crypto.getRandomValues(new Uint8Array(n)).buffer as ArrayBuffer);

export const POST = (req: Request) => handle(async () => {
  await rateLimit('create-order:' + clientIp(req), 10, 10 * 60_000);
  const b = schema.parse(await req.json());
  const priced = await priceCart(b.items, b.couponCode, true); // server-side prices & stock check
  const cfg = await getRazorpayConfig();
  const orderId = uuid(), orderNumber = 'FX' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + rand(3).toUpperCase(), accessToken = rand(16), t = nowIso();

  await batch([
    [`INSERT INTO orders (id, order_number, access_token, customer_id, status, subtotal_paise, discount_paise, shipping_paise, total_paise, coupon_code,
        ship_name, ship_phone, ship_email, ship_line1, ship_line2, ship_city, ship_state, ship_pincode, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, orderNumber, accessToken, null, priced.subtotal, priced.discount, priced.shipping, priced.total, priced.coupon, b.name, b.phone, b.email, b.line1, b.line2 ?? null, b.city, b.state, b.pincode, t, t]],
    ...priced.lines.map((l): [string, unknown[]] => ['INSERT INTO order_items (id, order_id, product_id, name, sku, unit_price_paise, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [uuid(), orderId, l.productId, l.name, l.sku, l.unit, l.qty, l.image]]),
    ["INSERT INTO order_events (id, order_id, status, note, created_at) VALUES (?, ?, 'pending', 'Order created', ?)", [uuid(), orderId, t]],
  ]);

  let rz;
  try { rz = await createRazorpayOrder({ amount: priced.total, currency: 'INR', receipt: orderNumber, notes: { order_id: orderId, order_number: orderNumber } }); }
  catch (e) {
    console.error('Razorpay order creation failed', e);
    await run("UPDATE orders SET status = 'cancelled', updated_at = ? WHERE id = ?", nowIso(), orderId);
    throw new HttpError(502, 'Could not start payment. Please try again.');
  }
  await batch([
    ["INSERT INTO payments (id, order_id, razorpay_order_id, amount_paise, status) VALUES (?, ?, ?, ?, 'created')", [uuid(), orderId, rz.id, priced.total]],
    ["UPDATE orders SET status = 'payment_processing', updated_at = ? WHERE id = ?", [nowIso(), orderId]],
    ["INSERT INTO order_events (id, order_id, status, note, created_at) VALUES (?, ?, 'payment_processing', 'Razorpay order created', ?)", [uuid(), orderId, nowIso()]],
  ]);
  return NextResponse.json({ orderNumber, accessToken, razorpayOrderId: rz.id, amount: priced.total, currency: 'INR', keyId: cfg.keyId });
});
