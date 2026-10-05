import Link from 'next/link';
import { all } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { inr } from '@/lib/format';
import DeleteProduct from '@/components/admin/DeleteProduct';
export const dynamic = 'force-dynamic';
export default async function Products(props: { searchParams: Promise<{ q?: string; status?: string; category?: string }> }) {
  await requireAdmin();
  const searchParams = await props.searchParams;
  const where: string[] = []; const params: unknown[] = [];
  const q = searchParams.q?.trim().slice(0, 80);
  if (q) { const like = '%' + q.replace(/[\\%_]/g, (m) => '\\' + m) + '%'; where.push("(p.name LIKE ? ESCAPE '\\' OR p.sku LIKE ? ESCAPE '\\')"); params.push(like, like); }
  if (searchParams.status === 'active') where.push('p.is_active = 1');
  if (searchParams.status === 'hidden') where.push('p.is_active = 0');
  if (searchParams.status === 'featured') where.push('p.is_featured = 1');
  if (searchParams.category) { where.push('c.slug = ?'); params.push(searchParams.category); }
  const [data, cats, counts] = await Promise.all([
    all<any>(`SELECT p.id, p.name, p.sku, p.price_paise, p.stock, p.is_active, p.is_featured, c.name AS cat, COUNT(i.id) AS images FROM products p LEFT JOIN categories c ON c.id = p.category_id LEFT JOIN product_images i ON i.product_id = p.id ${where.length ? 'WHERE ' + where.join(' AND ') : ''} GROUP BY p.id ORDER BY p.created_at, p.rowid`, ...params),
    all<any>('SELECT name, slug FROM categories ORDER BY position'),
    all<any>("SELECT COUNT(*) AS total, SUM(is_active = 1) AS active, SUM(is_active = 0) AS hidden, SUM(stock <= 5) AS low_stock FROM products"),
  ]);
  const c = counts[0] ?? {};
  return (<><div style={{ display: 'flex', justifyContent: 'space-between' }}><h1>Products</h1><Link className="p" href="/admin/products/new" style={{ height: 36 }}>+ New product</Link></div>
    <div className="cards4"><div className="kpi"><small>Total products</small><b>{c.total ?? 0}</b></div><div className="kpi"><small>Active</small><b>{c.active ?? 0}</b></div><div className="kpi"><small>Hidden drafts</small><b>{c.hidden ?? 0}</b></div><div className="kpi warn"><small>Low stock</small><b>{c.low_stock ?? 0}</b></div></div>
    <form className="panel g3" style={{ display: 'grid', alignItems: 'end' }}><label>Search<input name="q" defaultValue={searchParams.q} placeholder="Product name or SKU" /></label>
      <label>Category<select name="category" defaultValue={searchParams.category ?? ''}><option value="">All categories</option>{cats.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}</select></label>
      <label>Status<select name="status" defaultValue={searchParams.status ?? ''}><option value="">All</option><option value="active">Active</option><option value="hidden">Hidden drafts</option><option value="featured">Featured</option></select></label>
      <div><button className="p">Filter</button> <Link href="/admin/products">Clear</Link></div></form>
    <div className="panel"><table className="t"><thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead><tbody>
      {data.map((p) => <tr key={p.id}><td>{p.name}<br /><small style={{ color: '#777' }}>{p.images} image{p.images === 1 ? '' : 's'}</small></td><td>{p.sku}</td><td>{p.cat}</td><td>{inr(p.price_paise)}</td><td className={p.stock <= 5 ? 'bad' : ''}>{p.stock}</td><td>{p.is_active ? 'Active' : 'Hidden'}{p.is_featured ? ' · Featured' : ''}{p.images ? '' : ' · No media'}</td>
        <td style={{ whiteSpace: 'nowrap' }}><Link href={`/admin/products/${p.id}`}>Edit</Link> · <DeleteProduct id={p.id} /></td></tr>)}</tbody></table></div></>);
}
