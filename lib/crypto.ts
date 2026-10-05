import { env } from './env';
import { b64, unb64, utf8 } from './encoding';
// AES-256-GCM via Web Crypto. Key comes from SETTINGS_ENCRYPTION_KEY (recommended) or falls back to AUTH_SECRET.
// If this key changes, saved payment secrets can no longer be read and must be re-entered.
async function key() {
  const raw = await crypto.subtle.digest('SHA-256', utf8.encode(process.env.SETTINGS_ENCRYPTION_KEY || env('AUTH_SECRET')));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
export async function encrypt(text: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  return b64(iv) + '.' + b64(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(), utf8.encode(text)));
}
export async function decrypt(payload: string) {
  const [iv, ct] = payload.split('.');
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv) as BufferSource }, await key(), unb64(ct) as BufferSource));
}
