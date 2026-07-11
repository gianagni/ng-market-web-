"use client";
import { useEffect, useState, useRef } from 'react';
import { createClient } from '../lib/supabase/client';
import { useCart } from '../lib/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Navbar() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();
  const router = useRouter();

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const alreadyGreeted = sessionStorage.getItem('ng_welcomed');
        if (!alreadyGreeted) {
          const name = session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Sobat NG';
          toast.success(`Selamat datang, ${name}! 👋`);
          sessionStorage.setItem('ng_welcomed', 'true');
        }
      }

      if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem('ng_welcomed');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    toast('Sampai jumpa lagi! 😢', { icon: '👋' });
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <nav className="fixed top-0 w-full bg-[#ffd93d] border-b-[4px] border-black z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-[#66d9ef] text-black border-[3px] border-black px-4 py-1.5 font-bold font-mono shadow-[3px_3px_0px_#000] cursor-pointer hover:-translate-y-[2px] hover:shadow-[5px_5px_0px_#000] transition-all"
          >
            NG
          </div>

          <div className="hidden md:flex gap-8 font-bold font-mono">
            <button onClick={() => scrollTo('hero')} className="hover:underline">Produk</button>
            <button onClick={() => scrollTo('sesi-bantuan')} className="hover:underline">Bantuan & Creative</button>
            <button onClick={() => scrollTo('sesi-domain')} className="hover:underline">Domain & VPS</button>
            <button onClick={() => scrollTo('cara-order')} className="hover:underline">Cara Order</button>
            <button onClick={() => scrollTo('testimoni')} className="hover:underline">Testimoni</button>
          </div>

          <div className="flex gap-3 items-center">
            
            <button 
              onClick={() => window.dispatchEvent(new Event('openCart'))}
              className="relative bg-[#ffd93d] border-[3px] border-black px-4 py-1.5 font-bold shadow-[3px_3px_0px_#000] hover:-translate-y-[2px] hover:shadow-[5px_5px_0px_#000] transition-all"
            >
              <i className="fas fa-shopping-cart"></i> ({totalItems})
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#ff4757] border-[2px] border-black text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="bg-white text-black border-[3px] border-black px-4 py-1.5 font-bold font-mono shadow-[3px_3px_0px_#000] hover:-translate-y-[2px] hover:shadow-[5px_5px_0px_#000] transition-all flex items-center gap-2"
                >
                  <i className="fas fa-user-circle text-[#ff6b9d] text-lg"></i>
                  {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 flex flex-col bg-white border-[3px] border-black shadow-[6px_6px_0px_#000] min-w-[160px] z-[99]">
                    <div className="px-4 py-2 border-b-[3px] border-black bg-gray-100 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      Menu Akun
                    </div>
                    <Link 
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-2.5 text-left font-bold text-sm hover:bg-[#66d9ef] transition-colors border-b-[3px] border-black flex items-center justify-between"
                    >
                      Dashboard <i className="fas fa-chart-line"></i>
                    </Link>
                    <button 
                      onClick={() => { setIsMenuOpen(false); setShowLogoutConfirm(true); }}
                      className="px-4 py-2.5 text-left font-bold text-sm hover:bg-[#ff4757] hover:text-white transition-colors flex items-center justify-between"
                    >
                      Logout <i className="fas fa-sign-out-alt"></i>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => window.dispatchEvent(new Event('openAuthModal'))}
                className="bg-white text-black border-[3px] border-black px-4 py-1.5 font-bold font-mono shadow-[3px_3px_0px_#000] hover:-translate-y-[2px] hover:shadow-[5px_5px_0px_#000] transition-all flex items-center gap-2"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MODAL KONFIRMASI LOGOUT */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 z-[999999] flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutConfirm(false); }}
        >
          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_#000] p-6 max-w-sm w-full text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-[#ff4757] border-[4px] border-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000] rounded-full">
              <i className="fas fa-sign-out-alt text-2xl text-white"></i>
            </div>
            <h3 className="font-bold text-xl mb-2">Yakin Mau Logout?</h3>
            <p className="text-sm font-semibold opacity-80 mb-6">
              Kamu harus login lagi buat akses dashboard dan checkout.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)} 
                className="flex-1 bg-white border-[3px] border-black py-2 font-bold hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmLogout} 
                className="flex-1 bg-[#ff4757] text-white border-[3px] border-black py-2 font-bold shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}