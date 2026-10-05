'use client';
import { useRouter } from 'next/navigation';
export default function LogoutButton() {
  const r = useRouter();
  return <button className="a-link" onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); r.push('/admin/login'); r.refresh(); }}>Sign out</button>;
}
