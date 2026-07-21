"use client";
import React from 'react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_#000] p-8 md:p-12">

        <div className="border-b-[4px] border-black pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Kontak Kami</h1>
            <p className="font-mono font-bold text-gray-500">NG MARKET</p>
          </div>
          <Link href="/" className="bg-[#ffd93d] border-[3px] border-black px-4 py-2 font-bold shadow-[3px_3px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[5px_5px_0px_#000] transition-all text-sm hidden md:block">
            <i className="fas fa-arrow-left mr-2"></i> Kembali
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* WhatsApp */}
          <a
            href="https://wa.me/6282124642320"
            target="_blank"
            rel="noopener noreferrer"
            className="border-[4px] border-black p-6 shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#000] transition-all bg-white group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-[#25D366] border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
                <i className="fab fa-whatsapp text-white text-2xl"></i>
              </div>
              <div>
                <p className="font-bold text-lg">WhatsApp</p>
                <p className="text-sm text-gray-500 font-semibold">Respon tercepat</p>
              </div>
            </div>
            <p className="font-bold text-xl">+62 821-2464-2320</p>
            <p className="text-sm text-gray-500 font-medium mt-1">Admin aktif 24/7</p>
          </a>

          {/* Email */}
          <a
            href="mailto:ngmarkettt@gmail.com"
            className="border-[4px] border-black p-6 shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#000] transition-all bg-white group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-[#ffd93d] border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
                <i className="fas fa-envelope text-black text-2xl"></i>
              </div>
              <div>
                <p className="font-bold text-lg">Email</p>
                <p className="text-sm text-gray-500 font-semibold">Untuk pertanyaan formal</p>
              </div>
            </div>
            <p className="font-bold text-xl">ngmarket.id@gmail.com</p>
            <p className="text-sm text-gray-500 font-medium mt-1">Respon dalam 1x24 jam kerja</p>
          </a>

          {/* Alamat */}
          <div className="border-[4px] border-black p-6 shadow-[6px_6px_0px_#000] bg-white md:col-span-2">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-[#ff6b9d] border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
                <i className="fas fa-map-marker-alt text-white text-2xl"></i>
              </div>
              <div>
                <p className="font-bold text-lg">Alamat Usaha</p>
                <p className="text-sm text-gray-500 font-semibold">Lokasi operasional</p>
              </div>
            </div>
            <p className="font-bold text-lg">Tanjung Priok, Jakarta Utara</p>
            <p className="text-sm text-gray-500 font-medium mt-1">DKI Jakarta, Indonesia 14310</p>
          </div>

        </div>

        {/* Jam Operasional */}
        <div className="mt-8 border-[4px] border-black p-6 shadow-[6px_6px_0px_#000] bg-[#ffd93d]">
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <i className="fas fa-clock"></i> Jam Operasional
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold">WhatsApp Admin</p>
              <p className="font-semibold text-sm mt-1">Senin – Minggu</p>
              <p className="font-bold text-lg">24 Jam / 7 Hari</p>
            </div>
            <div>
              <p className="font-bold">Proses Order</p>
              <p className="font-semibold text-sm mt-1">Rata-rata</p>
              <p className="font-bold text-lg">5–10 Menit</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/terms" className="border-[3px] border-black px-4 py-2 font-bold text-sm shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all bg-white">
            Syarat & Ketentuan
          </Link>
          <Link href="/refund-policy" className="border-[3px] border-black px-4 py-2 font-bold text-sm shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all bg-white">
            Kebijakan Refund
          </Link>
          <Link href="/faq" className="border-[3px] border-black px-4 py-2 font-bold text-sm shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all bg-white">
            FAQ
          </Link>
        </div>

      </div>
    </div>
  );
}
