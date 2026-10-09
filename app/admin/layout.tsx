import './admin.css';
import { readSession } from '@/lib/auth';
import RouteTransition from '@/components/RouteTransition';
import AdminShell from '@/components/admin/AdminShell';
export const metadata = { title: 'FITNEXA Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await readSession('admin');
  if (!s) return <>{children}</>; // login page
  return <AdminShell><RouteTransition>{children}</RouteTransition></AdminShell>;
}
