'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import LogoutButton from '@/components/LogoutButton';

const LINKS = [
  ['Dashboard', '/admin/dashboard'],
  ['Products', '/admin/products'],
  ['Orders', '/admin/orders'],
  ['Checkout', '/admin/checkout'],
  ['Settings', '/admin/settings'],
  ['View store', '/'],
] as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links = (
    <div className="admin-menu-links">
      {LINKS.map(([label, href]) => <Link key={href} href={href} target={href === '/' ? '_blank' : undefined} className={path.startsWith(href) && href !== '/' ? 'active' : ''} onClick={() => setOpen(false)}>{label}</Link>)}
      <LogoutButton />
    </div>
  );
  return <div className="adm">
    <header className="admin-head">
      <Link className="brand" href="/admin/dashboard">FIT<i>N</i>EXA <small>admin</small></Link>
      <nav className="admin-menu">{links}</nav>
      <button className="admin-menu-btn" type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>Menu</button>
    </header>
    {open && <div className="admin-menu-panel">{links}</div>}
    <main>{children}</main>
  </div>;
}
