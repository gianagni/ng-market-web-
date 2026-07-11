"use client";
import { useEffect, useState } from 'react';
import { useCart } from '../lib/CartContext';
import OrderSummaryModal from './OrderSummaryModal';

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const { items, removeItem, clearCart, totalPrice, totalItems } = useCart();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openCart', handleOpen);
    return () => window.removeEventListener('openCart', handleOpen);
  }, []);

  return (
    <>
      {/* Drawer — hanya render kalau isOpen */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex justify-end">
          <div 
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white border-l-[4px] border-black flex flex-col h-full shadow-[-8px_0px_0px_#000]">
            
            <div className="bg-[#ffd93d] border-b-[4px] border-black p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg font-mono flex items-center gap-2">
                <i className="fas fa-shopping-cart"></i> KERANJANG ({totalItems})
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-[#ff4757] border-[3px] border-black text-white w-8 h-8 font-bold shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all flex items-center justify-center"
              >
                X
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center opacity-50">
                  <i className="fas fa-shopping-cart text-5xl"></i>
                  <p className="font-bold">Keranjang masih kosong</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.packageId} className="border-[3px] border-black p-3 flex items-center gap-3 shadow-[4px_4px_0px_#000]">
                    <img 
                      src={item.image} 
                      alt={item.productName}
                      className="w-12 h-12 object-contain border-[2px] border-black p-1 bg-white"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/48?text=IMG' }}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-sm">{item.productName}</p>
                      <p className="text-xs font-semibold opacity-70">{item.packageName}</p>
                      <p className="font-bold text-[#ff4757] font-mono text-sm mt-1">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.packageId)}
                      className="w-8 h-8 bg-white border-[2px] border-black flex items-center justify-center hover:bg-[#ff4757] hover:text-white transition-colors font-bold text-sm"
                    >
                      <i className="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t-[4px] border-black p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span className="font-mono text-[#ff4757]">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <button
                  onClick={() => clearCart()}
                  className="w-full bg-white border-[3px] border-black py-2 font-bold text-sm hover:bg-gray-100 transition-colors"
                >
                  Kosongkan Keranjang
                </button>
                <button
                  onClick={() => {
                    setShowSummary(true);
                    setIsOpen(false);
                  }}
                  className="w-full bg-[#66d9ef] border-[3px] border-black py-3 font-bold shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-receipt"></i> Lihat Ringkasan & Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Summary Modal — selalu dirender, dikontrol lewat showSummary */}
      <OrderSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        items={items.map(i => ({
          package_id: i.packageId,
          product_name: i.productName,
          package_name: i.packageName,
          price: i.price,
          image: i.image,
        }))}
        onCheckoutSuccess={() => {
          clearCart();
          setShowSummary(false);
        }}
      />
    </>
  );
}