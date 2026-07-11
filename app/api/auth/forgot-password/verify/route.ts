export const runtime = 'edge'

import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sha256Hex(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password tidak memenuhi syarat keamanan' }, { status: 400 });
    }

    const otpHash = await sha256Hex(otp);

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

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      record.user_id,
      { password: newPassword }
    );

    if (updateError) {
      return NextResponse.json({ error: 'Gagal mengubah password' }, { status: 500 });
    }

    await supabaseAdmin
      .from('password_reset_otp')
      .update({ verified: true })
      .eq('id', record.id);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Forgot password verify error:', error);
    return NextResponse.json({ error: 'Kesalahan sistem' }, { status: 500 });
  }
}
