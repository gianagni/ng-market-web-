import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { normalizePhone } from '@/lib/normalizePhone';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber, otp } = await request.json();
    const normalized = normalizePhone(phoneNumber);
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    // Ambil OTP terbaru yang masih aktif untuk nomor ini[cite: 2]
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

    // Cek Expired[cite: 2]
    if (new Date(record.expires_at) < new Date()) {
      return Response.json({ error: 'Kode sudah kadaluarsa (lebih dari 5 menit)' }, { status: 400 });
    }

    // Cek limit percobaan salah (maksimal 5x)[cite: 2]
    if (record.attempts >= record.max_attempts) {
      return Response.json({ error: 'Terlalu banyak percobaan salah, silakan kirim ulang kode' }, { status: 400 });
    }

    // Cek kecocokan hash OTP[cite: 2]
    if (record.otp_hash !== otpHash) {
      // Tambah jumlah attempt kalau salah[cite: 2]
      await supabase
        .from('otp_verifications')
        .update({ attempts: record.attempts + 1 })
        .eq('id', record.id);
      return Response.json({ error: 'Kode OTP salah' }, { status: 400 });
    }

    // OTP BENAR! Tandai verified di tabel otp_verifications dan update profile user[cite: 2]
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