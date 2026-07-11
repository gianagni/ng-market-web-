"use client";

export default function ExtrasSection() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col gap-20">
      
      {/* CARA ORDER */}
      <section id="cara-order">
        <div className="inline-flex bg-[#ffd93d] border-[4px] border-black px-5 py-2 shadow-[6px_6px_0px_#000] mb-12">
          <h2 className="font-bold font-mono text-lg uppercase flex items-center gap-3">
            <i className="fas fa-edit text-[#66d9ef]"></i> CARA ORDER
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { n: "01", t: "PILIH PRODUK", d: "Cari produk atau jasa yang lo butuhin di katalog NG Market." },
            { n: "02", t: "PILIH PAKET", d: "Klik tombol 'Pilih Paket' buat liat detail harga dan durasi." },
            { n: "03", t: "BAYAR VIA WA", d: "Konfirmasi pesanan lo ke admin via WhatsApp buat pembayaran." },
            { n: "04", t: "AKUN DIKIRIM", d: "Akun atau jasa langsung diproses dan dikirim via chat WA!" },
          ].map((item, i) => (
            <div key={i} className={`bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_#000] ${i % 2 !== 0 ? 'border-pink-400' : ''}`}>
              <div className="font-mono font-bold text-2xl mb-4">{item.n}</div>
              <h3 className="font-bold text-lg mb-2">{item.t}</h3>
              <p className="text-sm opacity-80">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONI */}
      <section id="testimoni">
        <div className="inline-flex bg-[#ffd93d] border-[4px] border-black px-5 py-2 shadow-[6px_6px_0px_#000] mb-12">
          <h2 className="font-bold font-mono text-lg uppercase flex items-center gap-3">
            <i className="fas fa-star text-[#ff6b9d]"></i> TESTIMONI PELANGGAN
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: "Rian G.", t: "Netflixnya lancar jaya, gapernah on hold. Prosesnya cepet bgt ga sampe 10 menit akun lgsg dikirim." },
            { n: "Siti W.", t: "Bantu rapihin PPT dan makalah di sini hasilnya aesthetic parah. Pas banget sama brief, jadi lebih siap." },
            { n: "Budi T.", t: "Beli Spotify Indplan aman banget cuy. Udah 2 bulan jalan ga kena limit. Respon adminnya juga cepet." },
          ].map((t, i) => (
            <div key={i} className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_#000]">
              <div className="text-yellow-400 mb-4 text-sm">★★★★★</div>
              <p className="mb-6 italic">{t.t}</p>
              <div className="border-t-[2px] border-black pt-4 font-bold flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-200 border-[2px] border-black flex items-center justify-center">{t.n[0]}</div>
                {t.n} <span className="text-[10px] font-normal uppercase opacity-60">via WhatsApp</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}