import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Wajib login
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Login dulu ya!' }, { status: 401 });
    }

    const body = await request.json();
    const { code, subtotal } = body;

    if (!code || !subtotal) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Sanitasi input — cegah injection
    const cleanCode = String(code).toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
    if (cleanCode.length < 3 || cleanCode.length > 30) {
      return NextResponse.json({ error: 'Kode voucher tidak valid' }, { status: 400 });
    }

    // Ambil voucher — pakai service role biar bisa baca used_count
    const { data: voucher, error: voucherError } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .single();

    if (voucherError || !voucher) {
      return NextResponse.json({ error: 'Kode voucher tidak ditemukan' }, { status: 404 });
    }

    // Cek expired
    if (new Date(voucher.expired_at) < new Date()) {
      return NextResponse.json({ error: 'Voucher sudah kadaluarsa' }, { status: 400 });
    }

    // Cek kuota
    if (voucher.used_count >= voucher.max_uses) {
      return NextResponse.json({ error: 'Kuota voucher sudah habis' }, { status: 400 });
    }

    // Cek minimum pembelian
    if (Number(subtotal) < Number(voucher.min_purchase)) {
      return NextResponse.json({ 
        error: `Minimum pembelian Rp ${Number(voucher.min_purchase).toLocaleString('id-ID')} untuk pakai voucher ini` 
      }, { status: 400 });
    }

    // Hitung diskon
    let discountAmount = 0;
    if (voucher.type === 'percent') {
      discountAmount = Math.floor((Number(subtotal) * voucher.value) / 100);
      // Cap diskon kalau ada max_discount
      if (voucher.max_discount && discountAmount > voucher.max_discount) {
        discountAmount = voucher.max_discount;
      }
    } else {
      discountAmount = Math.min(voucher.value, Number(subtotal));
    }

    const finalPrice = Math.max(0, Number(subtotal) - discountAmount);

    return NextResponse.json({
      success: true,
      voucher_id: voucher.id,
      code: voucher.code,
      type: voucher.type,
      discount_amount: discountAmount,
      final_price: finalPrice,
      message: `Voucher berhasil! Hemat Rp ${discountAmount.toLocaleString('id-ID')}`
    });

  } catch (error: unknown) {
    console.error('Voucher validate error:', error);
    return NextResponse.json({ error: 'Kesalahan sistem' }, { status: 500 });
  }
}