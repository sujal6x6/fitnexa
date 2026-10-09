import { NextResponse } from 'next/server';
import { z } from 'zod';
import { batch, run, uuid, nowIso } from '@/lib/db';
import { priceCart } from '@/lib/pricing';
import { createRazorpayOrder } from '@/lib/razorpay';
import { getRazorpayConfig } from '@/lib/payment-config';
import { getSettings } from '@/lib/settings';
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
  paymentMethod: z.enum(['razorpay', 'cod', 'whatsapp']).default('razorpay'),
});
const rand = (n: number) => hex(crypto.getRandomValues(new Uint8Array(n)).buffer as ArrayBuffer);

export const POST = (req: Request) => handle(async () => {
  await rateLimit('create-order:' + clientIp(req), 10, 10 * 60_000);
  const b = schema.parse(await req.json());
  const priced = await priceCart(b.items, b.couponCode, true); // server-side prices & stock check
  const settings = await getSettings();
  if (b.paymentMethod === 'razorpay' && !settings.orders.enable_razorpay) throw new HttpError(400, 'Online payment is currently disabled.');
  if (b.paymentMethod === 'cod' && !settings.orders.enable_cod) throw new HttpError(400, 'Cash on Delivery is currently disabled.');
  if (b.paymentMethod === 'whatsapp' && !settings.orders.enable_whatsapp_pay) throw new HttpError(400, 'WhatsApp payment is currently disabled.');
  const cfg = b.paymentMethod === 'razorpay' ? await getRazorpayConfig() : null;
  const orderId = uuid(), orderNumber = 'FX' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + rand(3).toUpperCase(), accessToken = rand(16), t = nowIso();
  const initialStatus = b.paymentMethod === 'razorpay' ? 'pending' : 'confirmed';
  const paymentNote = b.paymentMethod === 'cod' ? 'Cash on Delivery order created' : b.paymentMethod === 'whatsapp' ? 'Customer chose Pay directly on WhatsApp' : 'Order created';

  await batch([
    [`INSERT INTO orders (id, order_number, access_token, customer_id, status, subtotal_paise, discount_paise, shipping_paise, total_paise, coupon_code,
        ship_name, ship_phone, ship_email, ship_line1, ship_line2, ship_city, ship_state, ship_pincode, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, orderNumber, accessToken, null, initialStatus, priced.subtotal, priced.discount, priced.shipping, priced.total, priced.coupon, b.name, b.phone, b.email, b.line1, b.line2 ?? null, b.city, b.state, b.pincode, t, t]],
    ...priced.lines.map((l): [string, unknown[]] => ['INSERT INTO order_items (id, order_id, product_id, name, sku, unit_price_paise, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [uuid(), orderId, l.productId, l.name, l.sku, l.unit, l.qty, l.image]]),
    ['INSERT INTO payments (id, order_id, provider, amount_paise, status, method) VALUES (?, ?, ?, ?, ?, ?)', [uuid(), orderId, b.paymentMethod === 'razorpay' ? 'razorpay' : b.paymentMethod, priced.total, b.paymentMethod === 'razorpay' ? 'created' : 'created', b.paymentMethod]],
    ['INSERT INTO order_events (id, order_id, status, note, created_at) VALUES (?, ?, ?, ?, ?)', [uuid(), orderId, initialStatus, paymentNote, t]],
  ]);
  if (b.paymentMethod !== 'razorpay') return NextResponse.json({ orderNumber, accessToken, amount: priced.total, currency: 'INR', method: b.paymentMethod, whatsappNumber: settings.contact.whatsapp || settings.contact.phone_order });

  let rz;
  try { rz = await createRazorpayOrder({ amount: priced.total, currency: 'INR', receipt: orderNumber, notes: { order_id: orderId, order_number: orderNumber } }); }
  catch (e) {
    console.error('Razorpay order creation failed', e);
    await run("UPDATE orders SET status = 'cancelled', updated_at = ? WHERE id = ?", nowIso(), orderId);
    throw new HttpError(502, 'Could not start payment. Please try again.');
  }
  await batch([
    ["UPDATE payments SET razorpay_order_id = ? WHERE order_id = ? AND provider = 'razorpay'", [rz.id, orderId]],
    ["UPDATE orders SET status = 'payment_processing', updated_at = ? WHERE id = ?", [nowIso(), orderId]],
    ["INSERT INTO order_events (id, order_id, status, note, created_at) VALUES (?, ?, 'payment_processing', 'Razorpay order created', ?)", [uuid(), orderId, nowIso()]],
  ]);
  return NextResponse.json({ orderNumber, accessToken, razorpayOrderId: rz.id, amount: priced.total, currency: 'INR', keyId: cfg!.keyId });
});
