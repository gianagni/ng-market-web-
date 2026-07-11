import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const { data: record, error: fetchError } = await supabaseAdmin
      .from('password_reset_otp')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !record) {
      return NextResponse.json({ error: 'Kode tidak ditemukan, silakan kirim ulang' }, { status: 400 });
    }

    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Kode sudah kadaluarsa' }, { status: 400 });
    }

    if (record.attempts >= record.max_attempts) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan salah, kirim ulang kode' }, { status: 400 });
    }

    if (record.otp_hash !== otpHash) {
      await supabaseAdmin
        .from('password_reset_otp')
        .update({ attempts: record.attempts + 1 })
        .eq('id', record.id);
      return NextResponse.json({ error: 'Kode salah' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Check OTP error:', error);
    return NextResponse.json({ error: 'Kesalahan sistem' }, { status: 500 });
  }
}