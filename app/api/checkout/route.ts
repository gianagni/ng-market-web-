export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createPayment } from '../../../lib/payment';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateOrderCode(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `NG-${date}-${random}`;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Sesi habis, silakan login ulang.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('wa_number, full_name')
      .eq('id', user.id)
      .single();

    if (!profile?.wa_number) {
      return NextResponse.json({ error: 'Nomor WhatsApp belum diisi. Lengkapi profil dulu!' }, { status: 400 });
    }

    const body = await request.json();
    const items = body.items ?? [{
      package_id: body.package_id,
      product_name: body.product_name,
      package_name: body.package_name ?? body.product_name,
      price: body.price,
    }];

    if (!items.length) {
      return NextResponse.json({ error: 'Tidak ada item untuk dicheckout' }, { status: 400 });
    }

    const originalAmount = items.reduce((sum: number, i: { price: number }) => sum + Number(i.price), 0);

    let discountAmount = 0;
    let voucherId = null;

    if (body.voucher_code) {
      const voucherCleanCode = String(body.voucher_code).toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
      const { data: voucher } = await supabaseAdmin
        .from('vouchers')
        .select('*')
        .eq('code', voucherCleanCode)
        .eq('is_active', true)
        .single();

      if (voucher &&
        new Date(voucher.expired_at) > new Date() &&
        voucher.used_count < voucher.max_uses &&
        originalAmount >= voucher.min_purchase) {

        const { data: existingUsage } = await supabaseAdmin
          .from('voucher_usage')
          .select('id')
          .eq('voucher_id', voucher.id)
          .eq('wa_number', profile.wa_number)
          .maybeSingle();

        if (!existingUsage) {
          if (voucher.type === 'percent') {
            discountAmount = Math.floor((originalAmount * voucher.value) / 100);
            if (voucher.max_discount && discountAmount > voucher.max_discount) {
              discountAmount = voucher.max_discount;
            }
          } else {
            discountAmount = Math.min(voucher.value, originalAmount);
          }
          voucherId = voucher.id;
          await supabaseAdmin
            .from('vouchers')
            .update({ used_count: voucher.used_count + 1 })
            .eq('id', voucher.id);
        }
      }
    }

    const grossAmount = Math.max(0, originalAmount - discountAmount);
    const order_code = generateOrderCode();

    const snapshotData = JSON.stringify(items.map((i: { product_name: string; package_id: string; price: number }) => ({
      nama: i.product_name,
      package_id: i.package_id,
      harga: i.price,
      snapshot_at: new Date().toISOString()
    })));

    const { data: insertedOrder, error: insertError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        package_id: items[0].package_id,
        subtotal: grossAmount,
        status: 'pending',
        order_code,
        customer_wa: profile.wa_number,
        product_snapshot: snapshotData,
        package_snapshot: snapshotData,
        voucher_id: voucherId,
        discount_amount: discountAmount,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Insert order error:', insertError);
      return NextResponse.json({ error: 'Gagal membuat order' }, { status: 500 });
    }

    if (voucherId && insertedOrder) {
      await supabaseAdmin.from('voucher_usage').insert({
        voucher_id: voucherId,
        user_id: user.id,
        wa_number: profile.wa_number,
        order_id: insertedOrder.id,
      });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://market.gianagni.my.id';
    const productNames = items.map((i: { product_name: string; package_name: string }) => 
      `${i.product_name} - ${i.package_name}`).join(', ');

    const payment = await createPayment({
      orderCode: order_code,
      amount: grossAmount,
      description: productNames.substring(0, 100),
      returnUrl: `${siteUrl}/dashboard?order=${order_code}`,
      notifyUrl: `${siteUrl}/api/webhook/temanqris`,
    });

    return NextResponse.json({
      success: true,
      redirect_url: payment.paymentUrl,
      link_code: payment.linkCode,
      order_code,
    });

  } catch (error: unknown) {
    console.error('Checkout error:', error);
    const msg = error instanceof Error ? error.message : 'Kesalahan sistem';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
