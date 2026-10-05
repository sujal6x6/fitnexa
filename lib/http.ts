import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const clientIp = (req: Request) => req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try { return await fn(); } catch (e) {
    if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof ZodError) return NextResponse.json({ error: 'Please check the highlighted fields.', details: e.flatten().fieldErrors }, { status: 400 });
    if (e instanceof Error && /UNIQUE constraint failed/i.test(e.message)) return NextResponse.json({ error: 'That value already exists (duplicate SKU, slug or email).' }, { status: 409 });
    console.error(e);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
