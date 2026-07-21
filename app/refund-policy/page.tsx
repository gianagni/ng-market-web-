/* eslint-disable react/no-unescaped-entities */
"use client";
import React from 'react';
import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_#000] p-8 md:p-12">

        <div className="border-b-[4px] border-black pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Kebijakan Pengembalian Dana</h1>
            <p className="font-mono font-bold text-gray-500">NG MARKET</p>
          </div>
          <Link href="/" className="bg-[#ffd93d] border-[3px] border-black px-4 py-2 font-bold shadow-[3px_3px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[5px_5px_0px_#000] transition-all text-sm hidden md:block">
            <i className="fas fa-arrow-left mr-2"></i> Kembali
          </Link>
        </div>

        <div className="space-y-6 text-gray-800 leading-relaxed font-medium">
          <p className="italic font-semibold">Terakhir diperbarui: 12 Juli 2026</p>

          <p>Kebijakan pengembalian dana ini menjelaskan kondisi dan prosedur yang berlaku apabila Pengguna mengajukan permintaan refund atas transaksi yang dilakukan di platform NG Market.</p>

          <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">1. Kondisi Refund Disetujui</h2>
          <ul className="list-none space-y-3">
            <li><strong>1.1.</strong> Pesanan sudah dibayar namun gagal diproses akibat kendala dari sistem kami, misalnya stok kredensial tidak tersedia dan tidak dapat dipenuhi dalam waktu yang wajar (maksimal 1x24 jam kerja).</li>
            <li><strong>1.2.</strong> Terjadi kesalahan teknis pada sistem kami yang menyebabkan pembayaran terpotong namun pesanan tidak terbuat.</li>
            <li><strong>1.3.</strong> Produk yang diterima tidak sesuai dengan deskripsi yang tercantum di platform dan tidak dapat diselesaikan melalui mekanisme garansi.</li>
          </ul>

          <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">2. Kondisi Refund Tidak Dapat Diproses</h2>
          <ul className="list-none space-y-3">
            <li><strong>2.1.</strong> Pesanan sudah berhasil dikirimkan (status delivered) dan produk dalam kondisi berfungsi normal.</li>
            <li><strong>2.2.</strong> Kerusakan atau gangguan yang disebabkan oleh tindakan Pengguna sendiri, termasuk mengubah password, membagikan kredensial, atau melanggar Syarat Layanan penyedia aplikasi.</li>
            <li><strong>2.3.</strong> Pengguna berubah pikiran atau tidak jadi menggunakan layanan yang sudah dibeli.</li>
            <li><strong>2.4.</strong> Pengajuan refund dilakukan setelah masa garansi produk berakhir.</li>
          </ul>

          <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">3. Prosedur Pengajuan Refund</h2>
          <ul className="list-none space-y-3">
            <li><strong>3.1.</strong> Pengguna mengajukan permintaan refund melalui menu "Pesanan Saya" di dashboard akun (untuk transaksi melalui website) atau melalui WhatsApp resmi kami.</li>
            <li><strong>3.2.</strong> Sertakan bukti transaksi, nomor order, dan penjelasan singkat mengenai alasan pengajuan refund.</li>
            <li><strong>3.3.</strong> Tim kami akan meninjau pengajuan dalam waktu maksimal <strong>2 (dua) hari kerja</strong> dan memberikan keputusan final.</li>
          </ul>

          <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">4. Proses Pengembalian Dana</h2>
          <ul className="list-none space-y-3">
            <li><strong>4.1.</strong> Refund yang disetujui akan diproses dalam waktu maksimal <strong>7 (tujuh) hari kerja</strong> ke metode pembayaran asal atau metode lain yang disepakati bersama.</li>
            <li><strong>4.2.</strong> Pengguna dilarang melakukan chargeback atau pembatalan transaksi secara sepihak melalui bank atau e-wallet tanpa melalui proses komplain resmi ke kami terlebih dahulu.</li>
          </ul>

          <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">5. Hubungi Kami</h2>
          <p>Untuk pertanyaan terkait kebijakan pengembalian dana, silakan hubungi kami melalui:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>WhatsApp: <a href="https://wa.me/6282124642320" className="text-blue-600 underline font-bold" target="_blank" rel="noopener noreferrer">+62 821-2464-2320</a></li>
            <li>Email: ngmarkettt@gmail.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
