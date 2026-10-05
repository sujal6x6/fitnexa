import { b64, unb64, utf8, timingSafeEqual } from './encoding';
// PBKDF2-HMAC-SHA512 via Web Crypto (native speed). Cloudflare Workers caps PBKDF2 at 100,000 iterations.
// The stored format is self-describing, so the cost can be raised later without breaking existing passwords.
// PBKDF2_ITERATIONS (optional env var) lowers the cost if the free plan's 10 ms CPU limit rejects logins. Higher is safer; max 100,000.
const ITERATIONS = Math.min(100_000, Math.max(1_000, Number(process.env.PBKDF2_ITERATIONS) || 100_000));
async function derive(pw: string, salt: Uint8Array, iterations: number) {
  const k = await crypto.subtle.importKey('raw', utf8.encode(pw), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-512', salt: salt as BufferSource, iterations }, k, 512);
}
export async function hashPassword(pw: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2-sha512$${ITERATIONS}$${b64(salt)}$${b64(await derive(pw, salt, ITERATIONS))}`;
}
export async function checkPassword(pw: string, stored: string) {
  const [alg, it, salt, hash] = stored.split('$');
  if (alg !== 'pbkdf2-sha512' || !salt || !hash) return false;
  return timingSafeEqual(b64(await derive(pw, unb64(salt), Math.min(Number(it) || ITERATIONS, 100_000))), hash);
}
// Used when an email isn't found, so response time doesn't reveal which emails exist.
export const DUMMY_HASH = 'pbkdf2-sha512$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAA';
