export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function sha256Hex(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      reference_id,   // order_code kita
      status,         // success, pending, failed
      amount,
      signature: incomingSignature,
    } = body;

    // Verifikasi signature dari iPaymu
    const va = process.env.IPAYMU_VA!;
    const apiKey = process.env.IPAYMU_API_KEY!;
    const expectedSignature = await sha256Hex(`${va}:${apiKey}:${amount}`);

    if (incomingSignature !== expectedSignature) {
      console.error('Invalid iPaymu webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_code', reference_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    if (order.status === 'delivered') {
      return NextResponse.json({ status: 'Already processed' });
    }

    if (status === 'berhasil' || status === 'success') {
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
        await supabaseAdmin
          .from('orders')
          .update({ status: 'processing' })
          .eq('id', order.id);
      }

    } else if (status === 'gagal' || status === 'failed' || status === 'expired') {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('iPaymu Webhook Error:', msg);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
