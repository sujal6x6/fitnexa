import Link from 'next/link';
import { first } from '@/lib/db';
import { withItems } from '@/lib/orders';
import { inr, statusLabel } from '@/lib/format';
import Timeline from '@/components/Timeline';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order confirmation', robots: { index: false } };
export default async function Success(props: { searchParams: Promise<{ n?: string; k?: string }> }) {
  const sp = await props.searchParams;
  const row = sp.n && sp.k ? await first('SELECT * FROM orders WHERE order_number = ? AND access_token = ?', sp.n, sp.k) : null;
  const o: any = row ? (await withItems([row], { payments: true }))[0] : null;
  if (!o) return <div className="page"><div className="wrap"><h1 className="d">Order not found</h1><Link className="btn" href="/track">TRACK AN ORDER</Link></div></div>;
  const paid = o.payment_status === 'paid';
  const provider = o.payments?.[0]?.provider;
  const offline = provider === 'cod' || provider === 'whatsapp';
  return (<div className="page"><div className="wrap prose">
    <h1 className="d">{paid ? 'Payment received' : offline ? 'Order placed' : 'Confirming payment…'}</h1>
    <p className={paid || offline ? 'ok' : ''}>{paid ? `Thank you, ${o.ship_name}. Your order ${o.order_number} is confirmed and a confirmation will be sent to ${o.ship_email}.` : offline ? `Thank you, ${o.ship_name}. Your order ${o.order_number} has been received. ${provider === 'whatsapp' ? 'Please complete payment on WhatsApp so we can process it.' : 'We will confirm availability before dispatch.'}` : `Order ${o.order_number} is awaiting confirmation from Razorpay. This page shows the real status — refresh in a minute. If you were charged, your order will update automatically.`}</p>
    <Timeline status={o.status} /><p>Status: <b>{statusLabel(o.status)}</b></p>
    <div className="ocard">{o.items.map((i: any) => <div className="li" key={i.id}><span>{i.name} × {i.quantity}</span><span>{inr(i.unit_price_paise * i.quantity)}</span></div>)}
      <div className="li"><b>Total</b><b>{inr(o.total_paise)}</b></div></div>
    <Link className="btn k" href="/shop">CONTINUE SHOPPING</Link></div></div>);
}
