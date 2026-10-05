import { batch, first, all, nowIso, uuid } from './db';
import { getRazorpayConfig } from './payment-config';
import { hmacSha256Hex, timingSafeEqual } from './encoding';

type Creds = { keyId: string; keySecret: string };
/** Minimal Razorpay REST client (the official Node SDK is not Workers-compatible). */
export async function rzpFetch(path: string, c: Creds, init?: { method?: string; body?: unknown }) {
  const r = await fetch('https://api.razorpay.com/v1' + path, {
    method: init?.method ?? 'GET', headers: { Authorization: 'Basic ' + btoa(`${c.keyId}:${c.keySecret}`), 'Content-Type': 'application/json' },
    body: init?.body ? JSON.stringify(init.body) : undefined });
  const d: any = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d?.error?.description ?? 'Razorpay error'), { status: r.status, description: d?.error?.description as string | undefined });
  return d;
}
export async function createRazorpayOrder(body: { amount: number; currency: string; receipt: string; notes: Record<string, string> }) {
  return rzpFetch('/orders', await getRazorpayConfig(), { method: 'POST', body }) as Promise<{ id: string }>;
}
/** Checkout signature: HMAC_SHA256(order_id|payment_id, key_secret) */
export async function verifyPaymentSignature(orderId: string, paymentId: string, sig: string) {
  const c = await getRazorpayConfig();
  return timingSafeEqual(await hmacSha256Hex(c.keySecret, `${orderId}|${paymentId}`), sig);
}
/** Webhook signature: HMAC_SHA256(raw body, webhook_secret) */
export async function verifyWebhookSignature(raw: string, sig: string) {
  const c = await getRazorpayConfig(); if (!c.webhookSecret) return false;
  return timingSafeEqual(await hmacSha256Hex(c.webhookSecret, raw), sig);
}

/**
 * Idempotent and atomic: called from both /verify and the webhook. Everything happens in ONE D1 transaction,
 * and every statement is guarded by "payment not yet captured", so a second call changes nothing.
 */
export async function markOrderPaid(razorpayOrderId: string, razorpayPaymentId: string, method?: string) {
  const pay = await first<{ order_id: string; status: string }>('SELECT order_id, status FROM payments WHERE razorpay_order_id = ?', razorpayOrderId);
  if (!pay || pay.status === 'captured') return false;
  const items = await all<{ product_id: string | null; quantity: number }>('SELECT product_id, quantity FROM order_items WHERE order_id = ?', pay.order_id);
  const order = await first<{ coupon_code: string | null }>('SELECT coupon_code FROM orders WHERE id = ?', pay.order_id);
  const guard = "EXISTS (SELECT 1 FROM payments WHERE razorpay_order_id = ? AND status <> 'captured')";
  const stmts: [string, unknown[]][] = [];
  for (const it of items) if (it.product_id) stmts.push([`UPDATE products SET stock = MAX(stock - ?, 0), updated_at = ? WHERE id = ? AND ${guard}`, [it.quantity, nowIso(), it.product_id, razorpayOrderId]]);
  if (order?.coupon_code) stmts.push([`UPDATE coupons SET used_count = used_count + 1 WHERE code = ? AND ${guard}`, [order.coupon_code, razorpayOrderId]]);
  stmts.push([`UPDATE orders SET status = 'paid', payment_status = 'paid', updated_at = ? WHERE id = ? AND status IN ('pending','payment_processing') AND ${guard}`, [nowIso(), pay.order_id, razorpayOrderId]]);
  stmts.push([`INSERT INTO order_events (id, order_id, status, note, created_at) SELECT ?, ?, 'paid', ?, ? WHERE ${guard}`, [uuid(), pay.order_id, `Razorpay payment ${razorpayPaymentId}`, nowIso(), razorpayOrderId]]);
  stmts.push(["UPDATE payments SET status = 'captured', razorpay_payment_id = ?, method = ?, paid_at = ?, error = NULL WHERE razorpay_order_id = ? AND status <> 'captured'", [razorpayPaymentId, method ?? null, nowIso(), razorpayOrderId]]);
  const res = await batch(stmts);
  return (res[res.length - 1].meta.changes ?? 0) > 0;
}
