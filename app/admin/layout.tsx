import Link from 'next/link';
import './admin.css';
import { readSession } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';
import RouteTransition from '@/components/RouteTransition';
export const metadata = { title: 'FITNEXA Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await readSession('admin');
  if (!s) return <>{children}</>; // login page
  return (<div className="adm"><aside><div className="brand">FIT<i>N</i>EXA <small style={{ fontWeight: 400, fontStyle: 'normal', color: '#888' }}>admin</small></div>
    <Link href="/admin/dashboard">Dashboard</Link><Link href="/admin/products">Products</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/settings">Settings</Link>
    <Link href="/" target="_blank">View store ↗</Link><LogoutButton /></aside><main><RouteTransition>{children}</RouteTransition></main></div>);
}
