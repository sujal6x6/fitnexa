'use client';
import { useRouter } from 'next/navigation';
export default function DeleteProduct({ id }: { id: string }) {
  const r = useRouter();
  return <button className="a-link" style={{ color: '#d4101a', padding: 0 }} onClick={async () => { if (!confirm('Delete this product permanently? Past orders keep their details.')) return; await fetch(`/api/admin/products/${id}`, { method: 'DELETE' }); r.refresh(); }}>Delete</button>;
}
