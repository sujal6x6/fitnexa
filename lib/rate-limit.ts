import { first, run } from './db';
import { HttpError } from './http';
// Stored in D1 so it works across Cloudflare's many isolates (in-memory counters would not).
export async function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  await run('DELETE FROM rate_limits WHERE key = ? AND at < ?', key, now - windowMs);
  await run('INSERT INTO rate_limits (key, at) VALUES (?, ?)', key, now);
  const r = await first<{ c: number }>('SELECT COUNT(*) AS c FROM rate_limits WHERE key = ?', key);
  if ((r?.c ?? 0) > max) throw new HttpError(429, 'Too many attempts. Please try again in a few minutes.');
}
