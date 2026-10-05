import { NextResponse } from 'next/server';
import { z } from 'zod';
import { first } from '@/lib/db';
import { markOrderPaid, verifyPaymentSignature } from '@/lib/razorpay';
import { clientIp, handle, HttpError } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';

const schema = z.object({ razorpay_order_id: z.string(), razorpay_payment_id: z.string(), razorpay_signature: z.string() });
export const POST = (req: Request) => handle(async () => {
  await rateLimit('verify:' + clientIp(req), 20, 10 * 60_000);
  const b = schema.parse(await req.json());
  // Never trust the browser: payment is only accepted if the HMAC signature (made with our secret key) is valid.
  if (!(await verifyPaymentSignature(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature))) throw new HttpError(400, 'Payment verification failed.');
  if (!(await first('SELECT id FROM payments WHERE razorpay_order_id = ?', b.razorpay_order_id))) throw new HttpError(404, 'Unknown payment.');
  await markOrderPaid(b.razorpay_order_id, b.razorpay_payment_id);
  return NextResponse.json({ ok: true });
});
