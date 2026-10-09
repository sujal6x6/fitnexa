import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { handle } from '@/lib/http';
import { first, run, uuid } from '@/lib/db';

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const schema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().max(90).optional(),
  description: z.string().trim().max(240).nullable().optional(),
  image_url: z.string().trim().max(850000, 'Image is too large. Please use a smaller image.')
    .transform((s) => s && !/^https?:\/\//.test(s) && !s.startsWith('/') && !/^data:image\//i.test(s) ? `/${s}` : s)
    .refine((s) => s === '' || /^https?:\/\//.test(s) || s.startsWith('/') || /^data:image\/(png|jpe?g|webp);base64,/i.test(s), 'Use a website URL, uploaded image, or path starting with /.').nullable().optional(),
  position: z.number().int().min(0).max(999).optional(),
});

export const POST = (req: Request) => handle(async () => {
  await requireAdmin();
  const b = schema.parse(await req.json());
  const id = uuid(), slug = slugify(b.slug || b.name);
  await run('INSERT INTO categories (id, name, slug, description, image_url, position, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)', id, b.name, slug, b.description || null, b.image_url || null, b.position ?? 99);
  const category = await first('SELECT id, name, slug, description, image_url, position, is_active FROM categories WHERE id = ?', id);
  return NextResponse.json({ ok: true, category }, { status: 201 });
});
