import { notFound } from 'next/navigation';
import { PAGES } from '@/lib/pages';
import { getSettings } from '@/lib/settings';
import { pageGroupId } from '@/lib/settings-schema';
import { SITE, tel } from '@/lib/site';
export const dynamic = 'force-dynamic';
export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  if (!PAGES[slug]) return {}; const p = (await getSettings())[pageGroupId(slug)];
  const title = p.seo_title || p.title, description = p.seo_description || undefined;
  return { title, description, alternates: { canonical: `/info/${slug}` }, openGraph: { title, description, url: `${SITE.url}/info/${slug}` } };
}
export default async function Info(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  if (!PAGES[slug]) notFound();
  const S = await getSettings(), p = S[pageGroupId(slug)], c = S.contact;
  return <div className="page"><div className="wrap prose"><h1 className="d">{p.title}</h1>{String(p.body).split(/\n\s*\n/).filter(Boolean).map((t: string, i: number) => <p key={i}>{t}</p>)}
    {slug === 'contact' && <div className="ocard" style={{ maxWidth: 560 }}><p><b>Order support</b><br /><a href={tel(c.phone_order)}>{c.phone_order}</a></p><p><b>Service &amp; installation</b><br /><a href={tel(c.phone_service)}>{c.phone_service}</a></p><p><b>Complaints &amp; general help</b><br /><a href={tel(c.phone_help)}>{c.phone_help}</a></p>{c.email && <p><b>Email</b><br /><a href={`mailto:${c.email}`}>{c.email}</a></p>}<p><b>Hours</b><br />{c.hours}</p><p><b>{S.brand.firm}</b><br />{c.address}<br />GSTIN: {c.gstin}</p></div>}
  </div></div>;
}
