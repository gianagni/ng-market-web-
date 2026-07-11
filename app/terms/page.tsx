/* eslint-disable react/no-unescaped-entities */
    "use client";
    import React from 'react';
    import Link from 'next/link';

    export default function TermsPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_#000] p-8 md:p-12">
            
            <div className="border-b-[4px] border-black pb-6 mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Syarat & Ketentuan</h1>
                <p className="font-mono font-bold text-gray-500">NG MARKET</p>
            </div>
            <Link href="/" className="bg-[#ffd93d] border-[3px] border-black px-4 py-2 font-bold shadow-[3px_3px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[5px_5px_0px_#000] transition-all text-sm hidden md:block">
                <i className="fas fa-arrow-left mr-2"></i> Kembali
            </Link>
            </div>

            <div className="space-y-6 text-gray-800 leading-relaxed font-medium">
            <p className="italic font-semibold">Terakhir diperbarui: 27 Juni 2026</p>
            
            <p>Selamat datang di NG Market. Dengan mengakses, mendaftar, atau melakukan transaksi di platform ini, kamu dianggap telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan (S&K) berikut. Jika kamu tidak setuju dengan salah satu poin di bawah, mohon untuk tidak menggunakan layanan kami.</p>

            <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">1. Definisi</h2>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>"Kami"</strong> atau <strong>"NG Market"</strong> merujuk pada platform ini beserta pengelolanya.</li>
                <li><strong>"Pengguna"</strong> atau <strong>"Kamu"</strong> merujuk pada siapa saja yang mengakses, mendaftar, atau bertransaksi di NG Market.</li>
                <li><strong>"Layanan"</strong> merujuk pada produk digital yang kami sediakan, termasuk namun tidak terbatas pada akun premium aplikasi streaming (Netflix, WeTV, VIU, dan sejenisnya), domain, VPS, dan jasa kreatif lainnya.</li>
                <li><strong>"Akun Sharing"</strong> adalah layanan di mana satu kredensial digunakan bersama oleh lebih dari satu pengguna.</li>
                <li><strong>"Akun Private"</strong> adalah layanan di mana satu kredensial hanya digunakan oleh satu pengguna.</li>
            </ul>

            <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">2. Sifat Layanan & Hubungan dengan Pihak Ketiga</h2>
            <ul className="list-none space-y-3">
                <li><strong>2.1.</strong> NG Market adalah penjual langsung (first-party seller), bukan marketplace pihak ketiga. Seluruh transaksi yang terjadi di platform ini adalah transaksi langsung antara Pengguna dan NG Market.</li>
                <li><strong>2.2.</strong> Layanan akun premium (Netflix, WeTV, VIU, Disney+, dan sejenisnya) yang kami sediakan bukan merupakan produk atau layanan resmi dari penyedia aplikasi tersebut. Kami tidak berafiliasi, disponsori, atau didukung secara resmi oleh penyedia aplikasi yang bersangkutan.</li>
                <li><strong>2.3.</strong> Pengguna memahami dan menyetujui bahwa penggunaan akun sharing/reseller berpotensi tidak sesuai dengan Syarat Layanan resmi dari penyedia aplikasi asli. Risiko yang timbul dari kebijakan sepihak penyedia aplikasi (seperti pembatasan device, penghentian sesi, perubahan kebijakan akun keluarga, atau penangguhan akun oleh pihak penyedia) merupakan risiko yang melekat pada jenis layanan ini.</li>
                <li><strong>2.4.</strong> Kami berupaya semaksimal mungkin untuk menjaga kestabilan layanan dan menyediakan mekanisme garansi sebagaimana diatur pada Bagian 4, namun kami tidak dapat menjamin layanan akan berjalan 100% tanpa gangguan akibat tindakan pihak penyedia aplikasi yang berada di luar kendali kami.</li>
            </ul>

            <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">3. Akun & Registrasi</h2>
            <ul className="list-none space-y-3">
                <li><strong>3.1.</strong> Pengguna dapat melakukan transaksi tanpa registrasi akun (melalui WhatsApp) atau dengan mendaftar akun melalui website untuk mendapatkan akses ke fitur tambahan seperti riwayat pesanan, klaim garansi terintegrasi, program tier, dan referral.</li>
                <li><strong>3.2.</strong> Pengguna wajib memberikan informasi yang akurat (nama, nomor WhatsApp, email) saat registrasi. NG Market tidak bertanggung jawab atas kegagalan pengiriman notifikasi atau layanan akibat informasi yang tidak akurat dari Pengguna.</li>
                <li><strong>3.3.</strong> Pengguna bertanggung jawab penuh atas kerahasiaan kredensial login akun NG Market miliknya. Segala aktivitas yang terjadi melalui akun Pengguna dianggap sebagai tindakan Pengguna yang sah, kecuali dapat dibuktikan sebaliknya.</li>
                <li><strong>3.4.</strong> NG Market berhak menangguhkan atau menghapus akun Pengguna yang terbukti melakukan kecurangan, penyalahgunaan sistem, atau pelanggaran terhadap S&K ini, sebagaimana diatur pada Bagian 7.</li>
            </ul>

            <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">4. Kebijakan Garansi & Klaim</h2>
            <ul className="list-none space-y-3">
                <li><strong>4.1.</strong> Setiap layanan yang kami sediakan disertai garansi dengan durasi dan ketentuan yang berbeda-beda sesuai jenis produk, sebagaimana tercantum secara eksplisit pada halaman detail masing-masing produk atau pada invoice pembelian.</li>
                <li><strong>4.2.</strong> Klaim garansi hanya berlaku untuk kerusakan atau gangguan yang bukan disebabkan oleh tindakan Pengguna sendiri, termasuk namun tidak terbatas pada: 
                <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Mengganti password/email akun tanpa izin dari kami.</li>
                    <li>Membagikan kredensial akun Private kepada pihak lain.</li>
                    <li>Melakukan aktivitas yang melanggar Syarat Layanan resmi penyedia aplikasi (sehingga menyebabkan akun terblokir oleh sistem deteksi penyedia).</li>
                </ul>
                </li>
                <li><strong>4.3.</strong> Klaim garansi dilakukan melalui menu "Pesanan Saya" pada dashboard akun Pengguna (untuk transaksi melalui website) atau melalui WhatsApp resmi kami (untuk transaksi tanpa akun).</li>
                <li><strong>4.4.</strong> Setiap pesanan memiliki batas maksimal jumlah klaim yang dapat diajukan, sesuai ketentuan masing-masing produk. Klaim yang melebihi batas atau diajukan setelah masa garansi berakhir akan ditolak secara otomatis oleh sistem.</li>
                <li><strong>4.5.</strong> Keputusan akhir atas validitas suatu klaim (apakah disebabkan oleh kesalahan sistem/penyedia atau kesalahan Pengguna) berada di tangan tim kami setelah dilakukan peninjauan, dan keputusan tersebut bersifat final.</li>
            </ul>

            <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">5. Kebijakan Pembayaran & Refund</h2>
            <ul className="list-none space-y-3">
                <li><strong>5.1.</strong> Pembayaran dilakukan melalui metode yang tersedia di platform (QRIS dan/atau metode lain yang kami sediakan melalui mitra payment gateway resmi).</li>
                <li><strong>5.2.</strong> Pesanan akan diproses setelah pembayaran berhasil dikonfirmasi oleh sistem payment gateway.</li>
                <li><strong>5.3. Kebijakan Refund:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Apabila pesanan sudah dibayar namun gagal diproses akibat kendala dari sistem kami (misalnya stok kredensial tidak tersedia dan tidak dapat dipenuhi dalam waktu yang wajar), Pengguna berhak atas refund penuh sesuai nilai transaksi.</li>
                    <li>Refund tidak berlaku untuk pesanan yang sudah berhasil dikirimkan (status delivered) dan masih dalam kondisi berfungsi normal, kecuali memenuhi ketentuan klaim garansi pada Bagian 4.</li>
                    <li>Proses refund (jika disetujui) akan dilakukan dalam waktu maksimal <strong>7 (tujuh) hari kerja</strong> ke metode pembayaran asal atau metode lain yang disepakati.</li>
                </ul>
                </li>
                <li><strong>5.4.</strong> Pengguna dilarang melakukan chargeback atau pembatalan transaksi secara sepihak melalui pihak bank/e-wallet tanpa melalui proses komplain resmi ke kami terlebih dahulu. Tindakan ini dapat dikategorikan sebagai penyalahgunaan sebagaimana diatur pada Bagian 7.</li>
            </ul>

            <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">6. Program Referral & Saldo</h2>
            <ul className="list-none space-y-3">
                <li><strong>6.1.</strong> Setiap Pengguna terdaftar mendapatkan kode referral unik yang dapat dibagikan kepada pihak lain.</li>
                <li><strong>6.2.</strong> Komisi referral akan masuk ke saldo akun Pengguna setelah transaksi dari pengguna yang direferensikan berhasil diselesaikan (status delivered), sesuai persentase/nominal yang berlaku saat itu.</li>
                <li><strong>6.3.</strong> NG Market berhak membatalkan komisi referral yang terindikasi berasal dari kecurangan, termasuk namun tidak terbatas pada: pendaftaran akun ganda oleh pihak yang sama, transaksi fiktif, atau kerja sama yang bertujuan memanipulasi sistem referral.</li>
                <li><strong>6.4.</strong> Minimum penarikan (withdrawal) saldo referral adalah <strong>Rp50.000 (lima puluh ribu rupiah)</strong>, dengan mekanisme penarikan yang dapat diakses melalui menu Dashboard akun Pengguna.</li>
            </ul>

            <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">7. Larangan Penggunaan</h2>
            <p className="mb-2">Pengguna dilarang untuk:</p>
            <ul className="list-none space-y-3">
                <li><strong>7.1.</strong> Membagikan ulang (reselling) kredensial akun Private kepada pihak lain tanpa izin tertulis dari kami.</li>
                <li><strong>7.2.</strong> Membuat akun ganda dengan identitas berbeda untuk menyalahgunakan promo, diskon, atau program referral.</li>
                <li><strong>7.3.</strong> Melakukan tindakan yang dapat membahayakan sistem kami, termasuk namun tidak terbatas pada percobaan akses tidak sah ke sistem, eksploitasi bug, atau serangan teknis lainnya.</li>
                <li><strong>7.4.</strong> Melakukan chargeback atau penyangkalan transaksi yang sah tanpa dasar yang valid.</li>
            </ul>
            <p className="mt-2 text-[#ff4757] font-bold">Pelanggaran terhadap ketentuan ini dapat berakibat pada penangguhan akun, pembatalan saldo/komisi, dan/atau pelaporan kepada pihak berwenang sesuai hukum yang berlaku di Indonesia.</p>

            <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">8. Privasi & Data Pribadi</h2>
            <ul className="list-none space-y-3">
                <li><strong>8.1.</strong> Kami mengumpulkan data pribadi Pengguna (nama, nomor WhatsApp, email, riwayat transaksi) semata-mata untuk keperluan operasional layanan: pengiriman produk, notifikasi status pesanan, dan komunikasi terkait klaim garansi.</li>
                <li><strong>8.2.</strong> Seluruh data pribadi dan data transaksi Pengguna (termasuk nomor WhatsApp, email, riwayat pesanan, dan kredensial akun layanan) bersifat rahasia. Kami menerapkan langkah-langkah keamanan teknis yang wajar untuk melindungi data tersebut, termasuk enkripsi khusus untuk data kredensial akun layanan dan pembatasan akses internal sehingga hanya pihak yang berwenang yang dapat mengakses data tersebut.</li>
                <li><strong>8.3.</strong> Kami tidak akan membagikan data pribadi Pengguna kepada pihak ketiga untuk tujuan komersial tanpa persetujuan, kecuali diwajibkan oleh hukum yang berlaku.</li>
                <li><strong>8.4.</strong> Pengguna berhak mengajukan permintaan untuk mengakses, memperbarui, atau menghapus data pribadinya dengan menghubungi kami melalui kontak resmi yang tersedia.</li>
                <li><strong>8.5.</strong> Pengumpulan dan pengelolaan data pribadi pada platform ini tunduk pada Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.</li>
            </ul>

            <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">9. Batasan Tanggung Jawab</h2>
            <ul className="list-none space-y-3">
                <li><strong>9.1.</strong> Sejauh diizinkan oleh hukum yang berlaku, NG Market tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan layanan, termasuk namun tidak terbatas pada kehilangan data pribadi Pengguna pada platform pihak ketiga (Netflix, WeTV, dst.) akibat penangguhan akun oleh penyedia aplikasi tersebut.</li>
                <li><strong>9.2.</strong> Total tanggung jawab kami atas suatu transaksi, dalam keadaan apa pun, tidak akan melebihi nilai nominal yang telah dibayarkan Pengguna untuk transaksi tersebut.</li>
            </ul>

            <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">10. Perubahan Syarat & Ketentuan</h2>
            <p>Kami berhak mengubah, menambah, atau menghapus bagian dari S&K ini sewaktu-waktu. Perubahan akan diinformasikan melalui platform kami, dan penggunaan layanan setelah perubahan diberlakukan dianggap sebagai persetujuan Pengguna terhadap S&K yang telah diperbarui.</p>

            <h2 className="text-xl font-bold text-black mt-8 mb-4 bg-[#66d9ef] inline-block px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">11. Hukum yang Berlaku</h2>
            <p>S&K ini diatur dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia.</p>


            </div>
            
        </div>
        </div>
    );
    }