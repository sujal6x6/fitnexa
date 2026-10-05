import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { getRazorpayConfig } from '@/lib/payment-config';
import { rzpFetch } from '@/lib/razorpay';
import { handle, HttpError } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';

// Makes a harmless read-only call to Razorpay with the SAVED credentials for the chosen mode.
export const POST = (req: Request) => handle(async () => {
  const admin = await requireAdmin(); await rateLimit('pay-test:' + admin.id, 10, 10 * 60_000);
  const { mode } = z.object({ mode: z.enum(['test', 'live']) }).parse(await req.json());
  let c; try { c = await getRazorpayConfig(mode); } catch { throw new HttpError(400, `No saved ${mode} keys yet. Save them first.`); }
  try { await rzpFetch('/orders?count=1', c); }
  catch (e: any) { throw new HttpError(400, e?.status === 401 ? 'Razorpay rejected these keys. Check the Key ID and Secret.' : (e?.description ?? 'Could not reach Razorpay.')); }
  return NextResponse.json({ ok: true, message: `Connected to Razorpay in ${mode.toUpperCase()} mode.`, webhookSecretSaved: !!c.webhookSecret });
});
