import { NextResponse } from 'next/server';
import { batch, run } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { handle } from '@/lib/http';
import { productSchema } from '@/lib/schemas';
import { productWriteStatements } from '@/lib/product-write';

type Ctx = { params: Promise<{ id: string }> };
export const PATCH = (req: Request, { params }: Ctx) => handle(async () => {
  await requireAdmin(); const { id } = await params;
  await batch(productWriteStatements(id, productSchema.parse(await req.json()), false));
  return NextResponse.json({ ok: true });
});
export const DELETE = (_: Request, { params }: Ctx) => handle(async () => {
  await requireAdmin(); const { id } = await params;
  await run('DELETE FROM products WHERE id = ?', id); // order history keeps its own snapshot of name/price
  return NextResponse.json({ ok: true });
});
