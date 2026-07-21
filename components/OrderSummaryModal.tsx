"use client";
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';
import toast from 'react-hot-toast';

interface OrderItem {
  package_id: string;
  product_name: string;
  package_name: string;
  price: number;
  image?: string;
}

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onCheckoutSuccess: () => void;
}

export default function OrderSummaryModal({ isOpen, onClose, items, onCheckoutSuccess }: OrderSummaryModalProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherResult, setVoucherResult] = useState<{
    discount_amount: number;
    final_price: number;
    message: string;
    code: string;
  } | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const finalPrice = voucherResult ? voucherResult.final_price : subtotal;

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsValidating(true);
    setVoucherError('');
    setVoucherResult(null);

    try {
      const res = await fetch('/api/voucher/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode, subtotal })
      });

      const data = await res.json();

      if (!res.ok) {
        setVoucherError(data.error || 'Voucher tidak valid');
      } else {
        setVoucherResult(data);
      }
    } catch {
      setVoucherError('Gagal validasi voucher');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherResult(null);
    setVoucherCode('');
    setVoucherError('');
  };

  const handleCheckout = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      window.dispatchEvent(new Event('openAuthModal'));
      return;
    }

    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          voucher_code: voucherResult?.code ?? null,
        })
      });

      const data = await response.json();

      if (data.redirect_url) {
        onCheckoutSuccess();
        window.location.assign(data.redirect_url);
      } else {
        toast.error("Gagal checkout: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem saat menghubungi server!");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[999999] flex items-center justify-center p-4 animate-in fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_#000] w-full max-w-lg flex flex-col animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#ffd93d] border-b-[4px] border-black p-4 flex justify-between items-center">
          <h3 className="font-bold text-lg font-mono flex items-center gap-2">
            <i className="fas fa-receipt"></i> RINGKASAN ORDER
          </h3>
          <button
            onClick={onClose}
            className="bg-[#ff4757] border-[3px] border-black text-white w-8 h-8 font-bold shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all flex items-center justify-center"
          >
            X
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">

          {/* List Items */}
          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <div key={i} className="border-[3px] border-black p-3 flex justify-between items-center shadow-[3px_3px_0px_#000]">
                <div>
                  <p className="font-bold text-sm">{item.product_name}</p>
                  <p className="text-xs font-semibold opacity-60">{item.package_name}</p>
                </div>
                <p className="font-bold font-mono text-[#ff4757]">
                  Rp {item.price.toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>

          {/* Voucher Input */}
          <div className="border-[3px] border-dashed border-black p-4">
            <p className="font-bold text-sm mb-3 flex items-center gap-2">
              <i className="fas fa-tag text-[#ff6b9d]"></i> Kode Voucher
            </p>

            {voucherResult ? (
              <div className="flex items-center justify-between bg-[#a8e6cf] border-[3px] border-black p-3">
                <div>
                  <p className="font-bold text-sm">{voucherResult.code}</p>
                  <p className="text-xs font-semibold">{voucherResult.message}</p>
                </div>
                <button
                  onClick={handleRemoveVoucher}
                  className="text-xs font-bold underline hover:text-[#ff4757] transition-colors"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    setVoucherError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleValidateVoucher()}
                  placeholder="Masukkan kode voucher"
                  className="flex-1 border-[3px] border-black px-3 py-2 font-bold text-sm outline-none focus:bg-yellow-50 transition-colors uppercase tracking-wider"
                />
                <button
                  onClick={handleValidateVoucher}
                  disabled={isValidating || !voucherCode.trim()}
                  className="bg-[#66d9ef] border-[3px] border-black px-4 py-2 font-bold text-sm shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all disabled:opacity-50"
                >
                  {isValidating ? <i className="fas fa-spinner fa-spin"></i> : 'Pakai'}
                </button>
              </div>
            )}

            {voucherError && (
              <p className="text-[#ff4757] font-bold text-xs mt-2 flex items-center gap-1">
                <i className="fas fa-exclamation-circle"></i> {voucherError}
              </p>
            )}
          </div>

          {/* Price Summary */}
          <div className="border-[3px] border-black p-4 flex flex-col gap-2">
            <div className="flex justify-between font-semibold text-sm">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            {voucherResult && (
              <div className="flex justify-between font-semibold text-sm text-[#2ed573]">
                <span>Diskon Voucher</span>
                <span>- Rp {voucherResult.discount_amount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="border-t-[3px] border-black pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-[#ff4757] font-mono">Rp {finalPrice.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full bg-[#66d9ef] border-[4px] border-black py-4 font-bold text-lg shadow-[6px_6px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <i className="fas fa-shopping-cart"></i>
            {isCheckingOut ? 'Memproses...' : `Bayar Rp ${finalPrice.toLocaleString('id-ID')}`}
          </button>

        </div>
      </div>
    </div>
  );
}
