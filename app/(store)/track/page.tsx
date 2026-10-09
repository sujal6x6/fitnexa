import { first } from '@/lib/db';
import { inr, normalisePhone, statusLabel } from '@/lib/format';
import Timeline from '@/components/Timeline';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Track your order' };
export default async function Track(props: { searchParams: Promise<{ n?: string; p?: string }> }) {
  const searchParams = await props.searchParams;
  const n = searchParams.n?.trim().toUpperCase(), p = searchParams.p ? normalisePhone(searchParams.p) : '';
  const o = n && p ? await first<any>("SELECT order_number, status, total_paise, created_at FROM orders WHERE order_number = ? AND ship_phone = ? AND status <> 'pending'", n, p) : null;
  return <div className="page track-page"><div className="wrap prose"><h1 className="d">Track your order</h1>
    <form className="track-form"><label className="field">Order number<input name="n" required defaultValue={searchParams.n} placeholder="FX2610…" /></label><label className="field">Phone used at checkout<input name="p" required inputMode="numeric" defaultValue={searchParams.p} /></label><button className="btn">TRACK</button></form>
    {n && p && !o && <p className="err" style={{ marginTop: 18 }}>No order found with those details.</p>}
    {o && <div className="ocard track-card"><div className="track-summary"><b>{o.order_number}</b><span>{inr(o.total_paise)}</span><span>{statusLabel(o.status)}</span></div><Timeline status={o.status} /></div>}
  </div></div>;
}
