import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { env } from './env';
import { first } from './db';
import { HttpError } from './http';
export { hashPassword, checkPassword } from './passwords';

export type Role = 'customer' | 'admin';
const COOKIE: Record<Role, string> = { customer: 'fx_session', admin: 'fx_admin' };
const TTL: Record<Role, number> = { customer: 60 * 60 * 24 * 30, admin: 60 * 60 * 8 };
const key = () => new TextEncoder().encode(env('AUTH_SECRET'));

export async function createSession(role: Role, id: string, name: string) {
  const token = await new SignJWT({ role, name }).setSubject(id).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(`${TTL[role]}s`).sign(key());
  (await cookies()).set(COOKIE[role], token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: TTL[role] });
}
export const clearSession = async (role: Role) => (await cookies()).delete(COOKIE[role]);

export async function readSession(role: Role) {
  const t = (await cookies()).get(COOKIE[role])?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, key());
    if (payload.role !== role || !payload.sub) return null;
    return { id: payload.sub, name: String(payload.name ?? '') };
  } catch { return null; }
}
/** Use at the top of every admin API route and admin page. Also re-checks that the admin account is still active. */
export async function requireAdmin() {
  const s = await readSession('admin');
  if (!s) throw new HttpError(401, 'Unauthorized');
  const a = await first<{ is_active: number }>('SELECT is_active FROM admins WHERE id = ?', s.id);
  if (!a?.is_active) throw new HttpError(401, 'Unauthorized');
  return s;
}
