export const runtime = 'edge'

import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resetRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '15 m'),
  prefix: 'pwreset',
});

async function sha256Hex(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { success } = await resetRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan, coba lagi nanti' }, { status: 429 });
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('wa_number')
      .eq('id', user.id)
      .single();

    if (!profile?.wa_number) {
      return NextResponse.json({ 
        error: 'Akun ini belum memiliki nomor WhatsApp terdaftar. Hubungi admin untuk bantuan.' 
      }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await sha256Hex(otp);

    await supabaseAdmin.from('password_reset_otp').insert({
      user_id: user.id,
      email: email.toLowerCase(),
      otp_hash: otpHash,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    const fonnteResponse = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: process.env.FONNTE_API_KEY || '' },
      body: new URLSearchParams({
        target: profile.wa_number,
        message: `Kode reset password NG Market kamu: ${otp}. Berlaku 5 menit. Jangan bagikan ke siapapun.`,
      }),
    });

    if (!fonnteResponse.ok) {
      console.error('Gagal kirim via Fonnte:', await fonnteResponse.text());
      return NextResponse.json({ error: 'Gagal mengirim kode ke WhatsApp' }, { status: 500 });
    }

    return NextResponse.json({ success: true, wa_hint: profile.wa_number.slice(-4) });

  } catch (error) {
    console.error('Forgot password send error:', error);
    return NextResponse.json({ error: 'Kesalahan sistem' }, { status: 500 });
  }
}
