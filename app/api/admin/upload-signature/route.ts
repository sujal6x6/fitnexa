import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { env } from '@/lib/env';
import { handle } from '@/lib/http';
import { hex, utf8 } from '@/lib/encoding';
// Signed direct-to-Cloudinary upload: the API secret never leaves the server.
export const GET = () => handle(async () => {
  await requireAdmin();
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: 'Image upload storage is not configured yet.' }, { status: 503 });
  }
  const timestamp = Math.floor(Date.now() / 1000), folder = 'fitnexa/products';
  const signature = hex(await crypto.subtle.digest('SHA-1', utf8.encode(`folder=${folder}&timestamp=${timestamp}${env('CLOUDINARY_API_SECRET')}`)));
  return NextResponse.json({ timestamp, folder, signature, apiKey: env('CLOUDINARY_API_KEY'), cloudName: env('CLOUDINARY_CLOUD_NAME') });
});
