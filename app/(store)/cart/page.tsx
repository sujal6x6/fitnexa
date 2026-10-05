'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { inr } from '@/lib/format';
import type { Line } from '@/lib/pricing';
export type Quote = { lines: Line[]; subtotal: number; discount: number; shipping: number; total: number; coupon: string | null; couponError: string | null; adjusted: boolean };
export default function CartPage() {
  const { items, ready, setQty, remove, replace } = useCart();
  const [q, setQ] = useState<Quote | null>(null); const [code, setCode] = useState(''); const [applied, setApplied] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!ready) return; if (!items.length) { setQ(null); return; }
    setBusy(true);
    fetch('/api/cart/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, couponCode: applied || null }) })
      .then((r) => r.json()).then((d) => { if (d.lines) { setQ(d); if (d.adjusted) replace(d.lines.map((l: Line) => ({ productId: l.productId, qty: l.qty }))); } }).finally(() => setBusy(false));
  }, [items, applied, ready]); // eslint-disable-line react-hooks/exhaustive-deps
  if (ready && !items.length) return <div className="page"><div className="wrap"><h1 className="d">Your cart</h1><p style={{ marginBottom: 20 }}>Your cart is empty.</p><Link className="btn" href="/shop">SHOP EQUIPMENT</Link></div></div>;
  return (<div className="page"><div className="wrap"><h1 className="d">Your cart</h1>
    {!q ? <p>Loading your cart…</p> : <div className="l2"><div>
      {q.adjusted && <p className="err">Some items were updated because of stock changes.</p>}
      {q.lines.map((l) => <div className="cl" key={l.productId}>
        <Link href={`/product/${l.slug}`} className="t">{l.image && <Image src={l.image} alt="" fill sizes="96px" />}</Link>
        <div><b>{l.name}</b><br />{inr(l.unit)}<br /><button style={{ color: 'var(--r)', fontSize: 14 }} onClick={() => remove(l.productId)}>Remove</button></div>
        <div style={{ textAlign: 'right' }}><div className="qty"><button aria-label="Less" onClick={() => setQty(l.productId, l.qty - 1)}>−</button><span>{l.qty}</span><button aria-label="More" disabled={l.qty >= l.stock} onClick={() => setQty(l.productId, l.qty + 1)}>+</button></div><div style={{ marginTop: 6, fontWeight: 600 }}>{inr(l.unit * l.qty)}</div></div></div>)}
    </div>
    <aside className="sum" style={{ opacity: busy ? 0.6 : 1 }}><h2 className="d" style={{ fontSize: 34, marginBottom: 12 }}>Summary</h2>
      <div className="li"><span>Subtotal</span><span>{inr(q.subtotal)}</span></div>
      {q.discount > 0 && <div className="li"><span>Discount ({q.coupon})</span><span>−{inr(q.discount)}</span></div>}
      <div className="li"><span>Delivery</span><span>{q.shipping ? inr(q.shipping) : 'Calculated at checkout'}</span></div>
      <div className="li tot"><b>Total</b><b>{inr(q.total)}</b></div>
      <div style={{ display: 'flex', gap: 8, margin: '16px 0 4px' }}><input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Coupon code" /><button className="btn k" onClick={() => setApplied(code)}>APPLY</button></div>
      {q.couponError && <p className="err">{q.couponError}</p>}
      <Link className="btn" style={{ width: '100%', textAlign: 'center', marginTop: 14 }} href={'/checkout' + (q.coupon ? `?coupon=${encodeURIComponent(q.coupon)}` : '')}>CHECKOUT</Link></aside></div>}
  </div></div>);
}
