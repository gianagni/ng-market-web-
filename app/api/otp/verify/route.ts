export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server';
import { normalizePhone } from '@/lib/normalizePhone';

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

    const { phoneNumber, otp } = await request.json();
    const normalized = normalizePhone(phoneNumber);
    const otpHash = await sha256Hex(otp);

    const { data: record, error: fetchError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone_number', normalized)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !record) {
      return Response.json({ error: 'Kode tidak ditemukan, silakan kirim ulang' }, { status: 400 });
    }

    if (new Date(record.expires_at) < new Date()) {
      return Response.json({ error: 'Kode sudah kadaluarsa (lebih dari 5 menit)' }, { status: 400 });
    }

    if (record.attempts >= record.max_attempts) {
      return Response.json({ error: 'Terlalu banyak percobaan salah, silakan kirim ulang kode' }, { status: 400 });
    }

    if (record.otp_hash !== otpHash) {
      await supabase
        .from('otp_verifications')
        .update({ attempts: record.attempts + 1 })
        .eq('id', record.id);
      return Response.json({ error: 'Kode OTP salah' }, { status: 400 });
    }

    await supabase.from('otp_verifications').update({ verified: true }).eq('id', record.id);
    await supabase
      .from('profiles')
      .update({ wa_number: normalized, is_wa_verified: true })
      .eq('id', user.id);

    return Response.json({ success: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error OTP Verify:", error);
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
