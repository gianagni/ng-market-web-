"use client";

const WA_NUMBER = "6282124642320";

export default function Footer() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="font-bold font-mono text-3xl mb-1 tracking-tight">
            NG<span className="text-[#ffd93d]">.</span>
          </div>
          <div className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-5">Market</div>
          <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
            Toko digital terpercaya buat lo yang butuh akun premium, domain murah, VPS kenceng, atau bantuan kreatif.
          </p>
          <a href={"https://wa.me/" + WA_NUMBER} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border-[2px] border-gray-700 px-4 py-2 text-gray-400 hover:border-[#25D366] hover:text-[#25D366] transition-all text-sm font-semibold">
            <i className="fab fa-whatsapp"></i> Chat Admin
          </a>
        </div>

        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.25em] mb-5 border-b border-gray-800 pb-3">
            Menu
          </div>
          <ul className="flex flex-col gap-2.5 text-sm text-gray-400">
            {[
              { label: "Apps Premium", id: "sesi-apps" },
              { label: "Bantuan Dokumen", id: "sesi-bantuan" },
              { label: "Domain Premium", id: "sesi-domain" },
              { label: "Cloud VPS", id: "sesi-vps" },
              { label: "Cara Order", id: "cara-order" },
              { label: "Testimoni", id: "testimoni" },
              { label: "FAQ", id: "faq" },
            ].map((item, i) => (
              <li key={i}>
                <button onClick={() => scrollTo(item.id)} className="hover:text-white transition-colors text-left">
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.25em] mb-5 border-b border-gray-800 pb-3">
            Info
          </div>
          <ul className="flex flex-col gap-3 text-sm text-gray-400">
            <li>⏱ Open <span className="text-white font-semibold">24/7</span></li>
            <li>⚡ Proses <span className="text-white font-semibold">5–10 menit</span></li>
            <li>🛡 Semua produk <span className="text-white font-semibold">bergaransi</span></li>
            <li>📍 Indonesia 🇮🇩</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-gray-600 font-mono">
          <span>© 2026 NG Market.</span>
          <span>Made with <span className="text-[#ff6b9d]">♥</span> in Indonesia</span>
        </div>
      </div>

      <a href={"https://wa.me/" + WA_NUMBER} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-[999] flex items-end gap-2 group" aria-label="Chat via WhatsApp">
        <div className="bg-white text-black text-xs font-bold px-3 py-2 rounded-2xl rounded-br-none border-[2px] border-black shadow-[3px_3px_0px_#000] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap mb-1">
          Ada yang bisa dibantu? 💬
        </div>
        <div className="w-14 h-14 bg-[#25D366] border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all duration-200">
          <i className="fab fa-whatsapp text-white text-2xl"></i>
        </div>
      </a>
    </footer>
  );
}