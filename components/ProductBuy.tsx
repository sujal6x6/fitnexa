'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import { inr } from '@/lib/format';
export default function ProductBuy({ id, price, stock }: { id: string; price: number; stock: number }) {
  const { add } = useCart(); const router = useRouter(); const [q, setQ] = useState(1); const [done, setDone] = useState(false);
  if (stock < 1) return <p className="stock out">Currently out of stock. Call us to be notified.</p>;
  const addNow = () => { add(id, q); setDone(true); setTimeout(() => setDone(false), 1400); };
  const buy = () => { add(id, q); router.push('/checkout'); };
  return (<>
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', margin: '18px 0' }}>
      <div className="qty"><button aria-label="Less" onClick={() => setQ(Math.max(1, q - 1))}>−</button><span>{q}</span><button aria-label="More" onClick={() => setQ(Math.min(stock, 10, q + 1))}>+</button></div>
      <button className="btn k" onClick={addNow}>{done ? 'ADDED ✓' : 'ADD TO CART'}</button>
      <button className="btn" onClick={buy}>BUY NOW</button>
    </div>
    <div className="sticky-cta"><b style={{ fontSize: 20, color: 'var(--r)' }}>{inr(price * q)}</b><button className="btn" onClick={buy}>BUY NOW</button><button className="btn k" onClick={addNow}>{done ? '✓' : 'ADD'}</button></div>
  </>);
}
