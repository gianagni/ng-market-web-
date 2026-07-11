export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server';
import { normalizePhone } from '@/lib/normalizePhone';
import { otpRatelimit } from '@/lib/ratelimit';

async function sha256Hex(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber } = await request.json();
    const normalized = normalizePhone(phoneNumber);

    const { success } = await otpRatelimit.limit(normalized);
    if (!success) {
      return Response.json({ error: 'Terlalu banyak percobaan, coba lagi nanti' }, { status: 429 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await sha256Hex(otp);

    const { error: insertError } = await supabase.from('otp_verifications').insert({
      user_id: user.id,
      phone_number: normalized,
      otp_hash: otpHash,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    if (insertError) throw insertError;

    const fonnteResponse = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: process.env.FONNTE_API_KEY || '' },
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
