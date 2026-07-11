export const runtime = 'edge'

import { createClient } from '../../../../lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/crypto';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { order_id } = await request.json();

  if (!order_id) {
    return NextResponse.json({ error: 'Order ID wajib diisi' }, { status: 400 });
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select('akun_detail, customer_id, status')
    .eq('id', order_id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
  }

  if (order.customer_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (order.status !== 'delivered') {
    return NextResponse.json({ error: 'Akun belum tersedia' }, { status: 400 });
  }

  if (!order.akun_detail) {
    return NextResponse.json({ error: 'Kredensial belum diisi admin' }, { status: 404 });
  }

  const plaintext = await decrypt(order.akun_detail);

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  await supabaseAdmin.from('audit_log').insert({
    actor_id: user.id,
    action: 'reveal_credential',
    table_name: 'orders',
    record_id: order_id,
    new_values: { ip_address: ip },
  });

  return NextResponse.json({ credential: plaintext });
}
