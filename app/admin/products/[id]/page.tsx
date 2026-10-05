import { notFound } from 'next/navigation';
import { all, first, parseJson } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import ProductForm from '@/components/admin/ProductForm';
export const dynamic = 'force-dynamic';
export default async function EditProduct(props: { params: Promise<{ id: string }> }) {
  await requireAdmin(); const { id } = await props.params;
  const p = await first<any>('SELECT * FROM products WHERE id = ?', id);
  if (!p) notFound();
  const [imgs, cats] = await Promise.all([all<any>('SELECT url FROM product_images WHERE product_id = ? ORDER BY position', id), all<any>('SELECT id, name FROM categories ORDER BY position')]);
  const init = { ...p, features: parseJson(p.features, []), specifications: parseJson(p.specifications, {}), is_featured: !!p.is_featured, is_active: !!p.is_active, images: imgs.map((i) => i.url) };
  return <><h1>Edit: {p.name}</h1><ProductForm init={init} categories={cats} /></>;
}
