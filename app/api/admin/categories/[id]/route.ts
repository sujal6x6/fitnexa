import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { handle } from '@/lib/http';
import { first, run } from '@/lib/db';

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).nullable(),
  image_url: z.string().trim().transform((s) => s && !/^https?:\/\//.test(s) && !s.startsWith('/') ? `/${s}` : s)
    .refine((s) => s === '' || /^https?:\/\//.test(s) || s.startsWith('/'), 'Use a website URL or a path starting with /.').nullable(),
  position: z.number().int().min(0).max(999),
  is_active: z.boolean(),
});

type Ctx = { params: Promise<{ id: string }> };
export const PATCH = (req: Request, { params }: Ctx) => handle(async () => {
  await requireAdmin();
  const { id } = await params;
  const b = schema.parse(await req.json());
  await run('UPDATE categories SET name = ?, description = ?, image_url = ?, position = ?, is_active = ? WHERE id = ?', b.name, b.description || null, b.image_url || null, b.position, b.is_active ? 1 : 0, id);
  const category = await first('SELECT id, name, slug, description, image_url, position, is_active FROM categories WHERE id = ?', id);
  return NextResponse.json({ ok: true, category });
});
