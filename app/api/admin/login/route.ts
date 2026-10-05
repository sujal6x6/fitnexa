import { NextResponse } from 'next/server';
import { z } from 'zod';
import { first } from '@/lib/db';
import { checkPassword, createSession } from '@/lib/auth';
import { DUMMY_HASH } from '@/lib/passwords';
import { clientIp, handle, HttpError } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';

const schema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(100) });
export const POST = (req: Request) => handle(async () => {
  await rateLimit('admin-login:' + clientIp(req), 5, 15 * 60_000);
  const b = schema.parse(await req.json());
  const a = await first<any>('SELECT id, name, password_hash, is_active FROM admins WHERE email = ?', b.email);
  const ok = await checkPassword(b.password, a?.password_hash ?? DUMMY_HASH);
  if (!a || !ok || !a.is_active) throw new HttpError(401, 'Incorrect email or password.');
  await createSession('admin', a.id, a.name);
  return NextResponse.json({ ok: true });
});
