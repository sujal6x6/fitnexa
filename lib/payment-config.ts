import { first, parseJson } from './db';
import { decrypt } from './crypto';
import { HttpError } from './http';

export type Mode = 'test' | 'live';
export type ModeCreds = { key_id?: string; key_secret?: string; webhook_secret?: string }; // secrets are stored encrypted
export type Stored = { mode: Mode; test: ModeCreds; live: ModeCreds };
const dec = async (v?: string) => { try { return v ? await decrypt(v) : ''; } catch { return ''; } };
const mask = (id?: string) => (id ? id.slice(0, 9) + '••••••••' + id.slice(-4) : '');

export async function loadStored(): Promise<Stored> {
  const r = await first<{ value: string }>("SELECT value FROM secure_settings WHERE key = 'razorpay'");
  return { mode: 'test', test: {}, live: {}, ...parseJson(r?.value, {}) };
}
/** Credentials used for real payments. Database values win; the RAZORPAY_* env vars are a fallback. */
export async function getRazorpayConfig(modeOverride?: Mode) {
  const s = await loadStored(); const mode = modeOverride ?? s.mode; const c = s[mode];
  let keyId = c.key_id || '', keySecret = await dec(c.key_secret), webhookSecret = await dec(c.webhook_secret), source: 'database' | 'environment' = 'database', m: Mode = mode;
  if ((!keyId || !keySecret) && !modeOverride && process.env.RAZORPAY_KEY_ID) {
    keyId = process.env.RAZORPAY_KEY_ID; keySecret = process.env.RAZORPAY_KEY_SECRET || ''; webhookSecret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || ''; source = 'environment';
    m = keyId.startsWith('rzp_live_') ? 'live' : 'test';
  }
  if (!keyId || !keySecret) throw new HttpError(503, 'Payments are not configured yet.');
  return { mode: m, keyId, keySecret, webhookSecret, source };
}
/** Safe-to-display status. Never includes secrets. */
export async function getPaymentStatus() {
  const s = await loadStored();
  const one = async (c: ModeCreds) => ({ keyId: mask(c.key_id), hasSecret: !!(await dec(c.key_secret)), hasWebhook: !!(await dec(c.webhook_secret)) });
  return { mode: s.mode, test: await one(s.test), live: await one(s.live), envFallback: !!process.env.RAZORPAY_KEY_ID };
}
export type PayStatus = Awaited<ReturnType<typeof getPaymentStatus>> & { webhookUrl: string; cloudinary: boolean };
