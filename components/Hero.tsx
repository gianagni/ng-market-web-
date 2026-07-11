"use client";

export default function Hero() {
  return (
    // Padding atasnya kita kurangi biar langsung nempel rapi di bawah Navbar
    <section className="min-h-[85vh] pt-12 pb-[60px] px-6 flex items-center bg-transparent" id="hero">
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
        
        {/* Bagian Kiri (Teks) */}
        <div className="flex flex-col items-start">
          <div className="inline-block bg-[#ff6b9d] border-[3px] border-black px-4 py-1.5 text-sm font-bold font-mono mb-6 shadow-[3px_3px_0px_#000]">
            ⚡ OPEN ORDER 24/7
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] mb-6">
            Solusi Kebutuhan <span className="bg-[#ffd93d] px-2.5 border-b-[5px] border-black inline-block">Digitalmu!</span>
          </h1>
          <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-lg opacity-90 font-semibold">
            Layanan Premium, Domain Murah, VPS Performa Tinggi, dan Layanan Kreatif Terpercaya. Bergaransi 100% dengan proses instan via WhatsApp.
          </p>
          <a href="#sesi-apps" className="bg-[#66d9ef] border-[3px] border-black shadow-[6px_6px_0px_#000] px-8 py-3.5 font-bold text-lg hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#000] transition-all flex items-center gap-2.5 text-black">
            Lihat Katalog <i className="fas fa-shopping-cart"></i>
          </a>
        </div>

        {/* Bagian Kanan (Gambar Tumpuk Retro) */}
        <div className="relative w-full max-w-[400px] h-[280px] mx-auto mt-12 md:mt-0">
          {/* Latar Belakang Tumpukan (Pink & Cyan) */}
          <div className="absolute inset-0 bg-[#ff6b9d] border-4 border-black -rotate-6 -translate-x-4 translate-y-4 z-0"></div>
          <div className="absolute inset-0 bg-[#66d9ef] border-4 border-black rotate-6 translate-x-4 -translate-y-2 z-10"></div>
          
          {/* Gambar Utama (Banner Netflix) */}
          <img 
            src="/assets/banner/netflix.png" 
            alt="Netflix Premium" 
            className="absolute inset-0 w-full h-full object-cover border-4 border-black bg-white shadow-[10px_10px_0px_#000] z-20 transition-transform hover:scale-105"
            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/450x320?text=Netflix+Premium' }}
          />
        </div>

      </div>
    </section>
  );
}