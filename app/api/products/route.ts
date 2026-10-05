import { NextResponse } from 'next/server';
import { all, inList } from '@/lib/db';
import { handle } from '@/lib/http';
// Public: lightweight product lookup for the cart. Only active products, only public fields.
export const GET = (req: Request) => handle(async () => {
  const ids = (new URL(req.url).searchParams.get('ids') ?? '').split(',').filter((i) => /^[0-9a-f-]{36}$/.test(i)).slice(0, 50);
  if (!ids.length) return NextResponse.json({ products: [] });
  return NextResponse.json({ products: await all(`SELECT id, name, slug, price_paise, stock FROM products WHERE is_active = 1 AND id IN (${inList(ids.length)})`, ...ids) });
});
