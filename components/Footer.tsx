import Link from 'next/link';
import Image from 'next/image';
import { getSettings } from '@/lib/settings';
import { tel } from '@/lib/site';
const col = (t: string, l: [string, string][]) => <div><h4>{t}</h4>{l.map(([n, h]) => <Link key={n} href={h}>{n}</Link>)}</div>;
export default async function Footer() {
  const s = await getSettings(); const c = s.contact;
  return (<><footer><div className="wrap"><div className="fg">
    <div><Image src="/brand/logo.webp" alt={`${s.brand.name} logo`} width={140} height={100} style={{ background: '#fff', height: 'auto' }} /><p className="d" style={{ color: '#fff', fontSize: 26 }}>{s.brand.tagline}</p></div>
    {col('Shop', [['Treadmills', '/shop?category=treadmills'], ['Air Bikes', '/shop?category=air-bikes'], ['Orbit Bikes', '/shop?category=orbit-bikes'], ['Adjustable Benches', '/shop?category=adjustable-benches'], ['Multi Home Gym', '/shop?category=multi-home-gym']])}
    {col('Company', [['About', '/info/about'], ['Our Business Model', '/info/business-model'], ['Contact', '/info/contact']])}
    {col('Support', [['Warranty', '/info/warranty'], ['Installation & Service', '/info/installation'], ['Delivery', '/info/delivery'], ['Order Tracking', '/track']])}
    {col('Legal', [['Privacy Policy', '/info/privacy'], ['Terms', '/info/terms'], ['Shipping Policy', '/info/shipping'], ['Refund Policy', '/info/refund']])}
  </div><div className="leg"><b style={{ color: '#fff' }}>{s.brand.firm}</b><br />{c.address}<br />GSTIN: {c.gstin}{c.email && <> · <a href={`mailto:${c.email}`}>{c.email}</a></>}
    {[['Instagram', c.instagram], ['Facebook', c.facebook], ['YouTube', c.youtube]].filter(([, u]) => u).map(([n, u]) => <span key={n}> · <a href={u} style={{ color: '#fff', textDecoration: 'underline' }}>{n}</a></span>)}</div></div></footer>
  {c.whatsapp ? <a className="wa" href={`https://wa.me/${c.whatsapp}`}>Chat on WhatsApp</a> : <a className="wa" href={tel(c.phone_order)}>Need help? Call us</a>}</>);
}
