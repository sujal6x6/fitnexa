import { NextResponse } from 'next/server';
import { run, nowIso } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { handle, HttpError } from '@/lib/http';
import { GROUPS, groupSchema } from '@/lib/settings-schema';

export const PUT = (req: Request, { params }: { params: Promise<{ group: string }> }) => handle(async () => {
  await requireAdmin(); const { group } = await params;
  const g = GROUPS.find((x) => x.id === group);
  if (!g) throw new HttpError(404, 'Unknown settings group');
  const value = groupSchema(g).parse(await req.json()); // unknown keys are rejected (.strict())
  await run('INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at', g.id, JSON.stringify(value), nowIso());
  return NextResponse.json({ ok: true });
});
