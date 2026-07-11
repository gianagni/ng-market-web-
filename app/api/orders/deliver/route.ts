export const runtime = 'edge'

import { createClient } from '../../../../lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/crypto';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { order_id, credential } = await request.json();

  if (!order_id) {
    return NextResponse.json({ error: 'Order ID wajib diisi' }, { status: 400 });
  }

  if (!credential?.trim()) {
    return NextResponse.json({ error: 'Kredensial tidak boleh kosong' }, { status: 400 });
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, customer_id, subtotal, status, customer_wa')
    .eq('id', order_id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
  }

  if (order.status === 'delivered') {
    return NextResponse.json({ error: 'Order sudah delivered sebelumnya' }, { status: 400 });
  }

  if (!order.customer_id) {
    return NextResponse.json({ error: 'Order ini tidak terikat ke akun user' }, { status: 400 });
  }

  const encryptedCredential = await encrypt(credential.trim());

  const { error: updateOrderError } = await supabaseAdmin
    .from('orders')
    .update({ 
      status: 'delivered', 
      delivered_at: new Date().toISOString(),
      akun_detail: encryptedCredential,
    })
    .eq('id', order.id);

  if (updateOrderError) {
    return NextResponse.json({ error: 'Gagal update order' }, { status: 500 });
  }

  const { error: rpcError } = await supabaseAdmin.rpc('increment_customer_stats', {
    p_customer_id: order.customer_id,
    p_amount: order.subtotal,
  });

  if (rpcError) {
    console.error('Gagal update profile stats:', rpcError);
  }

  if (order.customer_wa) {
    try {
      await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { Authorization: process.env.FONNTE_API_KEY || '' },
        body: new URLSearchParams({
          target: order.customer_wa,
          message: `Halo! Pesanan kamu di NG Market sudah selesai diproses. Silakan cek dashboard kamu untuk melihat detail akun yang sudah dikirim. Terima kasih sudah berbelanja! 🎉\n\n${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
        }),
      });
    } catch (e) {
      console.error('Gagal kirim notif WA:', e);
    }
  }

  await supabaseAdmin.from('audit_log').insert({
    actor_id: user.id,
    action: 'deliver_order',
    table_name: 'orders',
    record_id: order.id,
    new_values: { status: 'delivered' },
  });

  return NextResponse.json({ success: true });
}
