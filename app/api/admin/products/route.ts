import { NextResponse } from 'next/server';
import { all, batch, uuid } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { handle } from '@/lib/http';
import { productSchema } from '@/lib/schemas';
import { productWriteStatements } from '@/lib/product-write';

export const GET = () => handle(async () => {
  await requireAdmin();
  return NextResponse.json({ products: await all('SELECT p.*, c.name AS category FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.created_at DESC') });
});
export const POST = (req: Request) => handle(async () => {
  await requireAdmin();
  const id = uuid();
  await batch(productWriteStatements(id, productSchema.parse(await req.json()), true));
  return NextResponse.json({ id });
});
