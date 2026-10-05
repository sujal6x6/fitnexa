import Link from 'next/link';
import { all } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { inr } from '@/lib/format';
import DeleteProduct from '@/components/admin/DeleteProduct';
export const dynamic = 'force-dynamic';
export default async function Products() {
  await requireAdmin();
  const data = await all<any>('SELECT p.id, p.name, p.sku, p.price_paise, p.stock, p.is_active, p.is_featured, c.name AS cat FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.created_at, p.rowid');
  return (<><div style={{ display: 'flex', justifyContent: 'space-between' }}><h1>Products</h1><Link className="p" href="/admin/products/new" style={{ height: 36 }}>+ New product</Link></div>
    <div className="panel"><table className="t"><thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead><tbody>
      {data.map((p) => <tr key={p.id}><td>{p.name}</td><td>{p.sku}</td><td>{p.cat}</td><td>{inr(p.price_paise)}</td><td className={p.stock <= 5 ? 'bad' : ''}>{p.stock}</td><td>{p.is_active ? 'Active' : 'Hidden'}{p.is_featured ? ' · Featured' : ''}</td>
        <td style={{ whiteSpace: 'nowrap' }}><Link href={`/admin/products/${p.id}`}>Edit</Link> · <DeleteProduct id={p.id} /></td></tr>)}</tbody></table></div></>);
}
