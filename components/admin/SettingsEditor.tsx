'use client';
import { useState } from 'react';
import type { Group, Field } from '@/lib/settings-schema';
import type { PayStatus } from '@/lib/payment-config';
import PaymentEditor from './PaymentEditor';
import CategoryEditor from './CategoryEditor';

const TABS = [['general', 'Brand & contact'], ['seo', 'SEO'], ['home', 'Homepage'], ['categories', 'Categories'], ['pages', 'Pages & policies'], ['shop', 'Shipping & orders'], ['email', 'Email'], ['pay', 'Payments']] as const;
const SITE_URL = 'https://fitnexafitness.com';
const toDisplay = (f: Field, v: any) => f.type === 'rupees' ? String((v ?? 0) / 100) : f.type === 'lines' ? (v ?? []).join('\n') : String(v ?? '');
type Cat = { id: string; name: string; slug: string; description: string | null; image_url: string | null; position: number; is_active: number | boolean };

export default function SettingsEditor({ groups, values, pay, categories }: { groups: Group[]; values: Record<string, any>; pay: PayStatus; categories: Cat[] }) {
  const [tab, setTab] = useState<string>('general');
  const [page, setPage] = useState(groups.find((g) => g.tab === 'pages')!.id);
  const [vals, setVals] = useState<Record<string, Record<string, string>>>(() => Object.fromEntries(groups.map((g) => [g.id, Object.fromEntries(g.fields.map((f) => [f.key, toDisplay(f, values[g.id]?.[f.key])]))])));
  const [msg, setMsg] = useState<Record<string, { ok: boolean; t: string }>>({});
  const set = (g: string, k: string, v: string) => setVals((p) => ({ ...p, [g]: { ...p[g], [k]: v } }));

  async function save(g: Group) {
    const out: Record<string, unknown> = {};
    for (const f of g.fields) { const v = vals[g.id][f.key] ?? '';
      out[f.key] = f.type === 'rupees' ? Math.round((parseFloat(v) || 0) * 100) : f.type === 'number' ? parseInt(v) || 0 : f.type === 'lines' ? v.split('\n').map((s) => s.trim()).filter(Boolean) : v; }
    setMsg((m) => ({ ...m, [g.id]: { ok: true, t: 'Saving…' } }));
    const r = await fetch(`/api/admin/settings/${g.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(out) });
    const d = await r.json();
    setMsg((m) => ({ ...m, [g.id]: r.ok ? { ok: true, t: 'Saved ✓ — live on the store' } : { ok: false, t: d.details ? Object.values(d.details).flat().join(' ') : d.error } }));
  }
  const panel = (g: Group) => (
    <div className="panel" key={g.id}><h2>{g.title}</h2>{g.note && <p style={{ color: '#666', marginTop: -6 }}>{g.note}</p>}
      <div className="row2">{g.fields.map((f) => <label key={f.key} style={f.wide ? { gridColumn: '1/-1' } : undefined}>{f.label}
        {f.type === 'textarea' || f.type === 'lines' ? <textarea rows={f.type === 'lines' ? 5 : 4} value={vals[g.id][f.key]} onChange={(e) => set(g.id, f.key, e.target.value)} />
          : <input type={f.type === 'number' || f.type === 'rupees' ? 'number' : f.type === 'email' ? 'email' : 'text'} min={0} step={f.type === 'rupees' ? '0.01' : undefined} value={vals[g.id][f.key]} onChange={(e) => set(g.id, f.key, e.target.value)} />}
        {f.help && <small style={{ color: '#777', fontWeight: 400 }}>{f.help}</small>}</label>)}</div>
      {g.id === 'seo' && <div className="panel" style={{ background: '#fafafa' }}><small style={{ color: '#777' }}>Google preview</small><div style={{ color: '#1a0dab', fontSize: 18 }}>{vals.seo.title_default}</div><div style={{ color: '#006621', fontSize: 13 }}>{SITE_URL.replace(/^https?:\/\//, '')}</div><div style={{ color: '#545454', fontSize: 13 }}>{vals.seo.description}</div>
        <div className="seo-grid">
          <div><b>Title length</b><br /><span className={vals.seo.title_default.length > 65 ? 'bad' : 'good'}>{vals.seo.title_default.length}/60 recommended</span></div>
          <div><b>Description length</b><br /><span className={vals.seo.description.length > 165 || vals.seo.description.length < 110 ? 'bad' : 'good'}>{vals.seo.description.length}/120-160 recommended</span></div>
          <div><b>Sitemap</b><br /><a href="/sitemap.xml" target="_blank">/sitemap.xml</a></div>
          <div><b>Robots</b><br /><a href="/robots.txt" target="_blank">/robots.txt</a></div>
        </div>
        <ul className="seo-list"><li>Use Products → Edit for product-specific SEO titles and descriptions.</li><li>Use Pages & policies for page-specific SEO copy.</li><li>Submit the sitemap URL in Google Search Console after connecting the domain.</li><li>Use a 1200 x 630 image for the social share image when available.</li></ul></div>}
      <button className="p" onClick={() => save(g)}>Save {g.title.toLowerCase()}</button> {msg[g.id] && <span className={msg[g.id].ok ? 'good' : 'bad'}>{msg[g.id].t}</span>}</div>);
  const pg = groups.filter((g) => g.tab === 'pages');
  return (<>
    <div className="admin-tabs">{TABS.map(([id, l]) => <button key={id} className={tab === id ? 'p' : 's'} onClick={() => setTab(id)}>{l}</button>)}</div>
    {tab === 'pages' ? <><label style={{ maxWidth: 360 }}>Page to edit<select value={page} onChange={(e) => setPage(e.target.value)}>{pg.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}</select></label>{panel(pg.find((g) => g.id === page)!)}</>
      : tab === 'pay' ? <PaymentEditor status={pay} />
      : tab === 'categories' ? <CategoryEditor categories={categories} />
      : groups.filter((g) => g.tab === tab).map(panel)}</>);
}
