'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { inr } from '@/lib/format';
import { addOrder, loadProfile, saveProfile } from '@/lib/local';
import type { Quote } from '../cart/page';

declare global { interface Window { Razorpay: any } }
const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Chandigarh','Puducherry'];
const loadRzp = () => new Promise<void>((res, rej) => { if (window.Razorpay) return res(); const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = () => res(); s.onerror = () => rej(new Error('Could not load Razorpay')); document.body.appendChild(s); });
type PayMethod = 'razorpay' | 'whatsapp' | 'cod';

function Checkout() {
  const { items, ready, clear } = useCart(); const router = useRouter(); const coupon = useSearchParams().get('coupon');
  const [q, setQ] = useState<Quote | null>(null); const [f, setF] = useState({ name: '', phone: '', email: '', line1: '', line2: '', city: '', state: '', pincode: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [opts, setOpts] = useState({ razorpay: true, whatsapp: true, cod: false, whatsappNumber: '' });
  const [method, setMethod] = useState<PayMethod>('whatsapp');
  const enabled = opts[method];
  useEffect(() => { const p = loadProfile(); if (p) setF(p); }, []); // prefill from this device
  useEffect(() => { fetch('/api/checkout/options').then((r) => r.json()).then((o) => {
    setOpts(o); setMethod(o.whatsapp ? 'whatsapp' : o.cod ? 'cod' : 'razorpay');
  }).catch(() => {}); }, []);
  useEffect(() => { if (!ready || !items.length) return;
    fetch('/api/cart/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, couponCode: coupon }) }).then((r) => r.json()).then((d) => d.lines && setQ(d)); }, [ready, items, coupon]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function pay(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/checkout/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, couponCode: coupon, ...f, line2: f.line2 || null, paymentMethod: method }) });
      const o = await r.json(); if (!r.ok) throw new Error(o.details ? Object.values(o.details).flat().join(' ') : o.error);
      saveProfile(f); addOrder({ n: o.orderNumber, k: o.accessToken, at: new Date().toISOString(), total: o.amount }); // remembered on this device only
      if (o.method === 'whatsapp') {
        clear();
        const msg = `FITNEXA order ${o.orderNumber}%0AName: ${encodeURIComponent(f.name)}%0APhone: ${encodeURIComponent(f.phone)}%0ATotal: ${encodeURIComponent(inr(o.amount))}%0AI want to pay directly on WhatsApp.`;
        window.open(`https://wa.me/${String(o.whatsappNumber).replace(/\D/g, '')}?text=${msg}`, '_blank');
        router.push(`/payment/success?n=${o.orderNumber}&k=${o.accessToken}`);
        return;
      }
      if (o.method === 'cod') { clear(); router.push(`/payment/success?n=${o.orderNumber}&k=${o.accessToken}`); return; }
      await loadRzp();
      const rz = new window.Razorpay({
        key: o.keyId, amount: o.amount, currency: o.currency, order_id: o.razorpayOrderId, name: 'FITNEXA', description: `Order ${o.orderNumber}`, theme: { color: '#d4101a' },
        prefill: { name: f.name, email: f.email, contact: f.phone },
        handler: async (resp: any) => { // payment is only trusted after the SERVER verifies the signature
          const v = await fetch('/api/checkout/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(resp) });
          if (v.ok) { clear(); router.push(`/payment/success?n=${o.orderNumber}&k=${o.accessToken}`); } else router.push(`/payment/failed?n=${o.orderNumber}`);
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rz.on('payment.failed', () => router.push(`/payment/failed?n=${o.orderNumber}`));
      rz.open();
    } catch (x) { setErr((x as Error).message); setBusy(false); }
  }
  if (ready && !items.length) return <div className="page"><div className="wrap"><h1 className="d">Checkout</h1><p>Your cart is empty.</p></div></div>;
  return (<div className="page"><div className="wrap"><h1 className="d">Checkout</h1>
    <form className="l2" onSubmit={pay}><div>
      <h2 className="d" style={{ fontSize: 34, marginBottom: 4 }}>1. Your details</h2>
      <p className="fine" style={{ marginTop: 0, marginBottom: 14 }}>No account needed. We save your details on this device only, to speed up your next order.</p>
      <label className="field">Full name<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>
      <div className="row2"><label className="field">Phone<input required inputMode="numeric" value={f.phone} onChange={set('phone')} autoComplete="tel" placeholder="10-digit mobile" /></label><label className="field">Email<input required type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label></div>
      <h2 className="d" style={{ fontSize: 34, margin: '20px 0 12px' }}>2. Delivery address</h2>
      <label className="field">Address<input required value={f.line1} onChange={set('line1')} autoComplete="address-line1" /></label>
      <label className="field">Landmark / area (optional)<input value={f.line2} onChange={set('line2')} /></label>
      <div className="row2"><label className="field">City<input required value={f.city} onChange={set('city')} autoComplete="address-level2" /></label>
        <label className="field">State<select required value={f.state} onChange={set('state')}><option value="">Select state</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select></label></div>
      <label className="field" style={{ maxWidth: 220 }}>Pincode<input required inputMode="numeric" maxLength={6} value={f.pincode} onChange={set('pincode')} autoComplete="postal-code" /></label>
    </div>
    <aside className="sum"><h2 className="d" style={{ fontSize: 34, marginBottom: 12 }}>3. Order summary</h2>
      {q?.lines.map((l) => <div className="li" key={l.productId}><span>{l.name} × {l.qty}</span><span>{inr(l.unit * l.qty)}</span></div>)}
      {q && <><div className="li"><span>Subtotal</span><span>{inr(q.subtotal)}</span></div>{q.discount > 0 && <div className="li"><span>Discount ({q.coupon})</span><span>−{inr(q.discount)}</span></div>}
        <div className="li"><span>Delivery</span><span>{q.shipping ? inr(q.shipping) : 'Free'}</span></div><div className="li tot"><b>Total</b><b>{inr(q.total)}</b></div></>}
      <h2 className="d" style={{ fontSize: 34, margin: '20px 0 8px' }}>4. Payment</h2>
      <div className="pay-methods">
        {opts.whatsapp && <label><input type="radio" name="pay" checked={method === 'whatsapp'} onChange={() => setMethod('whatsapp')} /> <b>Pay directly on WhatsApp</b><small>Place order now, then send payment details on WhatsApp.</small></label>}
        {opts.cod && <label><input type="radio" name="pay" checked={method === 'cod'} onChange={() => setMethod('cod')} /> <b>Cash on Delivery</b><small>Pay when the product reaches you.</small></label>}
        {opts.razorpay && <label><input type="radio" name="pay" checked={method === 'razorpay'} onChange={() => setMethod('razorpay')} /> <b>UPI / Card / Netbanking</b><small>Pay securely through Razorpay.</small></label>}
        {!opts.whatsapp && !opts.cod && !opts.razorpay && <p className="err">Checkout is temporarily unavailable. Please contact FITNEXA support.</p>}
      </div>
      {err && <p className="err">{err}</p>}
      <button className="btn" style={{ width: '100%', marginTop: 12 }} disabled={busy || !q || !enabled}>{busy ? 'PLEASE WAIT…' : method === 'razorpay' ? `PAY ${q ? inr(q.total) : ''}` : 'PLACE ORDER'}</button></aside></form></div></div>);
}
export default function Page() { return <Suspense><Checkout /></Suspense>; }
