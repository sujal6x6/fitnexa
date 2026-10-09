import { all, inList } from './db';
/** Attaches items (and optionally payments) to order rows. */
export async function withItems(orders: any[], opts: { payments?: boolean } = {}) {
  if (!orders.length) return orders;
  const ids = orders.map((o) => o.id);
  const items = await all<any>(`SELECT * FROM order_items WHERE order_id IN (${inList(ids.length)})`, ...ids);
  const pays = opts.payments ? await all<any>(`SELECT order_id, provider, razorpay_order_id, razorpay_payment_id, status, method FROM payments WHERE order_id IN (${inList(ids.length)})`, ...ids) : [];
  return orders.map((o) => ({ ...o, items: items.filter((i) => i.order_id === o.id), payments: pays.filter((p) => p.order_id === o.id) }));
}
