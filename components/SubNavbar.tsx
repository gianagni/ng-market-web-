"use client";

export default function SubNavbar() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 140; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <>
      {/* 1. Bar Status & Statistik (Nggak Sticky) */}
      <div className="w-full bg-white border-y-[4px] border-black py-4 px-6 mt-4 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="bg-[#a7f3d0] border-[3px] border-black px-4 py-1.5 font-bold text-sm shadow-[4px_4px_0px_#000] flex items-center gap-2 tracking-wide">
            <i className="fas fa-circle text-[10px]"></i> STORE STATUS: OPEN NOW
          </div>
          <div className="flex flex-wrap items-center gap-6 font-bold text-sm font-mono">
            <span className="flex items-center gap-2"><i className="fas fa-users text-[#ff6b9d]"></i> 500+ Happy Clients</span>
            <span className="flex items-center gap-2"><i className="fas fa-check text-[#ff6b9d]"></i> 1.2k+ Orders Done</span>
            <span className="flex items-center gap-2"><i className="fas fa-star text-[#ff6b9d]"></i> 4.9/5 Rating</span>
          </div>
        </div>
      </div>

      {/* 2. Sticky SubNavbar dengan garis putus-putus menyatu */}
      <div className="sticky top-[73px] z-40 bg-white border-b-[3px] border-dashed border-black py-4 px-6 mb-8 w-full shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-center gap-4 flex-wrap">
          {[
            { label: "Apps Premium", icon: "fas fa-mobile-alt", id: "sesi-apps" },
            { label: "Bantuan Dokumen", icon: "fas fa-laptop-code", id: "sesi-bantuan" },
            { label: "Domain", icon: "fas fa-globe", id: "sesi-domain" },
            { label: "Cloud VPS", icon: "fas fa-server", id: "sesi-vps" },
          ].map((btn) => (
            <button 
              key={btn.label}
              onClick={() => scrollTo(btn.id)}
              className="bg-white border-[3px] border-black px-5 py-2 font-bold font-mono shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#000] transition-all flex items-center gap-2 text-sm"
            >
              <i className={btn.icon}></i> {btn.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}