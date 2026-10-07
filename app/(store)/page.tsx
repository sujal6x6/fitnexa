import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';
import { getCategories, getProducts } from '@/lib/queries';
import { getSettings } from '@/lib/settings';
import { tel } from '@/lib/site';

export const dynamic = 'force-dynamic'; // switch to `revalidate = 60` once Supabase env vars exist at build time

const TRUST = ['Premium quality', 'Reasonable prices', 'Home fitness', 'Free Pan-India delivery', 'Customer support', 'After-sales service'];
const WHY: [string, string][] = [['Premium quality', 'Equipment selected and checked against our quality standards.'], ['Unique products', "A focused range you won't find on every other shelf."], ['Reasonable pricing', "Competitive prices, so fitness doesn't mean overspending."], ['Home fitness focus', 'Everything is designed for domestic and home use.'], ['Customer support', 'Real people on the phone, Monday to Saturday.'], ['Reliable service', 'Installation help and after-sales support when you need it.']];

export default async function Home() {
  const [cats, products, S] = await Promise.all([getCategories(), getProducts({ featured: true }), getSettings()]);
  const c = S.content, ct = S.contact;
  return (<>
    <header className="hero poster-hero" id="top"><div className="grid" /><div className="slash" />
      <div className="hero-glow" aria-hidden="true" />
      <div className="wrap hero-poster">
        <div className="hero-copy">
          <h1 className="d">{[c.hero_line1, c.hero_line2, c.hero_line3].map((l: string, i: number) => <span key={i}><b>{l}</b></span>)}</h1>
          <p>{c.hero_text}</p>
          <div className="row"><Link className="btn" href="/shop">{c.hero_cta}</Link><Link className="btn o" href="/info/about">{c.hero_cta2}</Link></div>
        </div>
        <div className="hero-showroom">
          <p className="hero-script">Stronger<br />Healthier<br />Happier<br /><em>You</em></p>
          <div className="brand-wall d">FIT<i>N</i>EXA<span>{S.brand.secondary_tagline}</span></div>
          <Image className="hero-equipment" src="/brand/hero-equipment-collage.png" alt="FITNEXA premium home fitness equipment" width={1536} height={1024} priority />
        </div>
        <div className="hero-trust">
          {TRUST.slice(0, 5).map((item) => <span key={item}><b>{item.split(' ')[0]}</b>{item.replace(item.split(' ')[0], '')}</span>)}
        </div>
        <div className="hero-dealer"><b className="d">FREE PAN-INDIA DELIVERY</b><strong>On every product</strong><span>KESARI TRADERS | Ashok Nagar, Etawah (U.P.)</span></div>
      </div></header>

    <div className="mq d" aria-hidden="true"><div>{Array.from({ length: 4 }).flatMap((_, k) => ['Free Pan-India delivery on every product', ...c.trust_items.filter((t: string) => !/pan-?india delivery/i.test(t))].map((t: string) => <span key={k + t}>{t} <em>/</em></span>))}</div></div>

    <section id="cats"><div className="wrap"><h2 className="d">Shop by category</h2><div className="cats">
      {cats.map((c, i) => (<Link key={c.id} className="cat" href={`/shop?category=${c.slug}`}>
        <span className="big d">{c.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
        {c.image_url && <Image className="cim" src={c.image_url} alt="" width={420} height={560} sizes="40vw" />}
        <h3 className="d">{c.name}</h3><p>{c.description}</p><span className="ar">Explore →</span></Link>))}
    </div></div></section>

    <section className="gray" id="featured"><div className="wrap"><h2 className="d">Featured equipment</h2>
      <div className="pg">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      <div style={{ marginTop: 30 }}><Link className="btn k" href="/shop">VIEW ALL PRODUCTS</Link></div></div></section>

    <Reveal className="hg"><div className="img"><b className="d">HG</b></div><div className="tx"><h2 className="d">{c.homegym_title}</h2>
      <p style={{ color: '#bbb', marginBottom: 24, maxWidth: 460 }}>{c.homegym_text}</p>
      <ul>{c.homegym_points.map((p: string) => <li key={p}>{p}</li>)}</ul>
      <div><Link className="btn" href="/shop?category=multi-home-gym">EXPLORE MULTI HOME GYM</Link></div></div></Reveal>

    <section className="mobile-pages"><div className="wrap"><h2 className="d">Explore Fitnexa</h2><div className="quick-links">
      {[
        ['About', 'Who we are', '/info/about'],
        ['Delivery', 'Pan-India shipping', '/info/delivery'],
        ['Installation', 'Setup and service', '/info/installation'],
        ['Warranty', 'After-sales support', '/info/warranty'],
      ].map(([t, d, h]) => <Link key={t} href={h} className="ql"><b className="d">{t}</b><span>{d}</span></Link>)}
    </div></div></section>

    <section className="mobile-long"><div className="wrap"><h2 className="d">Why Fitnexa?</h2><div className="wy">{WHY.map(([t, d]) => <div key={t}><h3 className="d">{t}</h3><p>{d}</p></div>)}</div></div></section>

    <section className="gray mobile-long"><div className="wrap two"><div><h2 className="d">Fitness for every home.</h2>
      <p>Fitnexa is a fitness equipment brand dedicated to making fitness accessible and affordable for every household.</p>
      <p>We offer unique, premium-quality fitness products at reasonable and competitive prices, with a strong focus on products designed for domestic and home use.</p>
      <Link className="btn k" href="/info/about">OUR STORY</Link></div>
      <div><p style={{ marginBottom: 22 }}><b>FITNEXA is operated by KESARI TRADERS.</b> We import selected fitness equipment and work with trusted manufacturing partners to produce products to our specifications, then sell them under the FITNEXA brand.</p>
        <div className="proc">{['Select', 'Source', 'Quality', 'Fitnexa', 'Deliver', 'Support'].map((s) => <div key={s}><b className="d">{s}</b></div>)}</div></div></div></section>

    <section className="mobile-long" style={{ background: 'var(--k)', color: '#fff' }}><div className="wrap"><h2 className="d">Fitness. Delivered across India.</h2>
      <p style={{ maxWidth: 620, color: '#fff', fontWeight: 700 }}>FREE Pan-India Delivery on every product.</p>
      <p style={{ maxWidth: 560, color: '#ccc' }}>FITNEXA dispatches confirmed orders across India from our warehouse in Etawah, Uttar Pradesh through reliable logistics partners.</p>
      <p className="fine" style={{ color: '#999' }}>Delivery timelines may vary by product availability, location, and logistics partner.</p><br /><Link className="btn" href="/info/contact">CONTACT SUPPORT</Link></div></section>

    <section className="mobile-long"><div className="wrap"><h2 className="d">We don&apos;t stop at delivery.</h2><div className="cards" style={{ background: 'var(--g)', padding: 16 }}>
      <div className="cd"><h3 className="d">Free video-call installation help</h3><p>Available at no cost.</p></div>
      <div className="cd"><h3 className="d">Doorstep installation</h3><p>Available at extra charge, depending on location and product.</p></div>
      <div className="cd"><h3 className="d">Service support</h3><p>Call our service line for repairs and parts.</p></div></div>
      <h2 className="d" style={{ margin: '70px 0 20px' }}>Built for your fitness journey.</h2>
      <p style={{ maxWidth: 560, marginBottom: 20 }}>Warranty coverage varies by machine and model. The applicable warranty period and terms are provided with each product.</p><Link className="btn k" href="/info/warranty">GET SUPPORT</Link></div></section>

    <section className="cta"><div className="wrap"><h2 className="d">{c.cta_title}</h2>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}><Link className="btn" href="/shop">SHOP NOW</Link><Link className="btn o" href="/info/contact">CONTACT FITNEXA</Link></div>
      <div className="ph"><div><small>Order support</small><a href={tel(ct.phone_order)}>{ct.phone_order}</a></div><div><small>Service &amp; installation</small><a href={tel(ct.phone_service)}>{ct.phone_service}</a></div>
        <div><small>Complaints &amp; general help</small><a href={tel(ct.phone_help)}>{ct.phone_help}</a></div><div><small>Business hours</small>{ct.hours}</div></div></div></section>
  </>);
}
