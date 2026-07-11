"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function MfaSetup() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function enroll() {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) {
        setError(error.message);
        return;
      }
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
    }
    enroll();
  }, []);

  async function handleVerify() {
    if (code.length !== 6) {
      setError('Kode harus 6 digit');
      return;
    }

    setIsVerifying(true);
    setError('');

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setError(challengeError.message);
      setIsVerifying(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    if (verifyError) {
      setError('Kode salah, coba lagi');
      setIsVerifying(false);
      return;
    }

    router.push('/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="bg-white border-[4px] border-black p-8 shadow-[8px_8px_0px_#000] max-w-md w-full">
        <h1 className="font-bold text-2xl mb-2 font-mono">SETUP MFA ADMIN</h1>
        <p className="text-sm font-semibold opacity-70 mb-4">
          Scan QR ini pakai Google Authenticator / Authy, lalu masukkan kode 6 digit.
        </p>

        {qrCode && (
          <div
            className="border-[3px] border-black p-4 mb-4 flex justify-center"
            dangerouslySetInnerHTML={{ __html: qrCode }}
          />
        )}

        {secret && (
          <div className="mb-4 p-3 bg-gray-100 border-[2px] border-black">
            <p className="text-xs font-bold mb-1">Kalau scan QR gagal, masukkan kode manual ini di app (pilih &quot;Enter a setup key&quot;):</p>
            <p className="font-mono text-sm break-all select-all">{secret}</p>
          </div>
        )}

        <input
          type="text"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="123456"
          className="w-full border-[3px] border-black p-3 mb-3 text-center text-xl font-mono outline-none focus:bg-yellow-50"
        />
        {error && <p className="text-[#ff4757] font-bold text-sm mb-3">{error}</p>}
        <button
          onClick={handleVerify}
          disabled={isVerifying}
          className="w-full bg-[#66d9ef] border-[3px] border-black py-3 font-bold shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all disabled:opacity-70"
        >
          {isVerifying ? 'Memverifikasi...' : 'Aktifkan MFA'}
        </button>
      </div>
    </div>
  );
}