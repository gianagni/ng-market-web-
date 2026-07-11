"use client";
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1200);
    const fallback = setTimeout(() => setVisible(false), 2000);
    return () => {
      clearTimeout(timer);
      clearTimeout(fallback);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-[#ffd93d] z-[999999] flex flex-col items-center justify-center gap-8">
      
      {/* Floating Icons */}
      <div className="absolute top-[15%] left-[15%] w-12 h-12 bg-[#66d9ef] border-[3px] border-black shadow-[4px_4px_0px_#000] flex items-center justify-center text-xl animate-bounce rotate-[-10deg]">
        <i className="fas fa-play"></i>
      </div>
      <div className="absolute bottom-[20%] left-[20%] w-12 h-12 bg-[#a8e6cf] border-[3px] border-black shadow-[4px_4px_0px_#000] flex items-center justify-center text-xl animate-bounce rotate-[15deg] [animation-delay:0.5s]">
        <i className="fas fa-crown"></i>
      </div>
      <div className="absolute top-[25%] right-[15%] w-12 h-12 bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] flex items-center justify-center text-xl animate-bounce rotate-[10deg] [animation-delay:1s]">
        <i className="fas fa-music"></i>
      </div>

      {/* Letters N G */}
      <div className="flex gap-4">
        <div className="w-24 h-24 bg-[#66d9ef] border-[5px] border-black shadow-[8px_8px_0px_#000] flex items-center justify-center text-6xl font-bold animate-[letter-pop_0.5s_cubic-bezier(0.68,-0.55,0.265,1.55)_0.1s_both]">
          N
        </div>
        <div className="w-24 h-24 bg-[#ff6b9d] border-[5px] border-black shadow-[8px_8px_0px_#000] flex items-center justify-center text-6xl font-bold animate-[letter-pop_0.5s_cubic-bezier(0.68,-0.55,0.265,1.55)_0.2s_both]">
          G
        </div>
      </div>

      {/* Loading Bar */}
      <div className="w-[260px] h-4 bg-white border-[4px] border-black shadow-[4px_4px_0px_#000] overflow-hidden">
        <div className="h-full bg-[#ffd93d] animate-[bar-fill_0.7s_ease-out_0.3s_both]"></div>
      </div>
    </div>
  );
}