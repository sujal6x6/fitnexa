'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
const LINKS: [string, string][] = [['Home', '/'], ['Shop', '/shop'], ['Treadmills', '/shop?category=treadmills'], ['About', '/info/about'], ['Delivery', '/info/delivery'], ['Support', '/info/contact']];
export default function Header() {
  const path = usePathname(); const { count } = useCart();
  const [scrolled, setScrolled] = useState(false); const [open, setOpen] = useState(false); const [bump, setBump] = useState(false);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 60); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f); }, []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => { if (!count) return; setBump(true); const t = setTimeout(() => setBump(false), 350); return () => clearTimeout(t); }, [count]);
  const solid = scrolled || path !== '/';
  return (<>
    <nav className={solid ? 's' : ''}><div className="wrap">
      <Link className="lg logo-img" href="/" aria-label="FITNEXA home"><Image src="/brand/header-logo.png" alt="FITNEXA Step Into Strength" width={153} height={69} priority /></Link>
      <div className="links">{LINKS.map(([n, h]) => <Link key={n} href={h}>{n}</Link>)}</div>
      <div className="ic"><Link className="hide" href="/shop">Search</Link><Link className="hide" href="/account">My orders</Link>
        <Link href="/cart" className={'cb' + (bump ? ' bump' : '')} aria-label="Cart">Cart <b>{count}</b></Link>
        <button className="bg" aria-label="Menu" onClick={() => setOpen(!open)}><svg width="26" height="18" viewBox="0 0 26 18"><path d="M0 2h26M0 9h26M0 16h26" stroke="currentColor" strokeWidth="3" /></svg></button></div>
    </div></nav>
    <div className={'mm' + (open ? ' o' : '')} onClick={() => setOpen(false)}>{[...LINKS, ['My orders', '/account'], ['Track order', '/track']].map(([n, h]) => <Link key={n} className="d" href={h}>{n}</Link>)}</div>
  </>);
}
