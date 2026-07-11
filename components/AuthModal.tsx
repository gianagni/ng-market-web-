"use client";
import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import { Turnstile } from '@marsidev/react-turnstile';
import Link from 'next/link';

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password minimal 8 karakter';
  if (!/[A-Z]/.test(password)) return 'Password harus ada huruf besar';
  if (!/[a-z]/.test(password)) return 'Password harus ada huruf kecil';
  if (!/[0-9]/.test(password)) return 'Password harus ada angka';
  return null;
}

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Forgot password flow — 4 tahap
  const [forgotStep, setForgotStep] = useState<'closed' | 'email' | 'otp' | 'newpass'>('closed');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verifiedOtp, setVerifiedOtp] = useState(''); // simpan OTP yang sudah tervalidasi untuk dipakai di step terakhir
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [sendingReset, setSendingReset] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [submittingNewPass, setSubmittingNewPass] = useState(false);
  const [waHint, setWaHint] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openAuthModal', handleOpen);
    return () => window.removeEventListener('openAuthModal', handleOpen);
  }, []);

  const resetForm = () => {
    setMessage(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setCaptchaToken('');
    setForgotStep('closed');
    setForgotEmail('');
    setOtpCode('');
    setVerifiedOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setWaHint('');
  };

  const passwordError = mode === 'register' ? validatePassword(password) : null;
  const newPasswordError = forgotStep === 'newpass' ? validatePassword(newPassword) : null;
  const confirmMismatch = forgotStep === 'newpass' && confirmNewPassword.length > 0 && newPassword !== confirmNewPassword;

  // Step 1: kirim OTP ke WA
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingReset(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim kode');
      }

      setWaHint(data.wa_hint || '');
      setForgotStep('otp');
      setMessage({ 
        text: data.wa_hint 
          ? `Kode OTP dikirim ke WhatsApp yang berakhiran ${data.wa_hint}.`
          : 'Jika email terdaftar, kode OTP sudah dikirim ke WhatsApp kamu.',
        type: 'success' 
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setSendingReset(false);
    }
  };

  // Step 2: verifikasi OTP saja (tanpa password dulu)
  const handleVerifyOtpOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (otpCode.length !== 6) {
      setMessage({ text: 'Kode OTP harus 6 digit', type: 'error' });
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch('/api/auth/forgot-password/check-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: otpCode })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Kode salah');
      }

      setVerifiedOtp(otpCode);
      setForgotStep('newpass');
      setMessage(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Step 3: submit password baru
  const handleSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const pwError = validatePassword(newPassword);
    if (pwError) {
      setMessage({ text: pwError, type: 'error' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage({ text: 'Konfirmasi password tidak cocok', type: 'error' });
      return;
    }

    setSubmittingNewPass(true);
    try {
      const res = await fetch('/api/auth/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: verifiedOtp, newPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengubah password');
      }

      setMessage({ text: 'Password berhasil diubah! Silakan login dengan password baru.', type: 'success' });
      setTimeout(() => {
        resetForm();
        setMode('login');
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setSubmittingNewPass(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'register') {
        const pwError = validatePassword(password);
        if (pwError) {
          throw new Error(pwError);
        }

        if (!captchaToken) {
          throw new Error('Selesaikan verifikasi keamanan dulu');
        }

        const captchaRes = await fetch('/api/auth/verify-captcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: captchaToken })
        });
        const captchaData = await captchaRes.json();

        if (!captchaData.success) {
          throw new Error('Verifikasi keamanan gagal, coba lagi');
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName } 
          }
        });
        if (error) throw error;
        setMessage({ text: 'Akun berhasil dibuat! Cek email kamu dan klik link verifikasi sebelum bisa login.', type: 'success' });
        setMode('login');
        setCaptchaToken('');
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error);
        }

        setMessage({ text: 'Login berhasil!', type: 'success' });
        setTimeout(() => setIsOpen(false), 1000);

        await supabase.auth.refreshSession();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-[999999] flex items-center justify-center p-4 animate-in fade-in overflow-y-auto"
      onClick={(e) => { 
        if (e.target === e.currentTarget) {
          setIsOpen(false);
          resetForm();
        } 
      }}
    >
      <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_#000] w-full max-w-md animate-in zoom-in-95 flex flex-col rounded-none my-8 max-h-[90vh] overflow-y-auto">
        
        <div className="bg-[#66d9ef] border-b-[4px] border-black p-3 flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-bold text-lg font-mono flex items-center gap-2">
            <i className="fas fa-user-circle"></i> AKUN NG MARKET
          </h3>
          <button 
            onClick={() => { setIsOpen(false); resetForm(); }} 
            className="bg-[#ff4757] border-[3px] border-black text-white w-8 h-8 font-bold shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
          >
            X
          </button>
        </div>

        {forgotStep === 'closed' && (
          <div className="flex border-b-[4px] border-black">
            <button 
              onClick={() => { setMode('login'); resetForm(); }} 
              className={`flex-1 py-3 font-bold text-sm border-r-[4px] border-black transition-colors ${
                mode === 'login' ? 'bg-[#ffd93d]' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button 
              onClick={() => { setMode('register'); resetForm(); }} 
              className={`flex-1 py-3 font-bold text-sm transition-colors ${
                mode === 'register' ? 'bg-[#ffd93d]' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Daftar Baru
            </button>
          </div>
        )}

        <div className="p-6">
          {message && (
            <div className={`mb-4 p-3 border-[3px] border-black font-bold text-sm shadow-[3px_3px_0px_#000] ${message.type === 'error' ? 'bg-[#ff4757] text-white' : 'bg-[#a8e6cf] text-black'}`}>
              <i className={`fas ${message.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'} mr-2`}></i> 
              {message.text}
            </div>
          )}

          {/* STEP 1: Input email */}
          {forgotStep === 'email' && (
            <form onSubmit={handleSendResetOtp} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
              <h4 className="font-bold text-lg">Lupa Password?</h4>
              <p className="text-sm font-semibold opacity-70">
                Masukkan email akun kamu, kami akan kirim kode OTP ke nomor WhatsApp terdaftar.
              </p>
              <div>
                <label className="block font-bold text-sm mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="user@email.com" 
                  className="w-full border-[3px] border-black px-4 py-2 outline-none font-semibold focus:bg-yellow-50 transition-colors" 
                />
              </div>
              <button 
                type="submit" 
                disabled={sendingReset}
                className="w-full bg-[#66d9ef] text-black border-[3px] border-black py-3 font-bold shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all mt-2 uppercase tracking-wider disabled:opacity-70"
              >
                {sendingReset ? 'Mengirim...' : 'Kirim Kode OTP'}
              </button>
              <button 
                type="button" 
                onClick={() => { setForgotStep('closed'); setMessage(null); }}
                className="text-xs font-bold text-gray-500 hover:text-black self-center underline"
              >
                Kembali ke login
              </button>
            </form>
          )}

          {/* STEP 2: Input OTP saja */}
          {forgotStep === 'otp' && (
            <form onSubmit={handleVerifyOtpOnly} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
              <h4 className="font-bold text-lg">Masukkan Kode OTP</h4>
              <p className="text-sm font-semibold opacity-70">
                Kode 6 digit dikirim ke WhatsApp{waHint ? ` berakhiran ${waHint}` : ''}. Berlaku 5 menit.
              </p>
              <div>
                <label className="block font-bold text-sm mb-1">Kode OTP</label>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  autoFocus
                  className="w-full border-[3px] border-black px-4 py-3 outline-none font-bold tracking-[0.5em] text-center text-2xl focus:bg-yellow-50 transition-colors" 
                />
              </div>
              <button 
                type="submit" 
                disabled={verifyingOtp || otpCode.length !== 6}
                className="w-full bg-[#66d9ef] text-black border-[3px] border-black py-3 font-bold shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all mt-2 uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {verifyingOtp ? 'Memverifikasi...' : 'Verifikasi Kode'}
              </button>
              <button 
                type="button" 
                onClick={() => { setForgotStep('email'); setMessage(null); setOtpCode(''); }}
                className="text-xs font-bold text-gray-500 hover:text-black self-center underline"
              >
                Kirim ulang kode
              </button>
            </form>
          )}

          {/* STEP 3: Password baru + konfirmasi */}
          {forgotStep === 'newpass' && (
            <form onSubmit={handleSubmitNewPassword} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
              <h4 className="font-bold text-lg">Buat Password Baru</h4>
              <p className="text-sm font-semibold opacity-70">
                Kode terverifikasi. Sekarang buat password baru kamu.
              </p>
              <div>
                <label className="block font-bold text-sm mb-1">Password Baru</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Buat password yang kuat"
                  className="w-full border-[3px] border-black px-4 py-2 outline-none font-semibold focus:bg-yellow-50 transition-colors" 
                />
                <div className="mt-2 space-y-1">
                  <p className={`text-xs font-bold flex items-center gap-1.5 ${newPassword.length >= 8 ? 'text-[#2ed573]' : 'text-gray-400'}`}>
                    <i className={`fas ${newPassword.length >= 8 ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i> Minimal 8 karakter
                  </p>
                  <p className={`text-xs font-bold flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? 'text-[#2ed573]' : 'text-gray-400'}`}>
                    <i className={`fas ${/[A-Z]/.test(newPassword) ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i> Ada huruf besar
                  </p>
                  <p className={`text-xs font-bold flex items-center gap-1.5 ${/[a-z]/.test(newPassword) ? 'text-[#2ed573]' : 'text-gray-400'}`}>
                    <i className={`fas ${/[a-z]/.test(newPassword) ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i> Ada huruf kecil
                  </p>
                  <p className={`text-xs font-bold flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? 'text-[#2ed573]' : 'text-gray-400'}`}>
                    <i className={`fas ${/[0-9]/.test(newPassword) ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i> Ada angka
                  </p>
                </div>
              </div>
              <div>
                <label className="block font-bold text-sm mb-1">Konfirmasi Password Baru</label>
                <input 
                  type="password" 
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full border-[3px] border-black px-4 py-2 outline-none font-semibold focus:bg-yellow-50 transition-colors" 
                />
                {confirmMismatch && (
                  <p className="text-xs font-bold text-[#ff4757] mt-1.5 flex items-center gap-1.5">
                    <i className="fas fa-exclamation-circle text-[10px]"></i> Password tidak cocok
                  </p>
                )}
              </div>
              <button 
                type="submit" 
                disabled={submittingNewPass || !!newPasswordError || confirmMismatch || !confirmNewPassword}
                className="w-full bg-[#66d9ef] text-black border-[3px] border-black py-3 font-bold shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all mt-2 uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submittingNewPass ? 'Menyimpan...' : 'Ubah Password'}
              </button>
            </form>
          )}

          {forgotStep === 'closed' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
              
              {mode === 'register' && (
                <div>
                  <label className="block font-bold text-sm mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Budi Santoso" 
                    className="w-full border-[3px] border-black px-4 py-2 outline-none font-semibold focus:bg-yellow-50 transition-colors" 
                  />
                </div>
              )}
              
              <div>
                <label className="block font-bold text-sm mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@email.com" 
                  className="w-full border-[3px] border-black px-4 py-2 outline-none font-semibold focus:bg-yellow-50 transition-colors" 
                />
              </div>
              
              <div>
                <label className="block font-bold text-sm mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? "Buat password yang kuat" : "••••••••"} 
                  className="w-full border-[3px] border-black px-4 py-2 outline-none font-semibold focus:bg-yellow-50 transition-colors" 
                />
                {mode === 'register' && (
                  <div className="mt-2 space-y-1">
                    <p className={`text-xs font-bold flex items-center gap-1.5 ${password.length >= 8 ? 'text-[#2ed573]' : 'text-gray-400'}`}>
                      <i className={`fas ${password.length >= 8 ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i> Minimal 8 karakter
                    </p>
                    <p className={`text-xs font-bold flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-[#2ed573]' : 'text-gray-400'}`}>
                      <i className={`fas ${/[A-Z]/.test(password) ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i> Ada huruf besar
                    </p>
                    <p className={`text-xs font-bold flex items-center gap-1.5 ${/[a-z]/.test(password) ? 'text-[#2ed573]' : 'text-gray-400'}`}>
                      <i className={`fas ${/[a-z]/.test(password) ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i> Ada huruf kecil
                    </p>
                    <p className={`text-xs font-bold flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-[#2ed573]' : 'text-gray-400'}`}>
                      <i className={`fas ${/[0-9]/.test(password) ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i> Ada angka
                    </p>
                  </div>
                )}
              </div>

              {mode === 'login' && (
                <button 
                  type="button" 
                  onClick={() => { setForgotStep('email'); setMessage(null); }}
                  className="text-xs font-bold text-gray-500 hover:text-black self-end mt-[-5px] underline"
                >
                  Lupa password?
                </button>
              )}

              {mode === 'register' && (
                <div className="w-full flex justify-center overflow-hidden">
                  <div className="scale-[0.85] origin-center -my-2">
                    <Turnstile
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                      onSuccess={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken('')}
                      options={{ theme: 'light' }}
                    />
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading || (mode === 'register' && (!captchaToken || !!passwordError))}
                className="w-full bg-[#66d9ef] text-black border-[3px] border-black py-3 font-bold shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all mt-2 uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : (mode === 'login' ? 'Masuk' : 'Buat Akun')}
              </button>
            </form>
          )}

          {forgotStep === 'closed' && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 border-t-[3px] border-dashed border-gray-300"></div>
                <div className="font-mono text-xs font-bold text-gray-400">ATAU</div>
                <div className="flex-1 border-t-[3px] border-dashed border-gray-300"></div>
              </div>

              <button 
                type="button" 
                onClick={() => supabase.auth.signInWithOAuth({ 
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/`
                  }
                })}
                className="w-full bg-white border-[3px] border-black py-2.5 font-bold shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Lanjut dengan Google
              </button>

              <div className="mt-6 pt-4 border-t-[2px] border-dashed border-gray-300 text-center">
                <p className="text-[11px] font-bold text-gray-500 leading-relaxed px-4">
                  Dengan login, kamu menyetujui <br />
                  <Link href="/terms" target="_blank" className="text-[#ff6b9d] hover:underline hover:text-[#ff4757] transition-colors">
                    Syarat, Ketentuan, dan Kebijakan Privasi
                  </Link>
                  {" "} NG Market.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}