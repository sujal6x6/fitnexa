import { all } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import ProductForm, { EMPTY } from '@/components/admin/ProductForm';
export const dynamic = 'force-dynamic';
export default async function NewProduct() {
  await requireAdmin(); const data = await all<any>('SELECT id, name FROM categories ORDER BY position');
  return <><h1>New product</h1><ProductForm init={EMPTY} categories={data} /></>;
}
