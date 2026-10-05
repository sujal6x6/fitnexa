'use client';
import { useState } from 'react';
import type { PayStatus, Mode } from '@/lib/payment-config';
const blank = { key_id: '', key_secret: '', webhook_secret: '' };
export default function PaymentEditor({ status: init }: { status: PayStatus }) {
  const [st, setSt] = useState(init); const [mode, setMode] = useState<Mode>(init.mode);
  const [f, setF] = useState({ test: { ...blank }, live: { ...blank } }); const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [tm, setTm] = useState<Record<string, { ok: boolean; t: string }>>({});
  const set = (m: Mode, k: string, v: string) => setF((p) => ({ ...p, [m]: { ...p[m], [k]: v } }));
  async function save() {
    setMsg({ ok: true, t: 'Saving…' });
    const r = await fetch('/api/admin/payment', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, ...f, password: pw }) });
    const d = await r.json();
    if (!r.ok) return setMsg({ ok: false, t: d.details ? Object.values(d.details).flat().join(' ') : d.error });
    setSt({ ...d.status, webhookUrl: st.webhookUrl, cloudinary: st.cloudinary }); setF({ test: { ...blank }, live: { ...blank } }); setPw(''); setMsg({ ok: true, t: 'Saved ✓ — payments now use these keys' });
  }
  async function test(m: Mode) {
    setTm((p) => ({ ...p, [m]: { ok: true, t: 'Testing…' } }));
    const r = await fetch('/api/admin/payment/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: m }) }); const d = await r.json();
    setTm((p) => ({ ...p, [m]: { ok: r.ok, t: r.ok ? d.message + (d.webhookSecretSaved ? '' : ' (webhook secret not saved yet)') : d.error } }));
  }
  const box = (m: Mode) => { const s = st[m]; return (
    <div className="panel" style={{ borderTop: `3px solid ${m === 'live' ? '#d4101a' : '#0c0c0c'}` }}><h2>{m === 'live' ? 'Live keys (real money)' : 'Test keys (no real money)'}</h2>
      <label>Key ID<input value={f[m].key_id} onChange={(e) => set(m, 'key_id', e.target.value)} placeholder={s.keyId || `rzp_${m}_…`} autoComplete="off" /></label>
      <label>Key Secret<input type="password" value={f[m].key_secret} onChange={(e) => set(m, 'key_secret', e.target.value)} placeholder={s.hasSecret ? '•••••••• saved — leave blank to keep' : 'Paste key secret'} autoComplete="new-password" /></label>
      <label>Webhook secret<input type="password" value={f[m].webhook_secret} onChange={(e) => set(m, 'webhook_secret', e.target.value)} placeholder={s.hasWebhook ? '•••••••• saved — leave blank to keep' : 'Paste webhook secret'} autoComplete="new-password" /></label>
      <button className="s" onClick={() => test(m)}>Test connection (saved keys)</button> {tm[m] && <span className={tm[m].ok ? 'good' : 'bad'}>{tm[m].t}</span>}</div>); };
  return (<>
    <div className="panel"><h2>Razorpay payments</h2>
      <p>Active mode: <b className={st.mode === 'live' ? 'bad' : 'good'}>{st.mode.toUpperCase()}</b>{st.envFallback && (!st[st.mode].hasSecret) && <> · currently using the RAZORPAY_* environment variables as a fallback</>}</p>
      <p style={{ color: '#666' }}>Secrets are encrypted before they are stored, are write-only (never shown again), and saving requires your admin password.</p>
      <label style={{ maxWidth: 420 }}>Active mode<select value={mode} onChange={(e) => setMode(e.target.value as Mode)}><option value="test">Test — safe for trying checkout</option><option value="live">Live — takes real payments</option></select></label>
      {mode !== st.mode && mode === 'live' && <p className="bad">Switching to Live will charge real cards. Make sure there are no unpaid orders in progress, because orders started in one mode can’t be verified in the other.</p>}</div>
    {box('test')}{box('live')}
    <div className="panel"><h2>Webhook</h2><p>In Razorpay Dashboard → Settings → Webhooks, add this URL and choose the events <code>payment.captured</code>, <code>order.paid</code>, <code>payment.failed</code>, <code>refund.processed</code>. Use a separate webhook (and secret) for Test and Live.</p><p><code>{st.webhookUrl}</code></p>
      <p style={{ color: '#666' }}>Webhooks need a public https URL. On a local computer, use a tunnel such as ngrok.</p></div>
    <div className="panel"><h2>Save changes</h2><label style={{ maxWidth: 360 }}>Confirm with your admin password<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" /></label>
      <button className="p" onClick={save} disabled={!pw}>Save payment settings</button> {msg && <span className={msg.ok ? 'good' : 'bad'}>{msg.t}</span>}
      <p style={{ color: '#666', marginBottom: 0 }}>To test: save Test keys → “Test connection” → set mode to Test → place an order on the store. Razorpay’s test UPI id <code>success@razorpay</code> succeeds and <code>failure@razorpay</code> fails (see Razorpay’s test-payment docs for test cards).</p></div>
    <p style={{ color: '#666' }}>Cloudinary uploads: {st.cloudinary ? 'configured ✓' : 'not configured (set CLOUDINARY_* in the environment)'}</p></>);
}
