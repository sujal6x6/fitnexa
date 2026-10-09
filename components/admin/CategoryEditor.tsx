'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Cat = { id: string; name: string; slug: string; description: string | null; image_url: string | null; position: number; is_active: number | boolean };
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function CategoryEditor({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [items, setItems] = useState(() => categories.map((c) => ({ ...c, is_active: !!c.is_active, image_url: c.image_url ?? '', description: c.description ?? '' })));
  const [draft, setDraft] = useState({ name: '', slug: '', description: '', image_url: '', position: 99 });
  const [adding, setAdding] = useState('');
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, string>>({});
  const set = (id: string, key: string, value: unknown) => setItems((prev) => prev.map((c) => c.id === id ? { ...c, [key]: value } : c));
  const readJson = async (res: Response) => {
    const text = await res.text();
    try { return text ? JSON.parse(text) : {}; } catch { return { error: text || res.statusText }; }
  };
  const imageUrl = (value: string) => {
    const v = value.trim();
    if (!v) return null;
    if (/^https?:\/\//.test(v) || v.startsWith('/') || /^data:image\/(png|jpe?g|webp);base64,/i.test(v)) return v;
    return `/${v}`;
  };
  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not load image file.'));
      img.onload = () => {
        const max = 1400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not prepare image.'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

  async function upload(id: string, file: File) {
    setUploading((m) => ({ ...m, [id]: 'Uploading...' }));
    try {
      const sigRes = await fetch('/api/admin/upload-signature');
      const sg = await readJson(sigRes);
      if (!sigRes.ok || sg.error) {
        const fallback = await fileToDataUrl(file);
        set(id, 'image_url', fallback);
        setUploading((m) => ({ ...m, [id]: 'Image ready. Press Save.' }));
        return;
      }
      const fd = new FormData();
      fd.append('file', file); fd.append('api_key', sg.apiKey); fd.append('timestamp', sg.timestamp); fd.append('folder', sg.folder); fd.append('signature', sg.signature);
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sg.cloudName}/image/upload`, { method: 'POST', body: fd });
      const res = await readJson(uploadRes);
      if (!res.secure_url) {
        const fallback = await fileToDataUrl(file);
        set(id, 'image_url', fallback);
        setUploading((m) => ({ ...m, [id]: 'Image ready. Press Save.' }));
        return;
      }
      set(id, 'image_url', res.secure_url);
      setUploading((m) => ({ ...m, [id]: 'Uploaded. Press Save.' }));
    } catch (e) {
      setUploading((m) => ({ ...m, [id]: (e as Error).message }));
    }
  }

  async function save(c: (typeof items)[number]) {
    setMsg((m) => ({ ...m, [c.id]: 'Saving...' }));
    try {
      const r = await fetch(`/api/admin/categories/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: c.name.trim(), description: c.description.trim() || null, image_url: imageUrl(c.image_url), position: Number(c.position) || 0, is_active: !!c.is_active }),
      });
      const d = await readJson(r);
      const details = d.details ? Object.values(d.details).flat().filter(Boolean).join(' ') : '';
      if (!r.ok) throw new Error(details || d.error || 'Could not save category.');
      set(c.id, 'image_url', d.category?.image_url ?? imageUrl(c.image_url) ?? '');
      setMsg((m) => ({ ...m, [c.id]: 'Saved. Live on store.' }));
      router.refresh();
    } catch (e) {
      setMsg((m) => ({ ...m, [c.id]: (e as Error).message }));
    }
  }
  async function addCategory() {
    setAdding('Adding...');
    try {
      const r = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, slug: draft.slug || slugify(draft.name), image_url: imageUrl(draft.image_url), position: Number(draft.position) || 99 }),
      });
      const d = await readJson(r);
      const details = d.details ? Object.values(d.details).flat().filter(Boolean).join(' ') : '';
      if (!r.ok) throw new Error(details || d.error || 'Could not add category.');
      setItems((prev) => [...prev, { ...d.category, is_active: !!d.category.is_active, image_url: d.category.image_url ?? '', description: d.category.description ?? '' }]);
      setDraft({ name: '', slug: '', description: '', image_url: '', position: 99 });
      setAdding('Category added.');
      router.refresh();
    } catch (e) {
      setAdding((e as Error).message);
    }
  }

  return <div className="cat-editor">
    <div className="cat-add panel">
      <h2>Add category</h2>
      <div className="g2"><label>Name<input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value, slug: d.slug || slugify(e.target.value) }))} /></label><label>Slug<input value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))} /></label></div>
      <label>Description<input value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} /></label>
      <div className="g2"><label>Cover image URL<input value={draft.image_url} onChange={(e) => setDraft((d) => ({ ...d, image_url: e.target.value }))} placeholder="/products/example.webp or https://..." /></label><label>Position<input type="number" min={0} value={draft.position} onChange={(e) => setDraft((d) => ({ ...d, position: Number(e.target.value) }))} /></label></div>
      <button type="button" className="p" onClick={addCategory} disabled={draft.name.trim().length < 2}>Add category</button> {adding && <span className={adding.includes('added') ? 'good' : adding.includes('Adding') ? '' : 'bad'}>{adding}</span>}
    </div>
    {items.map((c) => <div className="cat-edit" key={c.id}>
      <div className="cat-cover">
        {c.image_url ? <img src={c.image_url} alt="" /> : <span>No cover</span>}
        <div className="cat-cover-title"><b>{c.name}</b><small>{c.slug}</small></div>
      </div>
      <div className="cat-fields">
        <div className="g2"><label>Name<input value={c.name} onChange={(e) => set(c.id, 'name', e.target.value)} /></label><label>Slug<input value={c.slug} readOnly /></label></div>
        <label>Description<input value={c.description} onChange={(e) => set(c.id, 'description', e.target.value)} /></label>
        <label>Cover image URL<input value={c.image_url} onChange={(e) => set(c.id, 'image_url', e.target.value)} placeholder="/products/example.webp or https://..." /></label>
        <div className="g2"><label>Position<input type="number" min={0} value={c.position} onChange={(e) => set(c.id, 'position', e.target.value)} /></label>
          <label className="checkline"><input type="checkbox" checked={c.is_active} onChange={(e) => set(c.id, 'is_active', e.target.checked)} /> Active in store</label></div>
        <div className="cat-actions"><input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(c.id, e.target.files[0])} /><button type="button" className="p" onClick={() => save(c)}>Save category</button></div>
        {(uploading[c.id] || msg[c.id]) && <p className={msg[c.id]?.startsWith('Saved') ? 'good' : uploading[c.id]?.startsWith('Uploaded') ? 'good' : msg[c.id] && !msg[c.id]?.startsWith('Saving') ? 'bad' : ''}>{uploading[c.id] || msg[c.id]}</p>}
      </div>
    </div>)}
  </div>;
}
