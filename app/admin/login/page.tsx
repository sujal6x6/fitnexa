'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function AdminLogin() {
  const r = useRouter(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (res.ok) { r.push('/admin/dashboard'); r.refresh(); } else { setErr((await res.json()).error); setBusy(false); }
  }
  return <div className="alogin"><form onSubmit={go}><h1>FITNEXA Admin</h1>
    <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
    <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
    {err && <p style={{ color: '#d4101a', fontWeight: 600 }}>{err}</p>}<button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></div>;
}
