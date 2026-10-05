import Link from 'next/link';
import type { Metadata } from 'next';
import ProductCard from '@/components/ProductCard';
import { getCategories, getProducts } from '@/lib/queries';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Shop home fitness equipment', description: 'Air bikes, orbit bikes, adjustable benches and multi home gyms by FITNEXA.' };
type SP = { q?: string; category?: string; sort?: string; max?: string };
export default async function Shop(props: { searchParams: Promise<SP> }) {
  const searchParams = await props.searchParams;
  const [cats, products] = await Promise.all([getCategories(), getProducts({ q: searchParams.q?.slice(0, 60), category: searchParams.category, sort: searchParams.sort, max: Number(searchParams.max) || undefined })]);
  const any = searchParams.q || searchParams.category || searchParams.sort || searchParams.max;
  return (<div className="page"><div className="wrap">
    <h1 className="d">Shop</h1>
    <div className="chips"><Link href="/shop" className={!searchParams.category ? 'on' : ''}>All</Link>{cats.map((c) => <Link key={c.id} href={`/shop?category=${c.slug}`} className={searchParams.category === c.slug ? 'on' : ''}>{c.name}</Link>)}</div>
    <form className="filters" action="/shop">
      <input name="q" placeholder="Search products" defaultValue={searchParams.q} aria-label="Search" />
      {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
      <select name="sort" defaultValue={searchParams.sort ?? ''} aria-label="Sort"><option value="">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select>
      <select name="max" defaultValue={searchParams.max ?? ''} aria-label="Max price"><option value="">Any price</option><option value="10000">Under ₹10,000</option><option value="20000">Under ₹20,000</option><option value="40000">Under ₹40,000</option></select>
      <button className="btn k" type="submit">APPLY</button>
    </form>
    {any && <p style={{ marginBottom: 16 }}><Link href="/shop" style={{ color: 'var(--r)', fontWeight: 600 }}>Clear filters</Link></p>}
    {products.length ? <div className="pg">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div> : <p>No products match your filters.</p>}
  </div></div>);
}
