import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import Gallery from '@/components/Gallery';
import ProductBuy from '@/components/ProductBuy';
import ProductCard from '@/components/ProductCard';
import { getProductBySlug, getProducts } from '@/lib/queries';
import { inr } from '@/lib/format';
import { SITE, tel } from '@/lib/site';
import { getSettings } from '@/lib/settings';
export const dynamic = 'force-dynamic';
type P = { params: Promise<{ slug: string }> };
export async function generateMetadata(props: P): Promise<Metadata> {
  const p = await getProductBySlug((await props.params).slug); if (!p) return {};
  const title = p.seo_title || p.name, description = p.seo_description || p.short_description || `${p.name} by FITNEXA`;
  return { title, description, alternates: { canonical: `/product/${p.slug}` }, openGraph: { title, description, images: p.images[0] ? [p.images[0].url] : undefined } };
}
export default async function ProductPage(props: P) {
  const p = await getProductBySlug((await props.params).slug); if (!p) notFound();
  const ct = (await getSettings()).contact;
  const related = (await getProducts({ category: p.category?.slug, exclude: p.id, limit: 4 }));
  const specs = Object.entries(p.specifications ?? {});
  const ld = [{ '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.sku, brand: { '@type': 'Brand', name: 'FITNEXA' }, description: p.short_description ?? p.description ?? p.name, image: p.images.map((i) => (i.url.startsWith('/') ? SITE.url + i.url : i.url)),
    offers: { '@type': 'Offer', priceCurrency: 'INR', price: (p.price_paise / 100).toFixed(2), availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: `${SITE.url}/product/${p.slug}` } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ['Shop', '/shop'], [p.name, `/product/${p.slug}`]].map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE.url + u })) }];
  return (<div className="page"><div className="wrap">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    <nav aria-label="Breadcrumb" style={{ position: 'static', height: 'auto', color: 'var(--g2)', marginBottom: 18, fontSize: 14 }}><Link href="/">Home</Link> / <Link href="/shop">Shop</Link>{p.category && <> / <Link href={`/shop?category=${p.category.slug}`}>{p.category.name}</Link></>}</nav>
    <div className="pd"><Gallery images={p.images} name={p.name} />
      <div><h1 className="d" style={{ fontSize: 'clamp(40px,5vw,68px)', marginBottom: 10 }}>{p.name}</h1>
        <div><span className="price">{inr(p.price_paise)}</span>{p.compare_price_paise && p.compare_price_paise > p.price_paise && <span className="cmp">{inr(p.compare_price_paise)}</span>}</div>
        <p style={{ margin: '8px 0' }}><span className={'stock ' + (p.stock > 0 ? 'in' : 'out')}>{p.stock > 0 ? (p.stock <= 5 ? `Only ${p.stock} left` : 'In stock') : 'Out of stock'}</span> · SKU {p.sku}</p>
        {p.short_description && <p>{p.short_description}</p>}
        <ProductBuy id={p.id} price={p.price_paise} stock={p.stock} />
        {p.description && <p style={{ marginBottom: 16 }}>{p.description}</p>}
        {p.features.length > 0 && <><h2 className="d" style={{ fontSize: 30, margin: '18px 0 8px' }}>Features</h2><ul style={{ paddingLeft: 20 }}>{p.features.map((f) => <li key={f}>{f}</li>)}</ul></>}
        {specs.length > 0 && <><h2 className="d" style={{ fontSize: 30, margin: '18px 0 8px' }}>Specifications</h2><table className="spec"><tbody>{specs.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody></table></>}
        <h2 className="d" style={{ fontSize: 30, margin: '18px 0 8px' }}>Warranty</h2><p>{p.warranty || 'Warranty period and terms are provided with each product and vary by model.'}</p>
        <h2 className="d" style={{ fontSize: 30, margin: '18px 0 8px' }}>Delivery</h2><p>Pan-India delivery from Etawah, Uttar Pradesh. Delivery charges and timelines may vary by location.</p>
        <div className="help"><b>Need help?</b><br />Order support: <a href={tel(ct.phone_order)}>{ct.phone_order}</a><br />Service &amp; installation: <a href={tel(ct.phone_service)}>{ct.phone_service}</a></div>
      </div></div>
    {related.length > 0 && <><h2 className="d" style={{ fontSize: 48, margin: '70px 0 20px' }}>You may also like</h2><div className="pg">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div></>}
  </div></div>);
}
