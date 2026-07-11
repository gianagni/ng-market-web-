"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import toast from 'react-hot-toast';

const supabase = createClient();

type Order = {
  id: string;
  order_code: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  customer_wa: string;
  product_snapshot: string;
  created_at: string;
  customer_id: string;
  profiles: {
    full_name: string;
    wa_number: string;
  } | null;
};

function statusBadge(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: 'Menunggu Bayar', color: 'bg-gray-200 text-gray-700' },
    processing: { label: 'Perlu Diproses', color: 'bg-[#ffd93d] text-black' },
    delivered: { label: 'Selesai', color: 'bg-[#a8e6cf] text-black' },
    cancelled: { label: 'Dibatalkan', color: 'bg-[#ff4757] text-white' },
  };
  return map[status] || { label: status, color: 'bg-gray-200 text-gray-700' };
}

function parseSnapshot(snapshot: string | null) {
  if (!snapshot) return [];
  try {
    const parsed = JSON.parse(snapshot);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const STATUS_FILTERS = ['semua', 'pending', 'processing', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('semua');
  const [deliveringId, setDeliveringId] = useState<string | null>(null);
  const [credential, setCredential] = useState('');
  const [showDeliverModal, setShowDeliverModal] = useState<Order | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`*, profiles (full_name, wa_number)`)
        .order('created_at', { ascending: false });

      if (cancelled) return;
      if (error) {
        toast.error('Gagal ambil data orders');
      } else {
        setOrders(data || []);
      }
      setIsLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  async function refetch() {
    const { data } = await supabase
      .from('orders')
      .select(`*, profiles (full_name, wa_number)`)
      .order('created_at', { ascending: false });
    setOrders(data || []);
  }

  async function handleDeliver() {
    if (!showDeliverModal) return;
    if (!credential.trim()) {
      toast.error('Kredensial tidak boleh kosong');
      return;
    }

    setDeliveringId(showDeliverModal.id);
    try {
      const res = await fetch(`/api/orders/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: showDeliverModal.id, credential })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success('Order berhasil di-deliver!');
      setShowDeliverModal(null);
      setCredential('');
      await refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal deliver order');
    } finally {
      setDeliveringId(null);
    }
  }

  async function handleCancel() {
    if (!showCancelModal) return;
    setCancelling(true);

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', showCancelModal.id);

      if (error) throw error;
      toast.success('Order dibatalkan');
      setShowCancelModal(null);
      await refetch();
    } catch {
      toast.error('Gagal cancel order');
    } finally {
      setCancelling(false);
    }
  }

  const filtered = activeFilter === 'semua'
    ? orders
    : orders.filter(o => o.status === activeFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-12 h-12 border-[4px] border-black border-t-[#ff6b9d] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto">
      
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-bold text-3xl font-mono">KELOLA ORDER</h1>
          <p className="text-sm font-semibold opacity-60">{orders.length} total order</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 bg-white border-[3px] border-black px-4 py-2 font-bold shadow-[4px_4px_0px_#000] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000] transition-all"
        >
          <i className="fas fa-arrow-left"></i> Kembali
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 font-bold text-sm border-[3px] border-black capitalize transition-all ${
              activeFilter === f
                ? 'bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]'
                : 'bg-white hover:bg-gray-100 shadow-[3px_3px_0px_#000]'
            }`}
          >
            {f === 'semua' ? `Semua (${orders.length})` :
             f === 'pending' ? `Menunggu Bayar (${orders.filter(o => o.status === 'pending').length})` :
             f === 'processing' ? `Perlu Diproses (${orders.filter(o => o.status === 'processing').length})` :
             f === 'delivered' ? `Selesai (${orders.filter(o => o.status === 'delivered').length})` :
             `Dibatalkan (${orders.filter(o => o.status === 'cancelled').length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border-[4px] border-dashed border-gray-300 p-16 text-center">
          <p className="font-bold text-lg opacity-50">Tidak ada order</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const items = parseSnapshot(order.product_snapshot);
            const badge = statusBadge(order.status);

            return (
              <div key={order.id} className="border-[3px] border-black shadow-[4px_4px_0px_#000] bg-white">
                
                <div className="bg-gray-50 border-b-[3px] border-black px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <p className="font-mono font-bold text-sm">{order.order_code}</p>
                      <p className="font-mono text-[10px] opacity-50">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold border-[2px] border-black ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs opacity-60">{order.profiles?.full_name || 'User'}</p>
                    <p className="font-mono text-xs opacity-50">{order.profiles?.wa_number || order.customer_wa}</p>
                  </div>
                </div>

                <div className="px-4 py-3 space-y-1.5">
                  {items.length > 0 ? items.map((item: { nama: string; harga: number }, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="font-bold">{item.nama}</span>
                      <span className="font-mono text-[#ff6b9d] font-bold">
                        Rp {Number(item.harga).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )) : (
                    <p className="text-sm opacity-50">Produk Digital</p>
                  )}
                </div>

                <div className="border-t-[2px] border-dashed border-gray-200 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    {order.discount_amount > 0 && (
                      <p className="text-xs font-bold text-gray-500">
                        Diskon: -Rp {Number(order.discount_amount).toLocaleString('id-ID')}
                      </p>
                    )}
                    <p className="font-mono font-bold text-[#ff4757]">
                      Total: Rp {Number(order.subtotal).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {order.status === 'processing' && (
                      <button
                        onClick={() => { setShowDeliverModal(order); setCredential(''); }}
                        className="bg-[#a8e6cf] border-[3px] border-black px-4 py-2 font-bold text-sm shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
                      >
                        <i className="fas fa-paper-plane mr-1"></i> Deliver
                      </button>
                    )}
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <button
                        onClick={() => setShowCancelModal(order)}
                        className="bg-[#ff4757] text-white border-[3px] border-black px-4 py-2 font-bold text-sm shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
                      >
                        <i className="fas fa-times mr-1"></i> Cancel
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <span className="text-xs font-bold opacity-40 self-center">
                        <i className="fas fa-check-circle mr-1"></i> Selesai
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showDeliverModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeliverModal(null); }}
        >
          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_#000] p-6 max-w-md w-full">
            <h3 className="font-bold text-xl mb-1 font-mono">DELIVER ORDER</h3>
            <p className="text-sm font-semibold opacity-60 mb-4">
              {showDeliverModal.order_code}
            </p>
            <div className="mb-4">
              <label className="block font-bold text-sm mb-2">
                Kredensial Akun (email:password atau format lain)
              </label>
              <textarea
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                rows={4}
                placeholder="contoh: user@gmail.com:password123"
                className="w-full border-[3px] border-black px-4 py-3 font-mono text-sm outline-none focus:bg-yellow-50 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeliverModal(null)}
                className="flex-1 bg-white border-[3px] border-black py-2.5 font-bold hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeliver}
                disabled={deliveringId === showDeliverModal.id || !credential.trim()}
                className="flex-1 bg-[#a8e6cf] border-[3px] border-black py-2.5 font-bold shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all disabled:opacity-70"
              >
                {deliveringId === showDeliverModal.id ? 'Memproses...' : 'Kirim Kredensial'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCancelModal(null); }}
        >
          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_#000] p-6 max-w-md w-full">
            <div className="w-14 h-14 bg-[#ff4757] border-[4px] border-black rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-times text-2xl text-white"></i>
            </div>
            <h3 className="font-bold text-xl mb-1 font-mono">CANCEL ORDER?</h3>
            <p className="text-sm font-semibold opacity-60 mb-1">{showCancelModal.order_code}</p>
            <p className="text-sm font-semibold opacity-60 mb-6">
              {showCancelModal.profiles?.full_name || 'User'} — Rp {Number(showCancelModal.subtotal).toLocaleString('id-ID')}
            </p>
            <p className="text-sm font-bold text-[#ff4757] mb-6">
              Aksi ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(null)}
                className="flex-1 bg-white border-[3px] border-black py-2.5 font-bold hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 bg-[#ff4757] text-white border-[3px] border-black py-2.5 font-bold shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all disabled:opacity-70"
              >
                {cancelling ? 'Membatalkan...' : 'Ya, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}