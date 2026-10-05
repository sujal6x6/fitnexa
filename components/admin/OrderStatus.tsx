'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
const OPTIONS = ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];
export default function OrderStatus({ id, status }: { id: string; status: string }) {
  const r = useRouter(); const [v, setV] = useState(''); const [msg, setMsg] = useState('');
  const locked = ['pending', 'payment_processing'].includes(status);
  async function apply() {
    const res = await fetch(`/api/admin/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: v }) });
    if (res.ok) { setMsg(''); r.refresh(); } else setMsg((await res.json()).error);
  }
  return <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><select value={v} onChange={(e) => setV(e.target.value)} style={{ width: 'auto' }}><option value="">Change status…</option>{OPTIONS.filter((o) => !locked || o === 'cancelled').map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}</select>
    <button className="s" disabled={!v} onClick={apply}>Update</button>{msg && <span className="bad">{msg}</span>}</div>;
}
