import { requireAdmin } from '@/lib/auth';
import { all } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { GROUPS } from '@/lib/settings-schema';
import { SITE } from '@/lib/site';
import { getPaymentStatus, type PayStatus } from '@/lib/payment-config';
import SettingsEditor from '@/components/admin/SettingsEditor';
export const dynamic = 'force-dynamic';
export default async function SettingsPage() {
  await requireAdmin();
  const pay: PayStatus = { ...(await getPaymentStatus()), webhookUrl: SITE.url + '/api/webhooks/razorpay', cloudinary: !!process.env.CLOUDINARY_API_SECRET };
  const [settings, categories] = await Promise.all([
    getSettings(),
    all<any>('SELECT id, name, slug, description, image_url, position, is_active FROM categories ORDER BY position, name'),
  ]);
  return <><h1>Settings</h1><SettingsEditor groups={GROUPS} values={settings} pay={pay} categories={categories} /></>;
}
