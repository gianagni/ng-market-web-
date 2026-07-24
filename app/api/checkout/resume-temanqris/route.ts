export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { createPayment } from '../../../../lib/payment';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { order_code } = await request.json();
    if (!order_code) return NextResponse.json({ error: 'order_code wajib diisi' }, { status: 400 });

    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('order_code', order_code)
      .eq('customer_id', user.id)
      .single();

    if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://market.gianagni.my.id';

    const payment = await createPayment({
      orderCode: order.order_code,
      amount: order.subtotal,
      description: `Resume Order ${order.order_code}`,
      returnUrl: `${siteUrl}/dashboard?order=${order.order_code}`,
      notifyUrl: `${siteUrl}/api/webhook/temanqris`,
    });

    return NextResponse.json({ redirect_url: payment.paymentUrl });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Kesalahan sistem';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
