import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import CheckoutProcessEditor from '@/components/admin/CheckoutProcessEditor';

export const dynamic = 'force-dynamic';

export default async function AdminCheckoutPage() {
  await requireAdmin();
  const settings = await getSettings();
  return <CheckoutProcessEditor orders={settings.orders} contact={settings.contact} shipping={settings.shipping} />;
}
