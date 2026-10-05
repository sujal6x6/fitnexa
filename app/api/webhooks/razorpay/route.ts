import { NextResponse } from 'next/server';
import { batch, first, run, uuid, nowIso } from '@/lib/db';
import { markOrderPaid, verifyWebhookSignature } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';
// Razorpay Dashboard → Settings → Webhooks → URL: https://YOUR-DOMAIN/api/webhooks/razorpay
// Events: payment.captured, order.paid, payment.failed, refund.processed
export async function POST(req: Request) {
  const raw = await req.text(); // raw body is required for signature verification
  const sig = req.headers.get('x-razorpay-signature') ?? '';
  if (!sig || !(await verifyWebhookSignature(raw, sig))) return NextResponse.json({ error: 'Bad signature' }, { status: 400 });

  const eventId = req.headers.get('x-razorpay-event-id');
  const event = JSON.parse(raw);
  if (eventId) { // idempotency: Razorpay retries deliveries
    const m = await run('INSERT OR IGNORE INTO webhook_events (event_id, type) VALUES (?, ?)', eventId, event.event);
    if (!m.changes) return NextResponse.json({ ok: true, duplicate: true });
  }
  const pay = event.payload?.payment?.entity;
  try {
    if ((event.event === 'payment.captured' || event.event === 'order.paid') && pay) {
      const row = await first<{ amount_paise: number }>('SELECT amount_paise FROM payments WHERE razorpay_order_id = ?', pay.order_id);
      if (row && row.amount_paise === pay.amount) await markOrderPaid(pay.order_id, pay.id, pay.method);
      else console.error('Webhook amount mismatch or unknown order', pay?.order_id);
    } else if (event.event === 'payment.failed' && pay) {
      const m = await run("UPDATE payments SET status = 'failed', error = ? WHERE razorpay_order_id = ? AND status <> 'captured'", pay.error_description ?? 'Payment failed', pay.order_id);
      if (m.changes) await run("UPDATE orders SET payment_status = 'failed' WHERE id = (SELECT order_id FROM payments WHERE razorpay_order_id = ?) AND payment_status = 'unpaid'", pay.order_id);
    } else if (event.event === 'refund.processed') {
      const refund = event.payload?.refund?.entity;
      const p = await first<{ order_id: string }>('SELECT order_id FROM payments WHERE razorpay_payment_id = ?', refund?.payment_id);
      if (p) await batch([
        ["UPDATE payments SET status = 'refunded' WHERE razorpay_payment_id = ?", [refund.payment_id]],
        ["UPDATE orders SET status = 'refunded', payment_status = 'refunded', updated_at = ? WHERE id = ?", [nowIso(), p.order_id]],
        ["INSERT INTO order_events (id, order_id, status, note, created_at) VALUES (?, ?, 'refunded', ?, ?)", [uuid(), p.order_id, `Refund ${refund.id}`, nowIso()]],
      ]);
    }
  } catch (e) { console.error('Webhook handler error', e); return NextResponse.json({ error: 'Handler error' }, { status: 500 }); } // 500 → Razorpay retries
  return NextResponse.json({ ok: true });
}
