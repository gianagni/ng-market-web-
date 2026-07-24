export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function hmacSha256(key: string, message: string): Promise<string> {
  const keyBytes = new TextEncoder().encode(key);
  const msgBytes = new TextEncoder().encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, msgBytes);
  return 'sha256=' + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-temanqris-signature') || '';
    const webhookSecret = process.env.TEMANQRIS_WEBHOOK_SECRET!;

    const expected = await hmacSha256(webhookSecret, rawBody);
    if (signature !== expected) {
      console.error('Invalid TemanQRIS webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;
    const orderId = data?.order_id;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_code', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    if (event === 'payment.confirmed') {
      if (order.status === 'delivered') {
        return NextResponse.json({ status: 'Already processed' });
      }

      const { data: isAutomated, error: rpcError } = await supabaseAdmin.rpc('auto_assign_stock_from_pool', {
        p_order_id: order.id,
        p_package_id: order.package_id,
        p_key: process.env.CREDENTIAL_ENCRYPTION_KEY!,
      });

      if (rpcError) {
        console.error('Gagal assign stock:', rpcError);
        await supabaseAdmin.from('orders').update({ status: 'processing' }).eq('id', order.id);
      } else if (isAutomated) {
        await supabaseAdmin.rpc('increment_customer_stats', {
          p_customer_id: order.customer_id,
          p_amount: order.subtotal,
        });

        // Kirim notif WA ke customer
        if (order.customer_wa) {
          try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://market.gianagni.my.id';
            await fetch('https://api.fonnte.com/send', {
              method: 'POST',
              headers: { Authorization: process.env.FONNTE_API_KEY || '' },
              body: new URLSearchParams({
                target: order.customer_wa,
                message: `Halo! Pesanan kamu di NG Market sudah selesai diproses. Silakan cek dashboard untuk melihat detail akun. Terima kasih! 🎉\n\n${siteUrl}/dashboard`,
              }),
            });
          } catch (e) {
            console.error('Gagal kirim notif WA:', e);
          }
        }
      } else {
        await supabaseAdmin.from('orders').update({ status: 'processing' }).eq('id', order.id);
      }

    } else if (event === 'payment.awaiting_confirmation') {
      // Update status jadi awaiting_confirmation biar keliatan di admin
      await supabaseAdmin
        .from('orders')
        .update({ status: 'awaiting_payment' })
        .eq('id', order.id);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('TemanQRIS Webhook Error:', msg);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
