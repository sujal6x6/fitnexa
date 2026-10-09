import { NextResponse } from 'next/server';
import { z } from 'zod';
import { batch, first, uuid, nowIso } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { handle, HttpError } from '@/lib/http';

// 'paid' and 'payment_processing' can only be set by Razorpay verification/webhooks, never by hand.
const schema = z.object({
  status: z.enum(['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded']).optional(),
  note: z.string().max(500).optional(),
  trackingId: z.string().trim().max(120).optional(),
  carrier: z.string().trim().max(80).optional(),
});
export const PATCH = (req: Request, { params }: { params: Promise<{ id: string }> }) => handle(async () => {
  await requireAdmin(); const { id } = await params;
  const b = schema.parse(await req.json());
  const o = await first<{ status: string }>('SELECT status FROM orders WHERE id = ?', id);
  if (!o) throw new HttpError(404, 'Order not found');
  if (!b.status && !b.trackingId && !b.note) throw new HttpError(400, 'Choose a status or add tracking details.');
  const next = b.status ?? o.status;
  if (['pending', 'payment_processing'].includes(o.status) && next !== 'cancelled') throw new HttpError(400, 'This order has not been paid or confirmed yet.');
  const trackingNote = b.trackingId ? `Tracking ID: ${b.trackingId}${b.carrier ? ` (${b.carrier})` : ''}` : '';
  const note = [b.note, trackingNote].filter(Boolean).join(' | ') || null;
  await batch([
    [next === 'refunded' ? "UPDATE orders SET status = ?, payment_status = 'refunded', updated_at = ? WHERE id = ?" : 'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [next, nowIso(), id]],
    ['INSERT INTO order_events (id, order_id, status, note, created_at) VALUES (?, ?, ?, ?, ?)', [uuid(), id, next, note, nowIso()]],
  ]);
  return NextResponse.json({ ok: true });
});
