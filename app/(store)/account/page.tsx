'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Timeline from '@/components/Timeline';
import { inr, statusLabel } from '@/lib/format';
import { clearOrders, clearProfile, EMPTY_PROFILE, loadOrders, loadProfile, saveProfile, type Profile } from '@/lib/local';

type O = { order_number: string; status: string; total_paise: number; created_at: string; items: { name: string; quantity: number }[] };
const FIELDS: [keyof Profile, string][] = [['name', 'Full name'], ['phone', 'Phone'], ['email', 'Email'], ['line1', 'Address'], ['line2', 'Landmark / area'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode']];
export default function Account() {
  const [p, setP] = useState<Profile>(EMPTY_PROFILE); const [orders, setOrders] = useState<O[] | null>(null); const [msg, setMsg] = useState(''); const [count, setCount] = useState(0);
  useEffect(() => {
    const prof = loadProfile(); if (prof) setP(prof);
    const saved = loadOrders(); setCount(saved.length);
    if (!saved.length) return setOrders([]);
    fetch('/api/orders/lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orders: saved.map(({ n, k }) => ({ n, k })) }) })
      .then((r) => r.json()).then((d) => setOrders(d.orders ?? [])).catch(() => setOrders([]));
  }, []);
  return (<div className="page account-page"><div className="wrap"><h1 className="d">My orders &amp; details</h1>
    <p className="fine" style={{ marginTop: -10, marginBottom: 24 }}>No account needed. Your details, cart and order list are saved on this device only, so your next checkout is faster.</p>
    <div className="l2"><div><h2 className="d" style={{ fontSize: 34, marginBottom: 12 }}>Orders on this device</h2>
      {orders === null ? <p>Loading…</p> : !orders.length ? <><p style={{ marginBottom: 18 }}>{count ? 'These orders have not been paid yet.' : 'No orders yet.'}</p><Link className="btn" href="/shop">SHOP EQUIPMENT</Link></> :
        orders.map((o) => <div className="ocard account-order-card" key={o.order_number}><div className="li"><b>{o.order_number}</b><span>{new Date(o.created_at).toLocaleDateString('en-IN')}</span></div>
          {o.items.map((i, k) => <div key={k}>{i.name} × {i.quantity}</div>)}<p style={{ marginTop: 8 }}><b>{inr(o.total_paise)}</b> · {statusLabel(o.status)}</p><Timeline status={o.status} /></div>)}
      <p className="fine">Ordered on another phone or computer? Use <Link href="/track" style={{ color: 'var(--r)', fontWeight: 600 }}>Track order</Link> with your order number and phone.</p></div>
    <aside className="sum"><h2 className="d" style={{ fontSize: 30, marginBottom: 12 }}>Saved details</h2>
      {FIELDS.map(([k, l]) => <label className="field" key={k}>{l}<input value={p[k]} onChange={(e) => setP({ ...p, [k]: e.target.value })} /></label>)}
      <button className="btn" onClick={() => { saveProfile(p); setMsg('Saved on this device ✓'); }}>SAVE</button>{' '}
      <button style={{ color: 'var(--r)', fontWeight: 600 }} onClick={() => { if (confirm('Remove your saved details and order list from this device?')) { clearProfile(); clearOrders(); setP(EMPTY_PROFILE); setOrders([]); setCount(0); setMsg('Cleared'); } }}>Clear data on this device</button>
      {msg && <p className="ok">{msg}</p>}</aside></div></div></div>);
}
