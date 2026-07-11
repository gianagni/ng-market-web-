import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// @ts-expect-error - midtrans-client tidak menyediakan types resmi
import midtransClient from 'midtrans-client';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Sesi habis, silakan login ulang.' }, { status: 401 });
    }

    const { order_id } = await request.json();
    if (!order_id) {
      return NextResponse.json({ error: 'Order ID wajib diisi' }, { status: 400 });
    }

    // Ambil order, pastikan milik user ini dan masih pending
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_code, subtotal, customer_id, status, created_at, product_snapshot')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    if (order.customer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order ini sudah tidak bisa dilanjutkan' }, { status: 400 });
    }

    // Cek apakah order udah lewat 24 jam — kalau iya, tolak dan auto-cancel
    const orderAge = Date.now() - new Date(order.created_at).getTime();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (orderAge > TWENTY_FOUR_HOURS) {
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id);
      
      return NextResponse.json({ error: 'Order sudah kadaluarsa, silakan checkout ulang' }, { status: 400 });
    }

    // Ambil profile buat data customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('wa_number, full_name')
      .eq('id', user.id)
      .single();

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
    });

    let items: { nama: string; harga: number }[] = [];
    try {
      items = JSON.parse(order.product_snapshot || '[]');
    } catch {
      items = [];
    }

    const parameter = {
      transaction_details: {
        order_id: order.order_code,
        gross_amount: Math.round(Number(order.subtotal))
      },
      customer_details: {
        email: user.email,
        first_name: profile?.full_name || 'Customer NG Market',
        phone: profile?.wa_number || ''
      },
      item_details: items.length > 0 
        ? items.map((i, idx: number) => ({
            id: `item-${idx}`,
            price: Math.round(Number(i.harga)),
            quantity: 1,
            name: i.nama.substring(0, 48)
          }))
        : [{
            id: 'item-1',
            price: Math.round(Number(order.subtotal)),
            quantity: 1,
            name: 'Produk Digital'
          }]
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      redirect_url: transaction.redirect_url
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Resume checkout error:', error);
    const msg = error?.ApiResponse?.error_messages?.[0] || error?.message || 'Kesalahan sistem';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}