import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';
export const POST = async () => { await clearSession('admin'); return NextResponse.json({ ok: true }); };
