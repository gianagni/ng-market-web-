"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function MfaChallenge() {
  const [code, setCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getFactor() {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) {
        setError('Gagal memuat data MFA');
        setIsLoading(false);
        return;
      }

      const totpFactor = data?.totp?.[0];
      if (totpFactor) {
        setFactorId(totpFactor.id);
      } else {
        // Belum enroll MFA sama sekali, redirect ke setup
        router.push('/admin/mfa-setup');
        return;
      }
      setIsLoading(false);
    }
    getFactor();
  }, [router]);

  async function handleSubmit() {
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
      setCode('');
      setIsVerifying(false);
      return;
    }

    router.push('/admin');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-[4px] border-black border-t-[#ff6b9d] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="bg-white border-[4px] border-black p-8 shadow-[8px_8px_0px_#000] max-w-md w-full">
        <div className="w-14 h-14 bg-[#ffd93d] border-[3px] border-black rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-shield-alt text-xl"></i>
        </div>
        <h1 className="font-bold text-2xl mb-2 font-mono">VERIFIKASI MFA</h1>
        <p className="text-sm font-semibold opacity-70 mb-6">
          Masukkan kode 6 digit dari Google Authenticator / Authy kamu.
        </p>

        <input
          type="text"
          maxLength={6}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, ''));
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="123456"
          autoFocus
          className="w-full border-[3px] border-black p-3 mb-3 text-center text-2xl font-mono tracking-widest outline-none focus:bg-yellow-50"
        />
        {error && <p className="text-[#ff4757] font-bold text-sm mb-3">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={isVerifying || code.length !== 6}
          className="w-full bg-[#66d9ef] border-[3px] border-black py-3 font-bold shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? 'Memverifikasi...' : 'Verifikasi'}
        </button>
      </div>
    </div>
  );
}