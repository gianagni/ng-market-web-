"use client";
import { useState } from 'react';
import ProductModal, { Product } from './ProductModal';
import toast from 'react-hot-toast';

type DomainInfo = {
  tld: string;
  price: number;
  desc: string;
  reqKtp: boolean;
};

export default function ServicesSection() {
  const [selectedService, setSelectedService] = useState<Product | null>(null);
  
  // State Khusus Domain
  const [domainSearch, setDomainSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<DomainInfo | null>(null);
  
  // State untuk "Akalin" Cek Domain
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{ domain: string, tld: string, available: boolean } | null>(null);

  const waNumber = "6282124642320"; 

  // Fungsi Pura-pura Cek Domain
  const handleFakeCheck = () => {
    if (!domainSearch) return toast.error("Ketik nama domainnya dulu ya!")
    
    // Reset hasil sebelumnya dan nyalain loading
    setIsChecking(true);
    setCheckResult(null);

    // Bikin fake delay 1.5 detik biar kerasa ngecek API beneran
    setTimeout(() => {
      let tld = ".COM";
      if (domainSearch.includes('.')) {
        const parts = domainSearch.split('.');
        tld = "." + parts.slice(1).join('.').toUpperCase();
      }

      // Akalin: 100% selalu tersedia, KECUALI dia masukin nama web gede (google/facebook)
      const isTaken = domainSearch.toLowerCase().includes('google') || domainSearch.toLowerCase().includes('facebook');
      
      setCheckResult({
        domain: domainSearch.toLowerCase(),
        tld: tld,
        available: !isTaken
      });
      setIsChecking(false);
    }, 1500);
  };

  const handlePesanDomain = (tld: string) => {
    const text = `Halo admin NG Market, saya mau pesan domain ekstensi *${tld}*. Persyaratannya apa saja?`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ==========================================
  // DATA DUMMY
  // ==========================================
  const bantuanData: Product[] = [
    {
      id: 'b1', kategori: 'Dokumen', nama: 'Bantuan Dokumen Akademik', icon: 'fas fa-file-alt',
      benefits: ['Rapihin PPT, makalah, resume jurnal, proposal, daftar pustaka.'], notes: ['Harga tergantung tingkat kerumitan dokumen'],
      packages: [{ id: 'p1', durasi: 'Mulai dari', harga: 5000, diskonText: null }]
    },
    {
      id: 'b5', kategori: 'Analisis', nama: 'Pembuatan UML & ERD', icon: 'fas fa-project-diagram',
      benefits: ['Desain Use Case, Activity Diagram, Class Diagram, dan ERD.'], notes: ['File output berupa gambar resolusi tinggi'],
      packages: [{ id: 'p5', durasi: 'Sistem Standar', harga: 35000, diskonText: null }]
    },
    {
      id: 'b6', kategori: 'Web Dev', nama: 'Web Undangan Digital', icon: 'fas fa-envelope-open-text',
      benefits: ['Pembuatan undangan digital premium berbasis website, elegan.'], notes: ['Masa aktif link undangan 6 bulan'],
      packages: [{ id: 'p6', durasi: 'Paket Premium', harga: 100000, diskonText: null }]
    }
  ];

  const domainList: DomainInfo[] = [
    { tld: '.MY.ID', price: 35000, reqKtp: true, desc: 'Domain murah meriah kebanggaan Indonesia! Cocok banget untuk website personal, blog, atau portofolio pribadi.' },
    { tld: '.WEB.ID', price: 45000, reqKtp: true, desc: 'Pilihan tepat untuk website komunitas, organisasi, atau personal yang ingin tampil lebih profesional.' },
    { tld: '.BIZ.ID', price: 45000, reqKtp: true, desc: 'Khusus untuk UMKM dan usaha lokal yang menargetkan pasar Indonesia. Kurang cocok untuk penggunaan personal seperti portofolio atau blog.' },
    { tld: '.XYZ', price: 35000, reqKtp: false, desc: 'Domain global yang unik, modern, dan gampang diingat untuk berbagai keperluan kreatif & startup.' },
    { tld: '.SITE', price: 35000, reqKtp: false, desc: 'Sangat universal dan bisa digunakan untuk jenis website apa saja tanpa batasan.' },
    { tld: '.ONLINE', price: 45000, reqKtp: false, desc: 'Tunjukkan ke dunia bahwa bisnis atau portofolio kamu sudah sepenuhnya go-digital.' },
    { tld: '.COM', price: 230000, reqKtp: false, desc: 'Top Level Domain (TLD) paling populer di dunia. Wajib punya kalau mau bisnismu kelihatan paling terpercaya.' },
    { tld: '.NET', price: 215000, reqKtp: false, desc: 'Alternatif terbaik setelah .COM, sangat identik dengan perusahaan teknologi, jaringan, dan startup.' },
    { tld: '.ID', price: 290000, reqKtp: true, desc: 'Domain eksklusif Indonesia. Sangat kredibel, singkat, dan bikin brand kamu kelihatan berkelas.' },
    { tld: '.STORE', price: 55000, reqKtp: false, desc: 'Cocok banget buat kamu yang mau buka toko online atau jualan produk digital.' },
    { tld: '.TECH', price: 55000, reqKtp: false, desc: 'Identitas sempurna buat website portfolio developer, startup IT, atau blog teknologi.' },
    { tld: '.FUN', price: 35000, reqKtp: false, desc: 'Domain yang asik buat website hiburan, event, atau project seru-seruan.' }
  ];

  const vpsData: Product[] = [
    {
      id: 'vps1', kategori: 'KVM-1', nama: 'VPS Starter', icon: 'fas fa-server',
      benefits: ['1 CPU', '1GB RAM', '10GB SSD'], notes: ['Lokasi Server Indonesia', 'Full root access'],
      packages: [{ id: 'vp1', durasi: '1 Bulan', harga: 55000, diskonText: null }]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 flex flex-col gap-16">
      
      {/* =========================================
          SESI 1: BANTUAN DOKUMEN & CREATIVE
      ========================================= */}
      <section id="sesi-bantuan">
        <div className="w-full border-t-[3px] border-dashed border-black mb-8"></div>
        <div className="inline-flex bg-[#ffd93d] border-[4px] border-black px-5 py-2 shadow-[6px_6px_0px_#000] mb-8">
          <h2 className="font-bold font-mono text-lg uppercase flex items-center gap-3">
            <i className="fas fa-layer-group text-[#ff6b9d]"></i> BANTUAN DOKUMEN & CREATIVE
          </h2>
        </div>
        <div className="flex flex-col gap-6">
          {bantuanData.map((item) => (
            <div key={item.id} className="bg-white border-[4px] border-black p-5 flex flex-col lg:flex-row items-center gap-6 shadow-[8px_8px_0px_#000] hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 border-[3px] border-black flex items-center justify-center shrink-0 bg-gray-50"><i className={`${item.icon} text-2xl`}></i></div>
              <div className="flex-1 w-full text-center lg:text-left">
                <span className="bg-[#66d9ef] border-[2px] border-black px-2 py-0.5 text-xs font-bold shadow-[2px_2px_0px_#000] mb-2 inline-block">{item.kategori}</span>
                <h3 className="font-bold text-xl leading-tight">{item.nama}</h3>
              </div>
              <div className="flex-1 w-full text-center lg:text-left text-sm font-semibold opacity-90">{item.benefits[0]}</div>
              <div className="font-bold font-mono text-lg shrink-0 w-full lg:w-40 text-center">Mulai Rp {item.packages[0].harga.toLocaleString('id-ID')}</div>
              <div className="flex flex-col gap-2 shrink-0 w-full lg:w-40">
                <button onClick={() => setSelectedService(item)} className="bg-white border-[3px] border-black font-bold text-sm py-2 hover:bg-gray-100 transition-all">Lihat Detail &rarr;</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================
          SESI 2: DOMAIN PREMIUM
      ========================================= */}
      <section id="sesi-domain">
        <div className="w-full border-t-[3px] border-dashed border-black mb-8"></div>
        <div className="inline-flex bg-[#ffd93d] border-[4px] border-black px-5 py-2 shadow-[6px_6px_0px_#000] mb-8">
          <h2 className="font-bold font-mono text-lg uppercase flex items-center gap-3">
            <i className="fas fa-globe text-[#66d9ef]"></i> DOMAIN PREMIUM
          </h2>
        </div>

        {/* Input Form */}
        <div className="bg-white border-[4px] border-black p-4 shadow-[8px_8px_0px_#000] mb-4 flex flex-col md:flex-row gap-4 relative z-10">
          <input 
            type="text" 
            value={domainSearch}
            onChange={(e) => setDomainSearch(e.target.value)}
            placeholder="Ketik nama domain (contoh: ngmarket.my.id)..." 
            className="flex-1 border-[3px] border-black px-4 py-3 outline-none font-bold text-sm focus:bg-gray-50" 
          />
          <button 
            onClick={handleFakeCheck}
            disabled={isChecking}
            className="bg-[#ff6b9d] border-[3px] border-black px-8 py-3 font-bold text-white shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            <i className={isChecking ? "fas fa-spinner fa-spin" : "fas fa-search"}></i> 
            {isChecking ? 'Mengecek...' : 'Cek Ketersediaan'}
          </button>
        </div>

        {/* =========================================
            HASIL FAKE CHECK DOMAIN (Sesuai Screenshot Lu)
        ========================================= */}
        {checkResult && !isChecking && (
          <div className="flex flex-col gap-4 mb-8 animate-in slide-in-from-top-4">
            
            {/* Box Alert Hijau/Merah */}
            <div className={`border-[4px] border-black p-4 shadow-[4px_4px_0px_#000] font-bold flex items-center gap-3 ${checkResult.available ? 'bg-[#a8e6cf] text-black' : 'bg-[#ff4757] text-white'}`}>
              <i className={`fas ${checkResult.available ? 'fa-check-circle' : 'fa-times-circle'} text-xl`}></i>
              Pengecekan {checkResult.domain} selesai: {checkResult.available ? '1 tersedia, 0 sudah diambil.' : '0 tersedia, 1 sudah diambil.'}
            </div>

            {/* Badges / Tags ala Neobrutalism */}
            <div className="flex flex-wrap gap-3 text-[11px] font-bold font-mono">
              <span className="bg-white border-[3px] border-black px-4 py-1.5 rounded-full shadow-[2px_2px_0px_#000] flex items-center uppercase">
                INPUT: {checkResult.domain}
              </span>
              <span className="bg-white border-[3px] border-black px-4 py-1.5 rounded-full shadow-[2px_2px_0px_#000] flex items-center uppercase">
                SCOPE: {checkResult.tld}
              </span>
              <span className={`border-[3px] border-black px-4 py-1.5 rounded-full shadow-[2px_2px_0px_#000] flex items-center ${checkResult.available ? 'bg-[#a8e6cf]' : 'bg-white'}`}>
                {checkResult.available ? '1 TERSEDIA' : '0 TERSEDIA'}
              </span>
              <span className={`border-[3px] border-black px-4 py-1.5 rounded-full shadow-[2px_2px_0px_#000] flex items-center ${!checkResult.available ? 'bg-[#ffebf0] text-[#ff4757]' : 'bg-white'}`}>
                {checkResult.available ? '0 SUDAH DIAMBIL' : '1 SUDAH DIAMBIL'}
              </span>
            </div>

            {/* Tombol Order Pink Raksasa */}
            {checkResult.available && (
              <button 
                onClick={() => {
                   const text = `Halo admin NG Market, saya mau order domain yang tersedia: *${checkResult.domain}*`;
                   window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="w-full bg-[#ff6b9d] border-[4px] border-black py-4 mt-2 font-bold text-white text-lg shadow-[6px_6px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#000] transition-all flex items-center justify-center gap-3"
              >
                <i className="fab fa-whatsapp text-2xl"></i> Order Domain {checkResult.domain} Sekarang
              </button>
            )}
          </div>
        )}

        {/* Grid List Domain Bawah */}
        <div className="flex flex-wrap gap-4 mb-8 mt-6">
          {domainList.map((dom, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedDomain(dom)}
              className="bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center w-[110px] h-[75px] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all cursor-pointer group"
            >
              <span className="font-bold text-sm">{dom.tld}</span>
              <span className="font-mono font-bold text-[#ff6b9d] text-[11px] mt-1 group-hover:hidden">Rp {(dom.price/1000).toString()}k</span>
              <span className="font-mono font-bold text-[#66d9ef] text-[11px] mt-1 hidden group-hover:block uppercase tracking-wider">Detail &rarr;</span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================
          SESI 3: CLOUD VPS PREMIUM
      ========================================= */}
      <section id="sesi-vps">
        <div className="w-full border-t-[3px] border-dashed border-black mb-8"></div>
        <div className="inline-flex bg-[#ffd93d] border-[4px] border-black px-5 py-2 shadow-[6px_6px_0px_#000] mb-8">
          <h2 className="font-bold font-mono text-lg uppercase flex items-center gap-3">
            <i className="fas fa-server text-[#66d9ef]"></i> CLOUD VPS PREMIUM
          </h2>
        </div>

        <div className="bg-[#ffebf0] border-[4px] border-[#ff6b9d] p-6 shadow-[8px_8px_0px_#ff6b9d] mb-10">
          <h4 className="font-bold text-red-600 text-lg mb-4 flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i> Syarat & Ketentuan VPS
          </h4>
          <ul className="space-y-2 font-semibold text-sm text-red-900 opacity-90">
            <li>&rarr; Semua paket server stok terbatas.</li>
            <li>&rarr; Tidak boleh mining atau aktivitas ilegal.</li>
            <li>&rarr; Garansi hangus jika melanggar ketentuan.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          {vpsData.map((pkg) => (
            <div key={pkg.id} className="bg-white border-[4px] border-black p-5 flex flex-col lg:flex-row items-center gap-6 shadow-[8px_8px_0px_#000] hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 border-[3px] border-black flex items-center justify-center shrink-0 bg-gray-50"><i className="fas fa-server text-2xl"></i></div>
              <div className="flex-1 w-full text-center lg:text-left">
                <span className="bg-[#66d9ef] border-[2px] border-black px-2 py-0.5 text-[10px] font-bold shadow-[2px_2px_0px_#000] mb-2 inline-block">{pkg.kategori}</span>
                <h3 className="font-bold text-xl leading-tight">{pkg.nama}</h3>
                <p className="text-[11px] font-mono font-bold mt-1 opacity-70">{pkg.benefits.join(' • ')}</p>
              </div>
              <div className="font-bold font-mono text-[#ff6b9d] text-lg shrink-0 w-full lg:w-40 text-center lg:text-right">Rp {pkg.packages[0].harga.toLocaleString('id-ID')}/bln</div>
              <div className="flex flex-col gap-2 shrink-0 w-full lg:w-44">
                <button onClick={() => setSelectedService(pkg)} className="bg-white border-[3px] border-black font-bold text-sm py-2 hover:bg-gray-100 transition-all">Pilih Paket &rarr;</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================
          MODAL UNTUK JASA & VPS
      ========================================= */}
      <ProductModal 
        isOpen={selectedService !== null} 
        onClose={() => setSelectedService(null)} 
        product={selectedService} 
      />

      {/* =========================================
          MODAL KHUSUS DOMAIN
      ========================================= */}
      {selectedDomain && (
        <div 
          className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedDomain(null)}
        >
          <div 
            className="bg-white border-[4px] border-black shadow-[12px_12px_0px_#000] w-full max-w-md flex flex-col animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#ff6b9d] border-b-[4px] border-black p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <i className="fas fa-globe"></i> Ekstensi {selectedDomain.tld}
              </h3>
              <button 
                onClick={() => setSelectedDomain(null)}
                className="bg-[#ff4757] border-[3px] border-black text-white w-8 h-8 flex items-center justify-center font-bold shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
              >
                X
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <p className="font-bold text-[15px] leading-relaxed">
                {selectedDomain.desc}
              </p>
              {selectedDomain.reqKtp && (
                <div className="border-[3px] border-[#ff4757] p-3 text-[#ff4757] font-bold text-sm flex items-start gap-2 bg-red-50">
                  <i className="fas fa-exclamation-triangle mt-1"></i>
                  <span>PENTING: Pendaftaran domain ini mewajibkan upload foto KTP asli.</span>
                </div>
              )}
              <button 
                onClick={() => handlePesanDomain(selectedDomain.tld)}
                className="w-full bg-[#2ed573] border-[4px] border-black py-3 font-bold text-black shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 text-lg mt-2"
              >
                <i className="fab fa-whatsapp text-xl"></i> Pesan Domain Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}