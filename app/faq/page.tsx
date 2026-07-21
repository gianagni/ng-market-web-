/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from 'react';
import Link from 'next/link';

const faqs = [
  {
    q: "Apa itu NG Market?",
    a: "NG Market adalah platform digital yang menyediakan layanan akun premium streaming (Netflix, Spotify, YouTube Premium, dll.), domain, VPS, dan jasa kreatif dengan harga terjangkau dan garansi penuh."
  },
  {
    q: "Bagaimana cara melakukan pemesanan?",
    a: "Kamu bisa memesan langsung melalui website dengan membuat akun terlebih dahulu, atau melalui WhatsApp admin kami. Setelah pembayaran dikonfirmasi, pesanan akan diproses dalam waktu 5–10 menit."
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "Saat ini kami menerima pembayaran melalui QRIS (semua aplikasi dompet digital seperti GoPay, OVO, Dana, ShopeePay, dll.) dan transfer bank."
  },
  {
    q: "Apakah ada garansi untuk produk yang dibeli?",
    a: "Ya, semua produk yang kami jual disertai garansi sesuai dengan durasi dan ketentuan masing-masing produk. Detail garansi tercantum pada halaman detail produk atau invoice pembelian."
  },
  {
    q: "Bagaimana cara mengklaim garansi?",
    a: "Klaim garansi dapat dilakukan melalui menu 'Pesanan Saya' di dashboard akun kamu, atau melalui WhatsApp admin kami untuk transaksi tanpa akun. Pastikan masalah yang dialami bukan akibat kesalahan pengguna."
  },
  {
    q: "Berapa lama proses pengiriman akun setelah pembayaran?",
    a: "Untuk transaksi melalui website, akun akan dikirimkan otomatis dalam 5–10 menit setelah pembayaran dikonfirmasi. Untuk transaksi via WhatsApp, admin akan memprosesnya sesegera mungkin."
  },
  {
    q: "Apakah data pribadi saya aman?",
    a: "Ya, kami menjaga kerahasiaan data pribadi kamu dengan enkripsi dan pembatasan akses internal. Kami tidak membagikan data kamu ke pihak ketiga untuk tujuan komersial tanpa persetujuan."
  },
  {
    q: "Apa yang harus dilakukan jika akun bermasalah?",
    a: "Hubungi kami melalui WhatsApp atau klaim garansi melalui dashboard. Tim kami siap membantu 24/7 untuk menyelesaikan masalah yang kamu hadapi."
  },
  {
    q: "Apakah bisa request produk yang tidak ada di katalog?",
    a: "Bisa! Hubungi admin kami via WhatsApp dan sampaikan kebutuhan kamu. Kami akan berusaha membantu semaksimal mungkin."
  },
  {
    q: "Bagaimana program referral bekerja?",
    a: "Setiap pengguna terdaftar mendapat kode referral unik. Kamu mendapat komisi setiap kali ada orang yang melakukan pembelian menggunakan kode referralmu. Minimum penarikan saldo Rp 50.000."
  },
];

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_#000] p-8 md:p-12">

        <div className="border-b-[4px] border-black pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">FAQ</h1>
            <p className="font-mono font-bold text-gray-500">Pertanyaan yang Sering Diajukan</p>
          </div>
          <Link href="/" className="bg-[#ffd93d] border-[3px] border-black px-4 py-2 font-bold shadow-[3px_3px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[5px_5px_0px_#000] transition-all text-sm hidden md:block">
            <i className="fas fa-arrow-left mr-2"></i> Kembali
          </Link>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-[3px] border-black shadow-[4px_4px_0px_#000]">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-4 text-left font-bold flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span>{faq.q}</span>
                <i className={`fas fa-chevron-${openIdx === idx ? 'up' : 'down'} ml-4 flex-shrink-0`}></i>
              </button>
              {openIdx === idx && (
                <div className="border-t-[3px] border-black p-4 bg-gray-50 text-sm font-medium text-gray-700 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 p-5 border-[3px] border-black bg-[#ffd93d] shadow-[4px_4px_0px_#000]">
          <p className="font-bold text-sm">Tidak menemukan jawaban yang kamu cari?</p>
          <p className="text-sm font-medium mt-1">Hubungi kami langsung via WhatsApp dan admin kami siap membantu 24/7.</p>
          <a
            href="https://wa.me/6282124642320"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 bg-black text-white px-4 py-2 font-bold text-sm border-[2px] border-black hover:bg-gray-800 transition-colors"
          >
            <i className="fab fa-whatsapp"></i> Chat via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
