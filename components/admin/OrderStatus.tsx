'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
const OPTIONS = ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];
export default function OrderStatus({ id, status, email, orderNumber }: { id: string; status: string; email: string; orderNumber: string }) {
  const r = useRouter(); const [v, setV] = useState(''); const [trackingId, setTrackingId] = useState(''); const [carrier, setCarrier] = useState(''); const [note, setNote] = useState(''); const [msg, setMsg] = useState('');
  const locked = ['pending', 'payment_processing'].includes(status);
  async function apply() {
    const res = await fetch(`/api/admin/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: v || undefined, trackingId: trackingId || undefined, carrier: carrier || undefined, note: note || undefined }) });
    if (res.ok) { setMsg(''); r.refresh(); } else setMsg((await res.json()).error);
  }
  const emailSubject = encodeURIComponent(`FITNEXA order ${orderNumber} tracking update`);
  const emailBody = encodeURIComponent(`Hello,

Your FITNEXA order ${orderNumber} has been updated.
Status: ${(v || status).replace(/_/g, ' ')}
${trackingId ? `Tracking ID: ${trackingId}\n` : ''}${carrier ? `Courier: ${carrier}\n` : ''}
Thank you,
FITNEXA`);
  return <div className="order-actions"><div className="g3">
    <label>Status<select value={v} onChange={(e) => setV(e.target.value)}><option value="">Keep current status</option>{OPTIONS.filter((o) => !locked || o === 'cancelled').map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}</select></label>
    <label>Tracking ID<input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder="AWB / docket number" /></label>
    <label>Courier<input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Delhivery, DTDC, etc." /></label>
  </div><label>Admin note<input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional internal/customer note" /></label>
    <button className="s" disabled={!v && !trackingId && !carrier && !note} onClick={apply}>Update order</button>{' '}
    <a className="s" href={`mailto:${email}?subject=${emailSubject}&body=${emailBody}`}>Send tracking email</a>{' '}
    {msg && <span className="bad">{msg}</span>}</div>;
}
