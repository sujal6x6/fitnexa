import { NextResponse } from 'next/server';
import { z } from 'zod';
import { first, run, nowIso } from '@/lib/db';
import { checkPassword, requireAdmin } from '@/lib/auth';
import { encrypt } from '@/lib/crypto';
import { getPaymentStatus, loadStored, type Mode } from '@/lib/payment-config';
import { handle, HttpError } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';

const creds = (m: Mode) => z.object({
  key_id: z.string().trim().regex(new RegExp(`^rzp_${m}_[A-Za-z0-9]{8,}$`), `Key ID must start with rzp_${m}_`).or(z.literal('')),
  key_secret: z.string().trim().max(200), webhook_secret: z.string().trim().max(200),
});
const schema = z.object({ mode: z.enum(['test', 'live']), test: creds('test'), live: creds('live'), password: z.string().min(1).max(100) });

// Blank secret fields mean "keep what is saved". Secrets are encrypted before storage and are never returned.
export const PUT = (req: Request) => handle(async () => {
  const admin = await requireAdmin();
  await rateLimit('pay-save:' + admin.id, 6, 15 * 60_000);
  const b = schema.parse(await req.json());
  const a = await first<{ password_hash: string }>('SELECT password_hash FROM admins WHERE id = ?', admin.id);
  if (!a || !(await checkPassword(b.password, a.password_hash))) throw new HttpError(401, 'Incorrect admin password.');
  const s = await loadStored(); s.mode = b.mode;
  for (const m of ['test', 'live'] as const) {
    if (b[m].key_id) s[m].key_id = b[m].key_id;
    if (b[m].key_secret) s[m].key_secret = await encrypt(b[m].key_secret);
    if (b[m].webhook_secret) s[m].webhook_secret = await encrypt(b[m].webhook_secret);
  }
  if (s.mode === 'live' && !(s.live.key_id && s.live.key_secret)) throw new HttpError(400, 'Add the Live Key ID and Key Secret before switching to Live mode.');
  await run("INSERT INTO secure_settings (key, value, updated_at) VALUES ('razorpay', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at", JSON.stringify(s), nowIso());
  return NextResponse.json({ ok: true, status: await getPaymentStatus() });
});
