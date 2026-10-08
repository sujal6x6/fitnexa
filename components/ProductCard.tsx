'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { inr } from '@/lib/format';
import type { Product } from '@/lib/queries';
export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart(); const [done, setDone] = useState(false);
  const img = p.images[0]; const off = p.compare_price_paise && p.compare_price_paise > p.price_paise ? Math.round(100 - (p.price_paise / p.compare_price_paise) * 100) : 0;
  const fit = p.category?.slug === 'treadmills' ? 'contain' : 'cover';
  return (
    <article className="pc">
      {off > 0 ? <span className="tag">{off}% OFF</span> : p.category && <span className="tag">{p.category.name}</span>}
      <Link href={`/product/${p.slug}`} className="pi" aria-label={p.name}>
        {img ? <Image src={img.url} alt={img.alt ?? p.name} fill sizes="(max-width:560px) 50vw, 25vw" style={{ objectFit: fit, objectPosition: 'center' }} /> : <b className="d">{p.sku.split('-')[1] ?? p.sku}</b>}
      </Link>
      <div className="pb"><small>{p.category?.name}</small><h3><Link href={`/product/${p.slug}`}>{p.name}</Link></h3>
        <div className="pr">{inr(p.price_paise)}{off > 0 && <s style={{ color: '#888', fontSize: 14, marginLeft: 8 }}>{inr(p.compare_price_paise!)}</s>}</div>
        {p.stock > 0 ? <button className="add" onClick={() => { add(p.id); setDone(true); setTimeout(() => setDone(false), 1400); }}>{done ? 'Added ✓' : 'Add to cart'}</button> : <div className="nostock">Out of stock</div>}
      </div>
    </article>
  );
}
