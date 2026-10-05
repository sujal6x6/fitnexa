import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// First line of defence for /admin and /api/admin. Every admin route ALSO calls requireAdmin().
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/admin/login' || pathname === '/api/admin/login') return NextResponse.next();
  const token = req.cookies.get('fx_admin')?.value;
  let ok = false;
  if (token && process.env.AUTH_SECRET) {
    try { const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET)); ok = payload.role === 'admin'; } catch {}
  }
  if (ok) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.redirect(new URL('/admin/login', req.url));
}
export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
