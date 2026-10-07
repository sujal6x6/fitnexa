import { z } from 'zod';
import { PAGES } from './pages';

export type FieldType = 'text' | 'textarea' | 'email' | 'url' | 'rupees' | 'number' | 'lines';
export type Field = { key: string; label: string; type: FieldType; help?: string; wide?: boolean };
export type Group = { id: string; tab: 'general' | 'seo' | 'home' | 'pages' | 'shop' | 'email'; title: string; note?: string; fields: Field[] };
const t = (key: string, label: string, help?: string): Field => ({ key, label, type: 'text', help });
const ta = (key: string, label: string, help?: string): Field => ({ key, label, type: 'textarea', help, wide: true });

const PAGE_LABELS: Record<string, string> = { about: 'About Fitnexa', 'business-model': 'Our Business Model', delivery: 'Pan-India Delivery', warranty: 'Warranty & After-Sales', installation: 'Installation & Service', contact: 'Contact (intro text)', privacy: 'Privacy Policy', terms: 'Terms & Conditions', shipping: 'Shipping Policy', refund: 'Refund & Return Policy' };
export const pageGroupId = (slug: string) => 'page_' + slug.replace(/-/g, '_');

export const GROUPS: Group[] = [
  { id: 'brand', tab: 'general', title: 'Brand', fields: [t('name', 'Brand name'), t('tagline', 'Tagline'), t('secondary_tagline', 'Secondary tagline'), t('firm', 'Firm / legal name')] },
  { id: 'contact', tab: 'general', title: 'Contact & business details', note: 'Shown in the footer, contact page, product pages, homepage and search-engine data.', fields: [
    t('phone_order', 'Order support phone'), t('phone_service', 'Service & installation phone'), t('phone_help', 'Complaints & general help phone'),
    { key: 'email', label: 'Support email', type: 'email' }, t('whatsapp', 'WhatsApp number', 'Digits only, with country code, e.g. 916397497386. Leave empty to show a Call button instead.'), t('hours', 'Business hours'),
    ta('address', 'Warehouse & office address'), t('gstin', 'GSTIN'),
    { key: 'instagram', label: 'Instagram URL', type: 'url' }, { key: 'facebook', label: 'Facebook URL', type: 'url' }, { key: 'youtube', label: 'YouTube URL', type: 'url' }] },
  { id: 'seo', tab: 'seo', title: 'Search engine & social sharing (SEO)', note: 'Each product also has its own SEO title/description in Products. Each page below has its own under Pages.', fields: [
    t('title_default', 'Default page title'), t('title_template', 'Title template', 'Use %s where the page title goes, e.g. %s | FITNEXA'), ta('description', 'Default meta description', 'Aim for 120–160 characters.'),
    t('keywords', 'Keywords', 'Comma separated (optional; search engines give this little weight).'), { key: 'og_image', label: 'Social share image URL', type: 'url', help: 'Shown when the site is shared on WhatsApp, Facebook, etc. Use a 1200×630 image.' },
    t('google_verification', 'Google Search Console verification code', 'Only the code, not the full tag.'), t('twitter_handle', 'X / Twitter handle', 'e.g. @fitnexa'),
    t('locality', 'Business locality / city'), t('region', 'Business state / region'), t('country', 'Business country code', 'Example: IN')] },
  { id: 'content', tab: 'home', title: 'Homepage content', fields: [
    t('hero_line1', 'Hero headline — line 1'), t('hero_line2', 'Hero headline — line 2 (shown in red)'), t('hero_line3', 'Hero headline — line 3'), ta('hero_text', 'Hero supporting text'),
    t('hero_cta', 'Primary button label'), t('hero_cta2', 'Secondary button label'),
    { key: 'trust_items', label: 'Trust strip items (one per line)', type: 'lines', wide: true },
    t('homegym_title', 'Multi Home Gym section — title'), ta('homegym_text', 'Multi Home Gym section — text'), { key: 'homegym_points', label: 'Multi Home Gym highlights (one per line)', type: 'lines', wide: true },
    t('cta_title', 'Bottom call-to-action title')] },
  ...Object.keys(PAGES).map((slug): Group => ({ id: pageGroupId(slug), tab: 'pages', title: PAGE_LABELS[slug], note: 'Separate paragraphs with a blank line.', fields: [t('title', 'Page title'), ta('body', 'Page text'), t('seo_title', 'SEO title (optional)'), ta('seo_description', 'SEO description (optional)')] })),
  { id: 'shipping', tab: 'shop', title: 'Shipping', note: 'Applied automatically at cart and checkout.', fields: [{ key: 'flat_paise', label: 'Flat delivery charge (₹)', type: 'rupees', help: '0 = free delivery' }, { key: 'free_above_paise', label: 'Free delivery above (₹)', type: 'rupees', help: '0 = no free-delivery threshold' }] },
  { id: 'orders', tab: 'shop', title: 'Orders & stock', fields: [{ key: 'low_stock_threshold', label: 'Low-stock warning at or below', type: 'number' }] },
  { id: 'email', tab: 'email', title: 'Email', note: 'Stored for when order emails are added. SMTP / email-API keys are secrets and belong in environment variables, not here.', fields: [t('from_name', 'Sender name'), { key: 'from_email', label: 'Sender email', type: 'email' }, { key: 'notify_email', label: 'Send new-order alerts to', type: 'email' }] },
];

