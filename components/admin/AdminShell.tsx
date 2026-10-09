'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import LogoutButton from '@/components/LogoutButton';

const LINKS = [
  ['Dashboard', '/admin/dashboard'],
  ['Products', '/admin/products'],
  ['Orders', '/admin/orders'],
  ['Settings', '/admin/settings'],
  ['View store', '/'],
] as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <aside className={open ? 'open' : ''}>
      <div className="brand">FIT<i>N</i>EXA <small>admin</small></div>
      {LINKS.map(([label, href]) => <Link key={href} href={href} target={href === '/' ? '_blank' : undefined} className={path.startsWith(href) && href !== '/' ? 'active' : ''} onClick={() => setOpen(false)}>{label}</Link>)}
      <LogoutButton />
    </aside>
  );
  return <div className="adm">
    <header className="admin-mobile-head"><div className="brand">FIT<i>N</i>EXA <small>admin</small></div><button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>Menu</button></header>
    {nav}
    {open && <button type="button" aria-label="Close menu" className="admin-scrim" onClick={() => setOpen(false)} />}
    <main>{children}</main>
  </div>;
}
