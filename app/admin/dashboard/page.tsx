import { all, first } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { inr } from '@/lib/format';
import { getSettings } from '@/lib/settings';
export const dynamic = 'force-dynamic';
const day = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
export default async function Dashboard() {
  await requireAdmin(); const th = (await getSettings()).orders.low_stock_threshold;
  const [P, A, customers, products, lowStock, topRows] = await Promise.all([
    all<any>("SELECT total_paise, created_at, status FROM orders WHERE payment_status = 'paid' AND created_at >= ?", new Date(Date.now() - 400 * 864e5).toISOString()),
    all<any>('SELECT status, payment_status FROM orders'),
    first<any>("SELECT COUNT(DISTINCT ship_phone) AS c FROM orders WHERE status NOT IN ('pending','payment_processing','cancelled')"), first<any>('SELECT COUNT(*) AS c FROM products'),
    all<any>('SELECT name, stock, sku FROM products WHERE stock <= ? AND is_active = 1 ORDER BY stock', th),
    all<any>("SELECT oi.name AS name, SUM(oi.quantity) AS q FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.payment_status = 'paid' GROUP BY oi.name ORDER BY q DESC LIMIT 8"),
  ]);
  const live = (o: any) => o.status !== 'refunded' && o.status !== 'cancelled';
  const total = P.filter(live).reduce((a, o) => a + o.total_paise, 0);
  const today = P.filter((o) => live(o) && day(new Date(o.created_at)) === day(new Date())).reduce((a, o) => a + o.total_paise, 0);
  const series = Array.from({ length: 14 }, (_, i) => { const dt = new Date(Date.now() - (13 - i) * 864e5); const k = day(dt); return { k: k.slice(8), v: P.filter((o) => day(new Date(o.created_at)) === k).reduce((a, o) => a + o.total_paise, 0) }; });
  const max = Math.max(1, ...series.map((s) => s.v));
  const kpi = (l: string, v: string | number, warn = false) => <div className={'kpi' + (warn ? ' warn' : '')}><small>{l}</small><b>{v}</b></div>;
  return (<><h1>Dashboard</h1>
    <div className="cards4">{kpi('Total sales', inr(total))}{kpi("Today's sales", inr(today))}{kpi('Total orders', A.filter((o) => !['pending', 'payment_processing'].includes(o.status)).length)}
      {kpi('Pending (to confirm)', A.filter((o) => o.status === 'paid').length)}{kpi('Completed', A.filter((o) => o.status === 'delivered').length)}{kpi('Customers', customers?.c ?? 0)}{kpi('Products', products?.c ?? 0)}{kpi(`Low stock (≤${th})`, lowStock.length, lowStock.length > 0)}</div>
    <div className="panel"><h2>Paid sales — last 14 days</h2><div className="bars" style={{ marginBottom: 24 }}>{series.map((s) => <div key={s.k} style={{ height: `${(s.v / max) * 100}%` }} title={inr(s.v)}><span>{s.k}</span></div>)}</div></div>
    <div className="g2" style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
      <div className="panel"><h2>Top selling products (units)</h2>{topRows.length ? <table className="t"><tbody>{topRows.map((r) => <tr key={r.name}><td>{r.name}</td><td>{r.q}</td></tr>)}</tbody></table> : <p>No paid orders yet.</p>}</div>
      <div className="panel"><h2>Low stock</h2>{lowStock.length ? <table className="t"><tbody>{lowStock.map((p) => <tr key={p.sku}><td>{p.name}</td><td className="bad">{p.stock}</td></tr>)}</tbody></table> : <p>All products are well stocked.</p>}</div></div>
    <p style={{ color: '#777' }}>Orders-over-time and category-sales charts are planned for phase 3.</p></>);
}
