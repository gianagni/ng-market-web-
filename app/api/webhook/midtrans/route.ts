export const runtime = 'edge'

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function sha512Hex(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-512', encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;
    
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    
    const hashed = await sha512Hex(order_id + status_code + gross_amount + serverKey);

    if (hashed !== signature_key) {
      console.error('Peringatan: Ada percobaan tembak Webhook palsu!');
      return NextResponse.json({ error: 'Invalid Signature' }, { status: 403 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
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
        await supabaseAdmin.rpc('increment_customer_stats', {
          p_customer_id: order.customer_id,
          p_amount: order.subtotal,
        });
      } else {
        await supabaseAdmin.from('orders').update({ status: 'processing' }).eq('id', order.id);
      }

    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      await supabaseAdmin.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
    }

    return NextResponse.json({ success: true, message: 'Webhook sukses dieksekusi' });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook Error:', errorMessage);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
