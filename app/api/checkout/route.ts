export const runtime = 'edge'

import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
// @ts-expect-error - midtrans-client tidak menyediakan types resmi
import midtransClient from 'midtrans-client';

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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wa_number, full_name, is_wa_verified')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Gagal ambil data profil.' }, { status: 500 });
    }

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
    let voucherCleanCode = '';

    if (body.voucher_code) {
      voucherCleanCode = String(body.voucher_code).toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
      
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

        // Cek apakah nomor WA ini sudah pernah pakai voucher ini
        const { data: existingUsage } = await supabaseAdmin
          .from('voucher_usage')
          .select('id')
          .eq('voucher_id', voucher.id)
          .eq('wa_number', profile.wa_number)
          .maybeSingle();

        if (existingUsage) {
          return NextResponse.json({ 
            error: 'Voucher ini sudah pernah kamu gunakan dengan nomor WhatsApp ini.' 
          }, { status: 400 });
        }

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
          .eq('id', voucher.id)
          .eq('used_count', voucher.used_count);
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
      if (voucherId) {
        const { data: v } = await supabaseAdmin
          .from('vouchers')
          .select('used_count')
          .eq('id', voucherId)
          .single();
        if (v) {
          await supabaseAdmin
            .from('vouchers')
            .update({ used_count: Math.max(0, v.used_count - 1) })
            .eq('id', voucherId);
        }
      }
      return NextResponse.json({ error: 'Gagal membuat order' }, { status: 500 });
    }

    // Catat pemakaian voucher — dipanggil setelah order berhasil dibuat
    if (voucherId && insertedOrder) {
      await supabaseAdmin.from('voucher_usage').insert({
        voucher_id: voucherId,
        user_id: user.id,
        wa_number: profile.wa_number,
        order_id: insertedOrder.id,
      });
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
    });

    const midtransItems = items.map((i: { package_id: string; price: number; product_name: string; package_name: string }) => ({
      id: i.package_id.toString(),
      price: Math.round(Number(i.price)),
      quantity: 1,
      name: `${i.product_name} - ${i.package_name}`.substring(0, 48)
    }));

    if (discountAmount > 0) {
      midtransItems.push({
        id: 'VOUCHER',
        price: -Math.round(discountAmount),
        quantity: 1,
        name: `Diskon Voucher ${voucherCleanCode}`
      });
    }

    const parameter = {
      transaction_details: {
        order_id: order_code,
        gross_amount: Math.round(grossAmount)
      },
      customer_details: {
        email: user.email,
        first_name: profile.full_name || 'Customer NG Market',
        phone: profile.wa_number
      },
      item_details: midtransItems
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Checkout error:', error);
    const msg = error?.ApiResponse?.error_messages?.[0] || error?.message || 'Kesalahan sistem';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
