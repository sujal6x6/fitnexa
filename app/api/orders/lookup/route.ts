import { NextResponse } from 'next/server';
import { z } from 'zod';
import { all } from '@/lib/db';
import { withItems } from '@/lib/orders';
import { clientIp, handle } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';

// "My orders" for guest customers: the browser sends the order numbers + secret tokens it saved; we return only matching orders.
const schema = z.object({ orders: z.array(z.object({ n: z.string().max(40), k: z.string().max(64) })).min(1).max(20) });
export const POST = (req: Request) => handle(async () => {
  await rateLimit('lookup:' + clientIp(req), 30, 10 * 60_000);
  const { orders } = schema.parse(await req.json());
  const rows = await all(`SELECT * FROM orders WHERE status <> 'pending' AND (${orders.map(() => '(order_number = ? AND access_token = ?)').join(' OR ')}) ORDER BY created_at DESC`, ...orders.flatMap((o) => [o.n, o.k]));
  const full: any[] = await withItems(rows);
  return NextResponse.json({ orders: full.map((o) => ({ order_number: o.order_number, status: o.status, total_paise: o.total_paise, created_at: o.created_at, items: o.items.map((i: any) => ({ name: i.name, quantity: i.quantity })) })) });
});
