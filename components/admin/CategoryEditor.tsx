'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Cat = { id: string; name: string; slug: string; description: string | null; image_url: string | null; position: number; is_active: number | boolean };

export default function CategoryEditor({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [items, setItems] = useState(() => categories.map((c) => ({ ...c, is_active: !!c.is_active, image_url: c.image_url ?? '', description: c.description ?? '' })));
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, string>>({});
  const set = (id: string, key: string, value: unknown) => setItems((prev) => prev.map((c) => c.id === id ? { ...c, [key]: value } : c));

  async function upload(id: string, file: File) {
    setUploading((m) => ({ ...m, [id]: 'Uploading...' }));
    try {
      const sg = await fetch('/api/admin/upload-signature').then((x) => x.json());
      if (sg.error) throw new Error(sg.error);
      const fd = new FormData();
      fd.append('file', file); fd.append('api_key', sg.apiKey); fd.append('timestamp', sg.timestamp); fd.append('folder', sg.folder); fd.append('signature', sg.signature);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${sg.cloudName}/image/upload`, { method: 'POST', body: fd }).then((x) => x.json());
      if (!res.secure_url) throw new Error(res.error?.message ?? 'Upload failed');
      set(id, 'image_url', res.secure_url);
      setUploading((m) => ({ ...m, [id]: 'Uploaded. Press Save.' }));
    } catch (e) {
      setUploading((m) => ({ ...m, [id]: (e as Error).message }));
    }
  }

  async function save(c: (typeof items)[number]) {
    setMsg((m) => ({ ...m, [c.id]: 'Saving...' }));
    const r = await fetch(`/api/admin/categories/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: c.name, description: c.description || null, image_url: c.image_url || null, position: Number(c.position) || 0, is_active: !!c.is_active }),
    });
    const d = await r.json();
    setMsg((m) => ({ ...m, [c.id]: r.ok ? 'Saved. Live on store.' : (d.details ? Object.values(d.details).flat().join(' ') : d.error) }));
    if (r.ok) router.refresh();
  }

  return <div className="cat-editor">
    {items.map((c) => <div className="cat-edit" key={c.id}>
      <div className="cat-cover">{c.image_url ? <img src={c.image_url} alt="" /> : <span>No cover</span>}</div>
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
