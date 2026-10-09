import Link from 'next/link';
import { all } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { withItems } from '@/lib/orders';
import { inr, statusLabel } from '@/lib/format';
import OrderStatus from '@/components/admin/OrderStatus';
export const dynamic = 'force-dynamic';
const STATUSES = ['pending', 'payment_processing', 'paid', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];
export default async function Orders(props: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin(); const searchParams = await props.searchParams;
  const where: string[] = []; const params: unknown[] = [];
  if (searchParams.status && STATUSES.includes(searchParams.status)) { where.push('status = ?'); params.push(searchParams.status); }
  const s = searchParams.q?.trim().slice(0, 60);
  if (s) { const like = '%' + s.replace(/[\\%_]/g, (m) => '\\' + m) + '%'; where.push("(order_number LIKE ? ESCAPE '\\' OR ship_name LIKE ? ESCAPE '\\' OR ship_phone LIKE ? ESCAPE '\\' OR ship_email LIKE ? ESCAPE '\\')"); params.push(like, like, like, like); }
  const data: any[] = await withItems(await all(`SELECT * FROM orders ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT 100`, ...params), { payments: true });
  return (<><h1>Orders</h1>
    <form className="panel g3" style={{ display: 'grid', alignItems: 'end' }}><label>Search<input name="q" defaultValue={searchParams.q} placeholder="Order no., name, phone, email" /></label>
      <label>Status<select name="status" defaultValue={searchParams.status ?? ''}><option value="">All</option>{STATUSES.map((x) => <option key={x} value={x}>{statusLabel(x)}</option>)}</select></label><div><button className="p">Filter</button> <Link href="/admin/orders">Clear</Link></div></form>
    {data.map((o) => <details className="panel" key={o.id}><summary style={{ cursor: 'pointer', display: 'flex', gap: 14, flexWrap: 'wrap' }}><b>{o.order_number}</b><span>{o.ship_name}</span><span>{inr(o.total_paise)}</span><span className={'badge ' + o.status}>{statusLabel(o.status)}</span><span style={{ color: '#777' }}>{new Date(o.created_at).toLocaleString('en-IN')}</span></summary>
      <div className="g2" style={{ marginTop: 14 }}><div><b>Customer</b><br />{o.ship_name} · {o.ship_phone}<br />{o.ship_email}<br />{o.ship_line1}{o.ship_line2 ? ', ' + o.ship_line2 : ''}<br />{o.ship_city}, {o.ship_state} – {o.ship_pincode}</div>
        <div><b>Payment</b><br />{o.payments.map((p: any, i: number) => <div key={p.razorpay_order_id ?? p.provider + i}>{p.provider === 'cod' ? 'Cash on Delivery' : p.provider === 'whatsapp' ? 'Pay directly on WhatsApp' : 'Razorpay'} · {p.status}{p.method ? ` (${p.method})` : ''}{p.razorpay_order_id && <><br />Razorpay order: {p.razorpay_order_id}</>}{p.razorpay_payment_id && <><br />Payment ID: {p.razorpay_payment_id}</>}</div>)}</div></div>
      <table className="t" style={{ margin: '12px 0' }}><tbody>{o.items.map((i: any) => <tr key={i.id}><td>{i.name}</td><td>× {i.quantity}</td><td>{inr(i.unit_price_paise * i.quantity)}</td></tr>)}
        <tr><td colSpan={2}>Delivery</td><td>{inr(o.shipping_paise)}</td></tr>{o.discount_paise > 0 && <tr><td colSpan={2}>Discount ({o.coupon_code})</td><td>−{inr(o.discount_paise)}</td></tr>}<tr><td colSpan={2}><b>Total</b></td><td><b>{inr(o.total_paise)}</b></td></tr></tbody></table>
      <OrderStatus id={o.id} status={o.status} email={o.ship_email} orderNumber={o.order_number} /></details>)}
    {!data.length && <p>No orders found.</p>}</>);
}
