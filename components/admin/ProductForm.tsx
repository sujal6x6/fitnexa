'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
type Init = { id?: string; name: string; slug: string; sku: string; category_id: string | null; price_paise: number; compare_price_paise: number | null; short_description: string | null; description: string | null; features: string[]; specifications: Record<string, string>; warranty: string | null; stock: number; is_featured: boolean; is_active: boolean; seo_title: string | null; seo_description: string | null; images: string[] };
export const EMPTY: Init = { name: '', slug: '', sku: '', category_id: null, price_paise: 0, compare_price_paise: null, short_description: '', description: '', features: [], specifications: {}, warranty: '', stock: 0, is_featured: false, is_active: true, seo_title: '', seo_description: '', images: [] };
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export default function ProductForm({ init, categories }: { init: Init; categories: { id: string; name: string }[] }) {
  const r = useRouter(); const [s, setS] = useState({ ...init, price: String(init.price_paise / 100), compare: init.compare_price_paise ? String(init.compare_price_paise / 100) : '', featuresText: init.features.join('\n'), specs: Object.entries(init.specifications).map(([k, v]) => `${k}: ${v}`).join('\n'), images: [...init.images], imageUrl: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [up, setUp] = useState('');
  const set = (k: string, v: unknown) => setS((p) => ({ ...p, [k]: v }));
  const addImage = (url: string) => {
    const clean = url.trim();
    if (!clean) return;
    setS((p) => ({ ...p, images: [...p.images, clean], imageUrl: '' }));
  };
  const removeImage = (i: number) => setS((p) => ({ ...p, images: p.images.filter((_, x) => x !== i) }));
  const moveImage = (i: number, dir: -1 | 1) => setS((p) => {
    const to = i + dir;
    if (to < 0 || to >= p.images.length) return p;
    const images = [...p.images];
    [images[i], images[to]] = [images[to], images[i]];
    return { ...p, images };
  });
  async function upload(file: File) {
    setUp('Uploading…');
    try {
      const sg = await fetch('/api/admin/upload-signature').then((x) => x.json()); if (sg.error) throw new Error(sg.error);
      const fd = new FormData(); fd.append('file', file); fd.append('api_key', sg.apiKey); fd.append('timestamp', sg.timestamp); fd.append('folder', sg.folder); fd.append('signature', sg.signature);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${sg.cloudName}/image/upload`, { method: 'POST', body: fd }).then((x) => x.json());
      if (!res.secure_url) throw new Error(res.error?.message ?? 'Upload failed');
      setS((p) => ({ ...p, images: [...p.images, res.secure_url] })); setUp('Uploaded ✓');
    } catch (e) { setUp((e as Error).message); }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const specifications: Record<string, string> = {}; for (const l of s.specs.split('\n')) { const i = l.indexOf(':'); if (i > 0) specifications[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
    const body = { name: s.name, slug: s.slug, sku: s.sku, category_id: s.category_id || null, price_paise: Math.round(parseFloat(s.price || '0') * 100), compare_price_paise: s.compare ? Math.round(parseFloat(s.compare) * 100) : null,
      short_description: s.short_description || null, description: s.description || null, features: s.featuresText.split('\n').map((x) => x.trim()).filter(Boolean), specifications, warranty: s.warranty || null,
      stock: Math.max(0, parseInt(String(s.stock)) || 0), is_featured: s.is_featured, is_active: s.is_active, seo_title: s.seo_title || null, seo_description: s.seo_description || null, images: s.images.map((x) => x.trim()).filter(Boolean) };
    const res = await fetch(init.id ? `/api/admin/products/${init.id}` : '/api/admin/products', { method: init.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await res.json(); if (!res.ok) { setErr(d.details ? Object.entries(d.details).map(([k, v]) => `${k}: ${v}`).join(' · ') : d.error); setBusy(false); return; }
    r.push('/admin/products'); r.refresh();
  }
  return (<form onSubmit={save} className="panel" style={{ maxWidth: 820 }}>
    <div className="g2"><label>Product name<input required value={s.name} onChange={(e) => { set('name', e.target.value); if (!init.id) set('slug', slugify(e.target.value)); }} /></label><label>Slug<input required value={s.slug} onChange={(e) => set('slug', e.target.value)} /></label></div>
    <div className="g3"><label>SKU<input required value={s.sku} onChange={(e) => set('sku', e.target.value)} /></label>
      <label>Category<select value={s.category_id ?? ''} onChange={(e) => set('category_id', e.target.value)}><option value="">—</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Stock<input type="number" min={0} value={s.stock} onChange={(e) => set('stock', e.target.value)} /></label></div>
    <div className="g2"><label>Price (₹)<input required type="number" min={0} step="0.01" value={s.price} onChange={(e) => set('price', e.target.value)} /></label><label>Compare-at price (₹, optional)<input type="number" min={0} step="0.01" value={s.compare} onChange={(e) => set('compare', e.target.value)} /></label></div>
    <label>Short description<input value={s.short_description ?? ''} onChange={(e) => set('short_description', e.target.value)} /></label>
    <label>Description<textarea rows={4} value={s.description ?? ''} onChange={(e) => set('description', e.target.value)} /></label>
    <label>Features (one per line)<textarea rows={4} value={s.featuresText} onChange={(e) => set('featuresText', e.target.value)} /></label>
    <label>Specifications (one per line, “Name: value”)<textarea rows={4} value={s.specs} onChange={(e) => set('specs', e.target.value)} placeholder="Max user weight: 100 kg" /></label>
    <label>Warranty<input value={s.warranty ?? ''} onChange={(e) => set('warranty', e.target.value)} /></label>
    <div className="media-box"><div className="media-head"><b>Product media</b><small>First image is used as the main product image.</small></div>
      <div className="media-add"><input value={s.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} placeholder="/products/example.webp or https://..." /><button type="button" className="s" onClick={() => addImage(s.imageUrl)}>Add URL</button></div>
      <p><input type="file" accept="image/*" style={{ width: 'auto' }} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /> <span>{up}</span><br /><small style={{ color: '#777' }}>Upload needs Cloudinary keys in Cloudflare/Admin settings.</small></p>
      <div className="media-grid">{s.images.map((url, i) => <div className="media-item" key={url + i}>
        <img src={url} alt="" /><span>{i === 0 ? 'Main image' : `Image ${i + 1}`}</span><code>{url}</code>
        <div><button type="button" className="s" disabled={i === 0} onClick={() => moveImage(i, -1)}>Up</button><button type="button" className="s" disabled={i === s.images.length - 1} onClick={() => moveImage(i, 1)}>Down</button><button type="button" className="s danger" onClick={() => removeImage(i)}>Remove</button></div>
      </div>)}</div>
      {!s.images.length && <p style={{ color: '#777' }}>No images yet. Add at least one image before activating the product.</p>}</div>
    <div className="g2"><label>SEO title<input value={s.seo_title ?? ''} onChange={(e) => set('seo_title', e.target.value)} /></label><label>SEO description<input value={s.seo_description ?? ''} onChange={(e) => set('seo_description', e.target.value)} /></label></div>
    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" style={{ width: 'auto' }} checked={s.is_featured} onChange={(e) => set('is_featured', e.target.checked)} /> Featured on homepage</label>
    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" style={{ width: 'auto' }} checked={s.is_active} onChange={(e) => set('is_active', e.target.checked)} /> Active (visible in store)</label>
    {err && <p className="bad">{err}</p>}<button className="p" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button></form>);
}
