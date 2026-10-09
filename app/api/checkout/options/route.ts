import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';
import { handle } from '@/lib/http';

export const GET = () => handle(async () => {
  const s = await getSettings();
  return NextResponse.json({
    whatsapp: !!s.orders.enable_whatsapp_pay,
    cod: !!s.orders.enable_cod,
    razorpay: !!s.orders.enable_razorpay,
    whatsappNumber: s.contact.whatsapp || s.contact.phone_order,
  });
});
