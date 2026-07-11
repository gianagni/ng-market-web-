import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Kita pake client standar buat nembus RLS
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // 1. Ambil body request dari Midtrans
    const body = await request.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;
    
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    
    // 2. Verifikasi Keamanan Signature (Anti-Hacker)
    const hashed = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + serverKey)
      .digest('hex');

    if (hashed !== signature_key) {
      console.error('Peringatan: Ada percobaan tembak Webhook palsu!');
      return NextResponse.json({ error: 'Invalid Signature' }, { status: 403 });
    }

    // 3. Bikin instance Supabase pakai Master Key (Service Role)
    // Ingat: Webhook nggak punya cookies/session, jadi kita harus bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Cek validitas order di Database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_code', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    if (order.status === 'delivered') {
      return NextResponse.json({ status: 'Already processed' });
    }

    // 5. Handle Status Pembayaran
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      
      // -- INTI SISTEM AUTO-PILOT --
      const { data: isAutomated, error: rpcError } = await supabaseAdmin.rpc('auto_assign_stock_from_pool', {
        p_order_id: order.id,
        p_package_id: order.package_id, 
        p_key: process.env.CREDENTIAL_ENCRYPTION_KEY!,
      });

      if (rpcError) {
        console.error('Gagal assign stock:', rpcError);
        throw rpcError;
      }

      if (isAutomated) {
        // Stok sukses dikasih. Lanjut naikin stats/tier user!
        await supabaseAdmin.rpc('increment_customer_stats', {
          p_customer_id: order.customer_id,
          p_amount: order.subtotal,
        });
      } else {
        // Stok habis bro! Lempar ke status processing biar admin isi manual
        await supabaseAdmin.from('orders').update({ status: 'processing' }).eq('id', order.id);
      }

    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      // User kelamaan bayar atau dibatalkan
      await supabaseAdmin.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
    }

    // 6. Kasih jempol (200 OK) ke Midtrans biar dia nggak nge-ping terus
    return NextResponse.json({ success: true, message: 'Webhook sukses dieksekusi' });

    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook Error:', errorMessage);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}