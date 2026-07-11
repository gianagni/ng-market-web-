"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password minimal 8 karakter';
  if (!/[A-Z]/.test(password)) return 'Password harus ada huruf besar';
  if (!/[a-z]/.test(password)) return 'Password harus ada huruf kecil';
  if (!/[0-9]/.test(password)) return 'Password harus ada angka';
  return null;
}

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Supabase otomatis bikin sesi sementara dari link reset password
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasValidSession(!!session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const pwError = validatePassword(password);
    if (pwError) {
      setMessage({ text: pwError, type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: 'Konfirmasi password tidak cocok', type: 'error' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage({ text: error.message, type: 'error' });
      return;
    }

    setMessage({ text: 'Password berhasil diubah! Mengarahkan ke beranda...', type: 'success' });
    setTimeout(() => router.push('/'), 2000);
  };

  if (hasValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-[4px] border-black border-t-[#ff6b9d] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="bg-white border-[4px] border-black p-8 shadow-[8px_8px_0px_#000] max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#ff4757] border-[4px] border-black rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-2xl text-white"></i>
          </div>
          <h1 className="font-bold text-xl mb-2">Link Tidak Valid</h1>
          <p className="text-sm font-semibold opacity-70">
            Link reset password sudah kadaluarsa atau tidak valid. Silakan minta link baru.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="bg-white border-[4px] border-black p-8 shadow-[8px_8px_0px_#000] max-w-md w-full">
        <h1 className="font-bold text-2xl mb-2 font-mono">RESET PASSWORD</h1>
        <p className="text-sm font-semibold opacity-70 mb-6">
          Masukkan password baru kamu.
        </p>

        {message && (
          <div className={`mb-4 p-3 border-[3px] border-black font-bold text-sm shadow-[3px_3px_0px_#000] ${message.type === 'error' ? 'bg-[#ff4757] text-white' : 'bg-[#a8e6cf] text-black'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-bold text-sm mb-1">Password Baru</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-[3px] border-black px-4 py-2.5 outline-none font-semibold focus:bg-yellow-50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block font-bold text-sm mb-1">Konfirmasi Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border-[3px] border-black px-4 py-2.5 outline-none font-semibold focus:bg-yellow-50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#66d9ef] border-[3px] border-black py-3 font-bold shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all disabled:opacity-70 mt-2"
          >
            {loading ? 'Menyimpan...' : 'Ubah Password'}
          </button>
        </form>
      </div>
    </div>
  );
}