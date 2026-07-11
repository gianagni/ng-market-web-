"use client";
import React, { useState } from 'react';

// Ini tipe data biar TypeScript nggak ngomel
export type Package = {
  id: string;
  durasi: string;
  harga: number;
  diskonText: string | null;
};

export type Product = {
  id: string;
  kategori: string;
  nama: string;
  icon: string;
  benefits: string[];
  notes: string[];
  packages: Package[];
};

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const WA_NUMBER = "6282124642320";

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  if (!isOpen || !product) return null;

  const handleOrderClick = (pkg: Package) => {
    setSelectedPkg(pkg);
  };

  const handleWARedirect = () => {
    if (!selectedPkg) return;
    const msg = encodeURIComponent(
      `Halo, saya mau order:\n\n` +
      `Produk: ${product.nama}\n` +
      `Paket: ${selectedPkg.durasi}\n` +
      `Harga: Rp ${selectedPkg.harga.toLocaleString('id-ID')}\n\n` +
      `Mohon bantuannya, terima kasih!`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
    setSelectedPkg(null);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-[999999] flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose} // Tutup modal kalau user klik area luar
    >
      <div 
        className="bg-white border-[4px] border-black shadow-[12px_12px_0px_#000] w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col rounded-none animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()} // Biar kalau klik di dalem modal nggak ikut ketutup
      >
        
        {/* Header (Cyan) */}
        <div className="bg-[#66d9ef] border-b-[4px] border-black p-4 flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-bold text-xl font-mono flex items-center gap-3">
            <i className={product.icon}></i> {product.nama}
          </h3>
          <button 
            onClick={onClose} 
            className="bg-[#ff4757] border-[3px] border-black text-white w-8 h-8 font-bold shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all flex items-center justify-center"
          >
            X
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          
          {/* Box Benefits & Notes */}
          <div className="border-[4px] border-black p-5 shadow-[6px_6px_0px_#000] bg-white">
            {/* Checklist Benefits */}
            <ul className="flex flex-col gap-2 mb-4">
              {product.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3 font-bold text-sm">
                  <i className="fas fa-check text-[#a8e6cf] mt-1 text-lg"></i> {benefit}
                </li>
              ))}
            </ul>
            
            {/* Notes Section (Teks Pink) */}
            {product.notes.length > 0 && (
              <div>
                <p className="font-bold text-[#ff4757] mb-1">Note:</p>
                <ul className="flex flex-col gap-1 text-sm font-bold text-gray-700">
                  {product.notes.map((note, idx) => (
                    <li key={idx}>- {note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* List Packages */}
          <div className="flex flex-col gap-4">
            {product.packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="border-[4px] border-black p-4 shadow-[6px_6px_0px_#000] flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col">
                  <h4 className="font-bold text-lg">{pkg.durasi}</h4>
                  
                  {/* Munculin teks diskon kalau ada */}
                  {pkg.diskonText && (
                    <p className="text-xs font-bold text-gray-500 mb-1">{pkg.diskonText}</p>
                  )}
                  
                  {/* Harga Pink */}
                  <p className="font-bold text-[#ff4757] text-xl font-mono mt-1">
                    Rp {pkg.harga.toLocaleString('id-ID')}
                  </p>
                </div>
                
                {/* Tombol Order Kuning */}
                <button 
                  onClick={() => handleOrderClick(pkg)}
                  className="bg-[#ffd93d] border-[3px] border-black text-black px-5 py-2.5 font-bold shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all flex items-center gap-2"
                >
                  <i className="fas fa-cart-shopping text-xl"></i> Order
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
      {/* Popup: Payment belum aktif */}
      {selectedPkg && (
        <div className="fixed inset-0 bg-black/70 z-[9999999] flex items-center justify-center p-4">
          <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_#000] w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚧</span>
              <h4 className="font-bold text-lg leading-tight">Pembayaran online belum aktif</h4>
            </div>
            <p className="text-sm font-medium text-gray-700 leading-relaxed">
              Sistem pembayaran website sedang dalam proses aktivasi. Untuk sementara, kamu bisa order langsung via WhatsApp — lebih cepat dan langsung diproses!
            </p>
            <div className="border-[3px] border-black p-3 bg-gray-50 text-sm font-bold">
              <p className="text-gray-500 text-xs mb-1">Pesanan kamu:</p>
              <p>{product.nama} — {selectedPkg.durasi}</p>
              <p className="text-[#ff4757]">Rp {selectedPkg.harga.toLocaleString('id-ID')}</p>
            </div>
            <button
              onClick={handleWARedirect}
              className="bg-[#25D366] border-[3px] border-black text-white font-bold py-3 shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <i className="fab fa-whatsapp text-xl"></i> Lanjut Order via WhatsApp
            </button>
            <button
              onClick={() => setSelectedPkg(null)}
              className="text-sm font-bold text-gray-500 hover:text-black transition-colors underline text-center"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}