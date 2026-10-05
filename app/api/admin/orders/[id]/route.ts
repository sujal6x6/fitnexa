import { NextResponse } from 'next/server';
import { z } from 'zod';
import { batch, first, uuid, nowIso } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { handle, HttpError } from '@/lib/http';

// 'paid' and 'payment_processing' can only be set by Razorpay verification/webhooks, never by hand.
const schema = z.object({ status: z.enum(['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded']), note: z.string().max(300).optional() });
export const PATCH = (req: Request, { params }: { params: Promise<{ id: string }> }) => handle(async () => {
  await requireAdmin(); const { id } = await params;
  const b = schema.parse(await req.json());
  const o = await first<{ status: string }>('SELECT status FROM orders WHERE id = ?', id);
  if (!o) throw new HttpError(404, 'Order not found');
  if (['pending', 'payment_processing'].includes(o.status) && b.status !== 'cancelled') throw new HttpError(400, 'This order has not been paid yet.');
  await batch([
    [b.status === 'refunded' ? "UPDATE orders SET status = ?, payment_status = 'refunded', updated_at = ? WHERE id = ?" : 'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [b.status, nowIso(), id]],
    ['INSERT INTO order_events (id, order_id, status, note, created_at) VALUES (?, ?, ?, ?, ?)', [uuid(), id, b.status, b.note ?? null, nowIso()]],
  ]);
  return NextResponse.json({ ok: true });
});
