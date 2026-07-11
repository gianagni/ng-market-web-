"use client";
import { useState } from 'react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: "Apa bedanya akun sharing dan private?", a: "Sharing = 1 akun dipakai bersama beberapa orang (lebih murah). Private = akun khusus kamu sendiri, lebih mahal tapi tanpa gangguan pengguna lain." },
    { q: "Berapa lama proses pengiriman akun?", a: "Proses rata-rata memakan waktu 5-10 menit setelah pembayaran dikonfirmasi oleh admin." },
    { q: "Metode pembayaran apa yang tersedia?", a: "Kami menerima transfer via BCA, DANA, ShopeePay, dan QRIS untuk kemudahan transaksi." }
  ];

  return (
    <section id="faq" className="bg-[#ffd93d] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex bg-white border-[4px] border-black px-5 py-2 shadow-[6px_6px_0px_#000] mb-12">
          <h2 className="font-bold font-mono text-lg uppercase flex items-center gap-3">
            <i className="fas fa-question text-[#ff6b9d]"></i> FAQ
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border-[4px] border-black shadow-[8px_8px_0px_#000]">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 flex justify-between items-center font-bold text-left hover:bg-black hover:text-white transition-all"
              >
                <span className="text-lg">{faq.q}</span>
                <i className={`fas fa-chevron-${openIndex === i ? 'up' : 'down'}`}></i>
              </button>
              {openIndex === i && (
                <div className="p-6 border-t-[4px] border-black text-sm opacity-90 leading-relaxed font-semibold bg-white">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}