export const DEFAULTS: Record<string, Record<string, any>> = {
  brand: { name: 'FITNEXA', tagline: 'Har Ghar Fitness', secondary_tagline: 'Step Into Strength', firm: 'KESARI TRADERS' },
  contact: { phone_order: '+91 63974 97386', phone_service: '+91 75994 44073', phone_help: '+91 78955 95323', email: '', whatsapp: '916397497386', hours: 'Monday – Saturday, 10:30 AM – 6:00 PM',
    address: 'Ground Floor, 257, MS Villa, Gali No. 1, Near Central Bank of India, Ashok Nagar, Yashoda Nagar, Etawah, Uttar Pradesh – 206001, India.', gstin: '09ACYPP8061A2Z4', instagram: 'https://www.instagram.com/kesari_fitzone/', facebook: '', youtube: '' },
  seo: { title_default: 'FITNEXA — Har Ghar Fitness', title_template: '%s | FITNEXA', description: 'Premium-quality home fitness equipment at reasonable prices. Air bikes, orbit bikes, adjustable benches and multi home gyms. Delivered across India.',
    keywords: 'home gym, air bike, exercise bike, adjustable bench, treadmill, fitness equipment India', og_image: '/brand/logo.webp', google_verification: '', twitter_handle: '', locality: 'Etawah', region: 'Uttar Pradesh', country: 'IN' },
  content: { hero_line1: 'Fitness', hero_line2: 'for every', hero_line3: 'home.', hero_text: 'Premium fitness equipment designed for your home. Built for strength. Designed for everyday fitness.', hero_cta: 'SHOP EQUIPMENT', hero_cta2: 'EXPLORE FITNEXA',
    trust_items: ['Premium quality', 'Reasonable prices', 'Home fitness', 'Free Pan-India delivery', 'Customer support', 'After-sales service'],
    homegym_title: 'Your complete home gym', homegym_text: 'Bring a complete fitness setup into your home.', homegym_points: ['Multiple workouts, one machine', 'Made for domestic, everyday use', 'Free video-call installation help', 'Pan-India delivery'], cta_title: 'Ready to build your home gym?' },
  shipping: { flat_paise: 0, free_above_paise: 0 },
  orders: { low_stock_threshold: 5 },
  email: { from_name: 'FITNEXA', from_email: '', notify_email: '' },
  ...Object.fromEntries(Object.entries(PAGES).map(([slug, p]) => [pageGroupId(slug), { title: p.title, body: p.body.join('\n\n'), seo_title: '', seo_description: '' }])),
};

/** Server-side validation is generated from the same field list the admin form uses. */
export function groupSchema(g: Group) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of g.fields) {
    shape[f.key] = f.type === 'number' || f.type === 'rupees' ? z.number().int().min(0).max(100_000_000)
      : f.type === 'lines' ? z.array(z.string().trim().max(200)).max(20)
      : f.type === 'email' ? z.string().trim().email('Enter a valid email').or(z.literal(''))
      : f.type === 'url' ? z.string().trim().refine((v) => v === '' || /^https?:\/\//.test(v) || v.startsWith('/'), `${f.label}: must start with http(s):// or /`)
      : z.string().max(f.type === 'textarea' ? 20000 : 300);
  }
  return z.object(shape).strict();
}
