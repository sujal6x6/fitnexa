export const b64 = (b: ArrayBuffer | Uint8Array) => { let s = ''; for (const x of new Uint8Array(b)) s += String.fromCharCode(x); return btoa(s); };
export const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
export const utf8 = new TextEncoder();
export function timingSafeEqual(a: string, b: string) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
export async function hmacSha256Hex(secret: string, msg: string) {
  const k = await crypto.subtle.importKey('raw', utf8.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', k, utf8.encode(msg)));
}
