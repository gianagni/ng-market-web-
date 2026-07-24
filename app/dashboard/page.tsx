"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

type OrderItem = {
  nama: string;
  package_id: string;
  harga: number;
  snapshot_at: string;
};

function parseSnapshot(snapshot: string | null): OrderItem[] {
  if (!snapshot) return [];
  try {
    const parsed = JSON.parse(snapshot);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: 'Menunggu Pembayaran', color: 'bg-gray-200 text-gray-700' },
    awaiting_payment: { label: 'Menunggu Verifikasi', color: 'bg-[#66d9ef] text-black' },
    processing: { label: 'Sedang Diproses', color: 'bg-[#ffd93d] text-black' },
    delivered: { label: 'Selesai', color: 'bg-[#a8e6cf] text-black' },
    cancelled: { label: 'Dibatalkan', color: 'bg-[#ff4757] text-white' },
  };
  return map[status] || { label: status, color: 'bg-gray-200 text-gray-700' };
}

export default function UserDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [resumingOrderCode, setResumingOrderCode] = useState<string | null>(null);
  const [revealingOrderId, setRevealingOrderId] = useState<string | null>(null);
  const [credentialModal, setCredentialModal] = useState<{ orderId: string; credential: string } | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profil' | 'pesanan'>('profil');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    full_name: '',
    wa_number: '',
  });
  const [originalWa, setOriginalWa] = useState('');
  const [isWaVerified, setIsWaVerified] = useState(false);
  const [notifPref, setNotifPref] = useState<'whatsapp' | 'email'>('whatsapp');
  
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }
      setUser(session.user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setFormData({
          full_name: profile.full_name || session.user.user_metadata?.full_name || '',
          wa_number: profile.wa_number || '',
        });
        setOriginalWa(profile.wa_number || '');
        setIsWaVerified(profile.is_wa_verified || false);
        setNotifPref(profile.notif_pref || 'whatsapp');
      }

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (orderData) setOrders(orderData);
      setIsLoading(false);

      // Auto switch ke tab pesanan kalau dari redirect TemanQRIS
      const params = new URLSearchParams(window.location.search);
      if (params.get('order')) {
        setActiveTab('pesanan');
      }
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshOrders = async () => {
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user?.id)
      .order('created_at', { ascending: false });
    if (orderData) setOrders(orderData);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const isWaChanged = formData.wa_number !== originalWa;
    const updatedVerifiedStatus = isWaChanged ? false : isWaVerified;
    
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        full_name: formData.full_name,
        wa_number: formData.wa_number,
        is_wa_verified: updatedVerifiedStatus,
        notif_pref: notifPref,
        updated_at: new Date().toISOString(),
      });

    setIsSaving(false);
    
    if (error) {
      toast.error('Gagal simpan: ' + error.message);
    } else {
      setOriginalWa(formData.wa_number);
      setIsWaVerified(updatedVerifiedStatus);
      toast.success('Profil berhasil di-update!');
    }
  };

  const handleSendOtp = async () => {
    if (!formData.wa_number) return toast.error("Isi nomor WA dulu!");
    
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.wa_number })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOtpSent(true);
      toast.success("Kode OTP dikirim ke WA kamu!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("Gagal: " + err.message);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return toast.error("OTP harus 6 digit!");
    setIsVerifying(true);
    
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.wa_number, otp: otpCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIsWaVerified(true);
      setOtpSent(false);
      setOtpCode('');
      setOriginalWa(formData.wa_number);
      toast.success("WhatsApp Terverifikasi!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("Gagal: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResumePayment = async (orderCode: string) => {
    setResumingOrderCode(orderCode);
    try {
      const res = await fetch('/api/checkout/resume-temanqris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_code: orderCode })
      });

      const data = await res.json();

      if (!res.ok || !data.redirect_url) {
        toast.error(data.error || 'Gagal melanjutkan pembayaran');
        setResumingOrderCode(null);
        return;
      }

      window.location.assign(data.redirect_url);
    } catch {
      toast.error('Terjadi kesalahan sistem');
      setResumingOrderCode(null);
    }
  };

  const handleRevealCredential = async (orderId: string) => {
    setRevealingOrderId(orderId);
    try {
      const res = await fetch('/api/orders/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal mengambil kredensial');
        return;
      }

      setCredentialModal({ orderId, credential: data.credential });
    } catch {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setRevealingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-[4px] border-black border-t-[#ff6b9d] rounded-full animate-spin"></div>
        <p className="font-bold font-mono text-lg">Memuat data dashboard...</p>
      </div>
    );
  }

  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalSpent = deliveredOrders.reduce((sum, o) => sum + Number(o.subtotal), 0);
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    : '-';

  return (
    <div className="min-h-screen pt-6 pb-20 px-6 max-w-5xl mx-auto">

      <div className="mb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-white border-[3px] border-black px-4 py-2 font-bold shadow-[4px_4px_0px_#000] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000] transition-all"
        >
          <i className="fas fa-arrow-left"></i> Kembali ke Beranda
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_#000] p-6 mb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#ffd93d] border-[4px] border-black rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-user-circle text-4xl"></i>
              </div>
              <h2 className="font-bold text-lg mb-1">{formData.full_name || 'Pelanggan'}</h2>
              <p className="text-xs font-bold font-mono opacity-60 break-all">{user?.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setActiveTab('profil')}
              className={`text-left px-4 py-3 font-bold border-[3px] border-black transition-all ${
                activeTab === 'profil' 
                ? 'bg-[#66d9ef] shadow-[4px_4px_0px_#000] translate-x-[-2px] translate-y-[-2px]' 
                : 'bg-white hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-user-edit mr-2 w-5"></i> Pengaturan
            </button>
            <button 
              onClick={() => { setActiveTab('pesanan'); refreshOrders(); }}
              className={`text-left px-4 py-3 font-bold border-[3px] border-black transition-all flex justify-between items-center ${
                activeTab === 'pesanan' 
                ? 'bg-[#66d9ef] shadow-[4px_4px_0px_#000] translate-x-[-2px] translate-y-[-2px]' 
                : 'bg-white hover:bg-gray-100'
              }`}
            >
              <div>
                <i className="fas fa-shopping-bag mr-2 w-5"></i> Pesanan Saya
              </div>
              {orders.length > 0 && (
                <span className="bg-[#ff4757] text-white text-[10px] px-2 py-0.5 border-[2px] border-black">
                  {orders.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white border-[4px] border-black shadow-[12px_12px_0px_#000] p-6 md:p-8">
          
          {activeTab === 'profil' && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-8">

              <div>
                <h2 className="text-2xl font-bold border-b-[4px] border-black pb-2 mb-6">Ringkasan Akun</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border-[3px] border-black p-4 shadow-[4px_4px_0px_#000] bg-[#ffd93d]">
                    <p className="text-xs font-bold uppercase tracking-wide opacity-70 mb-1">Total Belanja</p>
                    <p className="font-mono font-bold text-xl">Rp {totalSpent.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="border-[3px] border-black p-4 shadow-[4px_4px_0px_#000] bg-[#a8e6cf]">
                    <p className="text-xs font-bold uppercase tracking-wide opacity-70 mb-1">Pesanan Selesai</p>
                    <p className="font-mono font-bold text-xl">{deliveredOrders.length}</p>
                  </div>
                  <div className="border-[3px] border-black p-4 shadow-[4px_4px_0px_#000] bg-[#66d9ef]">
                    <p className="text-xs font-bold uppercase tracking-wide opacity-70 mb-1">Member Sejak</p>
                    <p className="font-mono font-bold text-xl">{memberSince}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold border-b-[4px] border-black pb-2 mb-6">Profil Publik</h2>
                <form onSubmit={handleSaveProfile} className="space-y-5 max-w-lg">
                  <div>
                    <label className="block font-bold mb-2">Nama Lengkap</label>
                    <input 
                      type="text" 
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full border-[4px] border-black px-4 py-2.5 font-semibold focus:outline-none focus:bg-yellow-50 transition-colors"
                      placeholder="Contoh: Nandito Gianza"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Nomor WhatsApp</label>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <input 
                        type="text" 
                        required
                        value={formData.wa_number}
                        onChange={(e) => setFormData({ ...formData, wa_number: e.target.value })}
                        className="w-full sm:flex-1 border-[4px] border-black px-4 py-2.5 font-semibold focus:outline-none focus:bg-yellow-50 transition-colors"
                        placeholder="Contoh: 0857..."
                      />
                      {isWaVerified ? (
                        <span className="bg-[#a8e6cf] border-[3px] border-black px-4 py-2.5 text-sm font-bold shadow-[2px_2px_0px_#000] whitespace-nowrap">
                          <i className="fas fa-check-circle mr-1"></i> Terverifikasi
                        </span>
                      ) : (
                        <span className="bg-gray-200 border-[3px] border-black px-4 py-2.5 text-sm font-bold shadow-[2px_2px_0px_#000] whitespace-nowrap text-gray-600">
                          <i className="fas fa-times-circle mr-1"></i> Belum Verifikasi
                        </span>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-[#ff6b9d] text-white border-[4px] border-black px-6 py-3 font-bold shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#000] transition-all disabled:opacity-70"
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
                  </button>
                </form>
              </div>

              {!isWaVerified && (
                <div className="border-[4px] border-black bg-[#ffd93d] p-6 shadow-[6px_6px_0px_#000]">
                  <h3 className="font-bold text-lg mb-1"><i className="fas fa-shield-alt mr-2"></i> Verifikasi Keamanan</h3>
                  <p className="text-sm font-semibold opacity-80 mb-4">
                    Verifikasi nomor WhatsApp diperlukan agar kamu bisa klaim garansi dan mengaktifkan program referral dengan aman.
                  </p>
                  {!otpSent ? (
                    <button onClick={handleSendOtp} className="bg-white border-[3px] border-black px-5 py-2 font-bold shadow-[3px_3px_0px_#000] hover:-translate-y-[2px] hover:shadow-[5px_5px_0px_#000] transition-all">
                      Kirim Kode OTP (WhatsApp)
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Masukkan 6 digit kode"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="border-[3px] border-black px-4 py-2 font-bold tracking-widest text-center max-w-[200px]"
                      />
                      <button onClick={handleVerifyOtp} disabled={isVerifying} className="bg-[#a8e6cf] border-[3px] border-black px-5 py-2 font-bold shadow-[3px_3px_0px_#000] hover:-translate-y-[2px] hover:shadow-[5px_5px_0px_#000] transition-all disabled:opacity-50">
                        {isVerifying ? 'Mengecek...' : 'Verifikasi'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold border-b-[4px] border-black pb-2 mb-4">Preferensi Notifikasi</h2>
                <p className="text-sm font-semibold text-gray-600 mb-4">Pilih jalur komunikasi untuk menerima info perpanjangan dan garansi.</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 border-[3px] border-black rounded-full flex items-center justify-center ${notifPref === 'whatsapp' ? 'bg-[#ff6b9d]' : 'bg-white group-hover:bg-gray-200'}`}>
                      {notifPref === 'whatsapp' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <input type="radio" className="hidden" checked={notifPref === 'whatsapp'} onChange={() => setNotifPref('whatsapp')} />
                    <span className="font-bold">WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 border-[3px] border-black rounded-full flex items-center justify-center ${notifPref === 'email' ? 'bg-[#ff6b9d]' : 'bg-white group-hover:bg-gray-200'}`}>
                      {notifPref === 'email' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <input type="radio" className="hidden" checked={notifPref === 'email'} onChange={() => setNotifPref('email')} />
                    <span className="font-bold">Email</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pesanan' && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center border-b-[4px] border-black pb-4 mb-6">
                <h2 className="text-2xl font-bold">Riwayat Pesanan</h2>
                <button
                  onClick={refreshOrders}
                  className="bg-white border-[3px] border-black px-3 py-1.5 font-bold text-sm shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
                >
                  <i className="fas fa-refresh mr-1"></i> Refresh
                </button>
              </div>
              {orders.length === 0 ? (
                <div className="border-[4px] border-dashed border-gray-300 p-10 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-box-open text-3xl text-gray-400"></i>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Belum ada pesanan</h3>
                  <Link href="/" className="bg-[#66d9ef] border-[3px] border-black px-6 py-2.5 font-bold shadow-[4px_4px_0px_#000]">Belanja Sekarang</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const items = parseSnapshot(order.product_snapshot);
                    const badge = statusBadge(order.status);

                    return (
                      <div key={order.id} className="border-[3px] border-black shadow-[4px_4px_0px_#000]">
                        
                        <div className="bg-gray-50 border-b-[3px] border-black px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="font-mono font-bold text-xs opacity-60">{order.order_code}</p>
                            <p className="font-mono text-[10px] opacity-50">
                              {new Date(order.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'long', year: 'numeric'
                              })}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-bold border-[2px] border-black ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="p-4 space-y-2">
                          {items.length > 0 ? (
                            items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center text-sm">
                                <span className="font-bold">{item.nama}</span>
                                <span className="font-mono text-[#ff6b9d] font-bold">
                                  Rp {Number(item.harga).toLocaleString('id-ID')}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm font-semibold opacity-60">Produk Digital</p>
                          )}
                        </div>

                        <div className="border-t-[2px] border-dashed border-gray-300 px-4 py-3 flex justify-between items-center">
                          <span className="font-bold text-sm">Total</span>
                          <span className="font-mono font-bold text-[#ff4757]">
                            Rp {Number(order.subtotal).toLocaleString('id-ID')}
                          </span>
                        </div>

                        {(order.status === 'pending' || order.status === 'awaiting_payment') && (
                          <div className="px-4 pb-4 flex flex-col gap-2">
                            {order.status === 'awaiting_payment' && (
                              <div className="bg-[#66d9ef] border-[2px] border-black px-3 py-2 text-xs font-bold text-center">
                                <i className="fas fa-clock mr-1"></i> Pembayaran kamu sedang menunggu verifikasi admin
                              </div>
                            )}
                            <button
                              onClick={() => handleResumePayment(order.order_code)}
                              disabled={resumingOrderCode === order.order_code}
                              className="w-full bg-[#66d9ef] border-[3px] border-black py-2.5 font-bold text-sm shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <i className="fas fa-credit-card"></i>
                              {resumingOrderCode === order.order_code ? 'Memproses...' : 'Lanjutkan Pembayaran'}
                            </button>
                          </div>
                        )}

                        {order.status === 'delivered' && (
                          <div className="px-4 pb-4">
                            <button
                              onClick={() => handleRevealCredential(order.id)}
                              disabled={revealingOrderId === order.id}
                              className="w-full bg-[#ffd93d] border-[3px] border-black py-2.5 font-bold text-sm shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <i className="fas fa-key"></i>
                              {revealingOrderId === order.id ? 'Memuat...' : 'Lihat Akun'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {credentialModal && (
        <div
          className="fixed inset-0 bg-black/70 z-[999999] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setCredentialModal(null); }}
        >
          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_#000] p-6 max-w-md w-full">
            <div className="w-12 h-12 bg-[#ffd93d] border-[3px] border-black rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-key text-xl"></i>
            </div>
            <h3 className="font-bold text-xl mb-1 font-mono">DETAIL AKUN</h3>
            <p className="text-xs font-bold opacity-50 mb-4">Jangan bagikan informasi ini ke siapapun.</p>
            <div className="bg-gray-50 border-[3px] border-black p-4 font-mono text-sm mb-4 break-all select-all">
              {credentialModal.credential}
            </div>
            <p className="text-xs font-semibold text-gray-500 mb-4">
              <i className="fas fa-info-circle mr-1"></i> Klik pada teks di atas untuk memilih, lalu copy.
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(credentialModal.credential);
                toast.success('Kredensial berhasil dicopy!');
              }}
              className="w-full bg-[#66d9ef] border-[3px] border-black py-2.5 font-bold shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all mb-3"
            >
              <i className="fas fa-copy mr-2"></i> Copy Kredensial
            </button>
            <button
              onClick={() => setCredentialModal(null)}
              className="w-full bg-white border-[3px] border-black py-2.5 font-bold hover:bg-gray-100 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
