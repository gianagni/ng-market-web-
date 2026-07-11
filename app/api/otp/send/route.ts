export const runtime = 'edge'

import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { normalizePhone } from '@/lib/normalizePhone';
import { otpRatelimit } from '@/lib/ratelimit';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber } = await request.json();
    const normalized = normalizePhone(phoneNumber);

    // Rate limit via Redis (atomic, race-condition safe)
    const { success } = await otpRatelimit.limit(normalized);
    if (!success) {
      return Response.json({ error: 'Terlalu banyak percobaan, coba lagi nanti' }, { status: 429 });
    }

    // Generate 6 digit OTP & Hash pakai SHA-256
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    // Simpan history ke database
    const { error: insertError } = await supabase.from('otp_verifications').insert({
      user_id: user.id,
      phone_number: normalized,
      otp_hash: otpHash,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    if (insertError) throw insertError;

    // Tembak API Fonnte
    const fonnteResponse = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 
        Authorization: process.env.FONNTE_API_KEY || '' 
      },
      body: new URLSearchParams({
        target: normalized,
        message: `Kode verifikasi NG Market kamu: ${otp}. Berlaku 5 menit. Jangan bagikan ke siapapun.`,
      }),
    });

    if (!fonnteResponse.ok) {
      console.error("Gagal kirim via Fonnte:", await fonnteResponse.text());
      return Response.json({ error: 'Gagal mengirim pesan WhatsApp via Fonnte' }, { status: 500 });
    }

    return Response.json({ success: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error OTP Send:", error);
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
