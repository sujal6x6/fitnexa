'use client';
import { useState } from 'react';
import type { Group, Field } from '@/lib/settings-schema';
import type { PayStatus } from '@/lib/payment-config';
import PaymentEditor from './PaymentEditor';
import CategoryEditor from './CategoryEditor';

const TABS = [['general', 'Brand & contact'], ['seo', 'SEO'], ['home', 'Homepage'], ['categories', 'Categories'], ['pages', 'Pages & policies'], ['shop', 'Shipping & orders'], ['email', 'Email'], ['pay', 'Payments']] as const;
const SITE_URL = 'https://fitnexafitness.com';
const toDisplay = (f: Field, v: any) => f.type === 'boolean' ? String(!!v) : f.type === 'rupees' ? String((v ?? 0) / 100) : f.type === 'lines' ? (v ?? []).join('\n') : String(v ?? '');
type Cat = { id: string; name: string; slug: string; description: string | null; image_url: string | null; position: number; is_active: number | boolean };

export default function SettingsEditor({ groups, values, pay, categories }: { groups: Group[]; values: Record<string, any>; pay: PayStatus; categories: Cat[] }) {
  const [tab, setTab] = useState<string>('general');
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(groups.find((g) => g.tab === 'pages')!.id);
  const [vals, setVals] = useState<Record<string, Record<string, string>>>(() => Object.fromEntries(groups.map((g) => [g.id, Object.fromEntries(g.fields.map((f) => [f.key, toDisplay(f, values[g.id]?.[f.key])]))])));
  const [msg, setMsg] = useState<Record<string, { ok: boolean; t: string }>>({});
  const [uploadMsg, setUploadMsg] = useState('');
  const set = (g: string, k: string, v: string) => setVals((p) => ({ ...p, [g]: { ...p[g], [k]: v } }));
  const readJson = async (res: Response) => {
    const text = await res.text();
    try { return text ? JSON.parse(text) : {}; } catch { return { error: text || res.statusText }; }
  };
  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not load image file.'));
      img.onload = () => {
        const max = 1800, scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not prepare image.'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.84));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
  async function uploadHero(file: File) {
    setUploadMsg('Preparing image...');
    try {
      const sigRes = await fetch('/api/admin/upload-signature');
      const sg = await readJson(sigRes);
      if (sigRes.ok && !sg.error) {
        const fd = new FormData();
        fd.append('file', file); fd.append('api_key', sg.apiKey); fd.append('timestamp', sg.timestamp); fd.append('folder', sg.folder); fd.append('signature', sg.signature);
        const upRes = await fetch(`https://api.cloudinary.com/v1_1/${sg.cloudName}/image/upload`, { method: 'POST', body: fd });
        const up = await readJson(upRes);
        if (up.secure_url) { set('content', 'hero_image_url', up.secure_url); setUploadMsg('Uploaded. Save homepage content.'); return; }
      }
      set('content', 'hero_image_url', await fileToDataUrl(file));
      setUploadMsg('Image ready. Save homepage content.');
    } catch (e) {
      setUploadMsg((e as Error).message);
    }
  }

  async function save(g: Group) {
    const out: Record<string, unknown> = {};
    for (const f of g.fields) { const v = vals[g.id][f.key] ?? '';
      out[f.key] = f.type === 'boolean' ? v === 'true' : f.type === 'rupees' ? Math.round((parseFloat(v) || 0) * 100) : f.type === 'number' ? parseInt(v) || 0 : f.type === 'lines' ? v.split('\n').map((s) => s.trim()).filter(Boolean) : v; }
    setMsg((m) => ({ ...m, [g.id]: { ok: true, t: 'Saving…' } }));
    const r = await fetch(`/api/admin/settings/${g.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(out) });
    const d = await r.json();
    setMsg((m) => ({ ...m, [g.id]: r.ok ? { ok: true, t: 'Saved ✓ — live on the store' } : { ok: false, t: d.details ? Object.values(d.details).flat().join(' ') : d.error } }));
  }
  const panel = (g: Group) => (
    <div className="panel" key={g.id}><h2>{g.title}</h2>{g.note && <p style={{ color: '#666', marginTop: -6 }}>{g.note}</p>}
      <div className="row2">{g.fields.map((f) => <label key={f.key} style={f.wide ? { gridColumn: '1/-1' } : undefined}>{f.label}
        {f.type === 'boolean' ? <span className="toggle-row"><input type="checkbox" checked={vals[g.id][f.key] === 'true'} onChange={(e) => set(g.id, f.key, String(e.target.checked))} /> {vals[g.id][f.key] === 'true' ? 'Enabled' : 'Disabled'}</span>
          : f.type === 'textarea' || f.type === 'lines' ? <textarea rows={f.type === 'lines' ? 5 : 4} value={vals[g.id][f.key]} onChange={(e) => set(g.id, f.key, e.target.value)} />
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
      {g.id === 'content' && <div className="hero-admin-preview">
        <div className="hero-preview-card" style={{ backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.86),rgba(0,0,0,.2)),url("${(vals.content.hero_image_url || '/brand/hero-showroom-bg.png').replace(/"/g, '\\"')}")`, backgroundSize: `cover,${vals.content.hero_image_fit === 'contain' ? 'contain' : 'cover'}`, backgroundPosition: `center,${vals.content.hero_image_position || 'center center'}` }}>
          <b className="d">{vals.content.hero_line1} {vals.content.hero_line2}</b><span>{vals.content.hero_text}</span>
        </div>
        <label>Upload hero image<input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadHero(e.target.files[0])} /></label>
        {uploadMsg && <p className={uploadMsg.includes('ready') || uploadMsg.includes('Uploaded') ? 'good' : 'bad'}>{uploadMsg}</p>}
      </div>}
      <button className="p" onClick={() => save(g)}>Save {g.title.toLowerCase()}</button> {msg[g.id] && <span className={msg[g.id].ok ? 'good' : 'bad'}>{msg[g.id].t}</span>}</div>);
  const pg = groups.filter((g) => g.tab === 'pages');
  const activeTab = TABS.find(([id]) => id === tab)?.[1] ?? 'Settings';
  const chooseTab = (id: string) => { setTab(id); setMenuOpen(false); };
  return (<>
    <div className="settings-toolbar">
      <div>
        <span className="eyebrow">Settings</span>
        <p>Choose a section, update it, and save. Changes go live immediately.</p>
      </div>
      <div className="settings-menu">
        <button type="button" className="settings-menu-trigger" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
          <span>{activeTab}</span><b>Menu</b>
        </button>
        {menuOpen && <div className="settings-menu-popover">
          {TABS.map(([id, l]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => chooseTab(id)}>{l}</button>)}
        </div>}
      </div>
    </div>
    {tab === 'pages' ? <><label style={{ maxWidth: 360 }}>Page to edit<select value={page} onChange={(e) => setPage(e.target.value)}>{pg.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}</select></label>{panel(pg.find((g) => g.id === page)!)}</>
      : tab === 'pay' ? <PaymentEditor status={pay} />
      : tab === 'categories' ? <CategoryEditor categories={categories} />
      : groups.filter((g) => g.tab === tab).map(panel)}</>);
}
