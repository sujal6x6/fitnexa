import { NextResponse } from 'next/server';
import { z } from 'zod';
import { priceCart } from '@/lib/pricing';
import { handle } from '@/lib/http';

const cartSchema = z.object({ items: z.array(z.object({ productId: z.string().uuid(), qty: z.number().int().min(1).max(20) })).min(1).max(30), couponCode: z.string().max(40).optional().nullable() });
export const POST = (req: Request) => handle(async () => {
  const b = cartSchema.parse(await req.json());
  return NextResponse.json(await priceCart(b.items, b.couponCode, false));
});
