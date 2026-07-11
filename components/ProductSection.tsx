"use client";
import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import { useCart } from '../lib/CartContext';
import OrderSummaryModal from './OrderSummaryModal';
import toast from 'react-hot-toast';

interface Package {
  id: string;
  name: string;
  priceFormatted: string;
  price: number;
  desc?: string;
}

interface Product {
  id: string | number;
  name: string;
  category: string;
  desc: string;
  price: string;
  image: string;
  benefits?: string[];
  notes?: string[];
  packages?: Package[];
}

export default function ProductSection() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderMode, setOrderMode] = useState<'wa' | 'web'>('wa');
  const [checkoutAlert, setCheckoutAlert] = useState<{ productName: string, pkgName: string, pkgId: string, price: number } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [summaryItems, setSummaryItems] = useState<{
    package_id: string;
    product_name: string;
    package_name: string;
    price: number;
    image?: string;
  }[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    const savedMode = localStorage.getItem('ngmarket_order_mode');
    if (savedMode === 'wa' || savedMode === 'web') {
      setTimeout(() => setOrderMode(savedMode as 'wa' | 'web'), 0);
    }
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('products')
        .select(`*, packages (*)`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching products:", error.message);
        setIsLoading(false);
        return;
      }

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedData: Product[] = data.map((item: any) => {
          const pkgs = item.packages || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const minPrice = pkgs.length > 0 ? Math.min(...pkgs.map((p: any) => p.harga || p.price)) : item.harga_mulai || 0;

          return {
            id: item.id,
            name: item.nama || item.name,
            category: item.kategori_slug === 'apps-premium' ? 'Apps Premium' : 
                      item.kategori_slug === 'editing' ? 'Editing' : 
                      item.kategori_slug === 'ai-tools' ? 'AI Tools' : 'Apps Premium',
            desc: item.deskripsi || item.desc || '',
            image: item.gambar_url || item.image || 'https://via.placeholder.com/100?text=No+Image',
            benefits: item.benefits || [],
            notes: item.notes || [],
            price: minPrice.toLocaleString('id-ID'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            packages: pkgs.map((pkg: any) => ({
              id: pkg.id,
              name: pkg.nama || pkg.name,
              price: pkg.harga || pkg.price || 0,
              priceFormatted: (pkg.harga || pkg.price || 0).toLocaleString('id-ID'),
              desc: pkg.desc || ''
            }))
          };
        });
        
        setProducts(formattedData);
      }
      setIsLoading(false);
    }

    fetchProducts();
  }, []);

  const displayedProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleModeChange = (mode: 'wa' | 'web') => {
    setOrderMode(mode);
    localStorage.setItem('ngmarket_order_mode', mode);
  };

  const handleWAOrder = (productName: string, pkgName: string, pkgPriceFormatted: string) => {
    const text = `Halo admin NG Market, saya mau order:\n\nProduk: *${productName}*\nPaket: *${pkgName}*\nHarga: *Rp ${pkgPriceFormatted}*\n\nMohon info pembayarannya ya!`;
    window.open(`https://wa.me/6282124642320?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleWebOrder = async (productName: string, pkgName: string, pkgId: string, price: number, image?: string) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setCheckoutAlert({ productName, pkgName, pkgId, price });
      return;
    }

    setSummaryItems([{
      package_id: pkgId,
      product_name: productName,
      package_name: pkgName,
      price,
      image,
    }]);
    setSelectedProduct(null);
    setShowSummary(true);
  };

  const handleAddToCart = (item: Product) => {
    if (!item.packages || item.packages.length === 0) return;
    const cheapest = item.packages.reduce((a, b) => a.price < b.price ? a : b);
    addItem({
      packageId: cheapest.id,
      productName: item.name,
      packageName: cheapest.name,
      price: cheapest.price,
      image: item.image,
    });
    toast.success(`${item.name} ditambahkan ke keranjang!`);
  };

  const filterTags = ["Semua", "Apps Premium", "AI Tools", "Editing", "Bundle", "Best Seller"];

  const handleCloseModal = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setSelectedProduct(null);
  };

  return (
    <section id="sesi-apps" className="pb-20 scroll-mt-[160px]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* BARIS PENCARIAN & SORTING */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-1 border-[4px] border-black shadow-[6px_6px_0px_#000] bg-white group hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#000] transition-all">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk (contoh: Netflix, Canva, VPS, Domain)..." 
              className="flex-1 px-4 py-3 outline-none text-black font-semibold text-sm w-full"
            />
            <button className="bg-[#ff6b9d] w-14 border-l-[4px] border-black flex items-center justify-center hover:bg-black group-hover:text-white transition-colors">
              <i className="fas fa-search text-white text-lg"></i>
            </button>
          </div>
          
          <button className="bg-[#ffd93d] border-[4px] border-black shadow-[6px_6px_0px_#000] px-6 py-3 font-bold font-mono flex items-center justify-between gap-8 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#000] transition-all min-w-[200px]">
            <div className="flex items-center gap-2">
              <i className="fas fa-sort-amount-down"></i> Default
            </div>
            <i className="fas fa-chevron-down"></i>
          </button>
        </div>

        {/* TOMBOL FILTER KATEGORI */}
        <div className="flex flex-wrap gap-3 mb-10">
          {filterTags.map((tag, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveCategory(tag)}
              className={`${activeCategory === tag ? 'bg-[#ff6b9d] text-white translate-y-[2px] translate-x-[2px] shadow-[2px_2px_0px_#000]' : 'bg-white text-black shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#000]'} border-[3px] border-black px-4 py-2 font-bold text-sm transition-all whitespace-nowrap`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* GRID PRODUK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-center animate-pulse">
              <div className="w-12 h-12 border-[4px] border-black border-t-[#ff6b9d] rounded-full animate-spin"></div>
              <p className="font-bold font-mono text-lg">Mengambil katalog dari Server...</p>
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center border-[4px] border-dashed border-gray-300">
              <p className="font-bold text-gray-500 text-lg">Waduh, produk yang lu cari nggak ketemu nih.</p>
            </div>
          ) : (
            displayedProducts.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border-[4px] border-black p-5 flex flex-col items-center text-center shadow-[8px_8px_0px_#000] hover:-translate-y-2 hover:shadow-[12px_12px_0px_#000] transition-all duration-300 relative group"
              >
                <div className="w-24 h-24 mb-4 p-2 bg-white flex items-center justify-center">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/100?text=Logo' }}
                  />
                </div>

                <span className="bg-[#66d9ef] border-[2px] border-black px-3 py-0.5 text-xs font-bold mb-3 shadow-[2px_2px_0px_#000]">
                  {item.category}
                </span>

                <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                <p className="text-sm text-gray-700 mb-6 flex-grow leading-relaxed">
                  {item.desc}
                </p>

                <div className="w-full mt-auto flex flex-col gap-2.5">
                  <div className="bg-[#ffd93d] border-[3px] border-black font-bold font-mono text-sm py-2 shadow-[3px_3px_0px_#000]">
                    Mulai Rp {item.price}
                  </div>
                  
                  <button 
                    onClick={() => setSelectedProduct(item)}
                    className="bg-white border-[3px] border-black font-bold text-sm py-2 hover:bg-black hover:text-white transition-colors flex justify-center items-center gap-2"
                  >
                    Pilih Paket <i className="fas fa-arrow-right text-xs"></i>
                  </button>

                  <button 
                    onClick={() => handleAddToCart(item)}
                    className="bg-white border-[2px] border-dashed border-black font-bold text-[11px] py-1.5 uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
                  >
                    + Order List
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL DETAIL PRODUK */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/70 z-[9990] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_#000] w-full max-w-xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="bg-[#66d9ef] border-b-[4px] border-black p-3 flex justify-between items-center">
              <div className="flex items-center gap-3 font-bold text-lg">
                <img 
                  src={selectedProduct.image} 
                  alt="Logo" 
                  className="w-8 h-8 object-contain bg-white rounded-full border-[2px] border-black p-1"
                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/100?text=Logo' }} 
                />
                {selectedProduct.name}
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="bg-[#ff4757] border-[3px] border-black text-white w-8 h-8 flex items-center justify-center font-bold shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
              >
                X
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-white flex-grow">
              
              <div className="flex border-[4px] border-black mb-6 rounded-none">
                <button
                  onClick={() => handleModeChange('wa')}
                  className={`flex-1 py-2.5 font-bold text-sm flex items-center justify-center gap-2 border-r-[4px] border-black transition-colors min-w-0 ${
                    orderMode === 'wa' ? 'bg-white text-black' : 'bg-white text-black opacity-50 hover:bg-gray-100'
                  }`}
                >
                  <i className="fab fa-whatsapp flex-shrink-0"></i> <span className="truncate">Order via WhatsApp</span>
                </button>
                <button
                  onClick={() => handleModeChange('web')}
                  className={`flex-1 py-2.5 font-bold text-sm flex items-center justify-center gap-2 transition-colors min-w-0 ${
                    orderMode === 'web' ? 'bg-[#ffd93d] text-black' : 'bg-[#ffd93d] text-black opacity-50 hover:opacity-100'
                  }`}
                >
                  <i className="fas fa-shopping-cart flex-shrink-0"></i> <span className="truncate">Beli di Website</span>
                </button>
              </div>

              <div className="bg-white border-[4px] border-black p-5 mb-6 shadow-[6px_6px_0px_#000]">
                <ul className="space-y-3 mb-5">
                  {selectedProduct.benefits?.map((benefit: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-[15px] font-bold opacity-80">
                      <i className="fas fa-check text-[#a8e6cf] mt-1 text-base"></i> {benefit}
                    </li>
                  ))}
                </ul>
                
                {selectedProduct.notes && selectedProduct.notes.length > 0 && (
                  <>
                    <div className="border-t-[2px] border-dashed border-gray-300 mb-4"></div>
                    <div>
                      <p className="text-[#ff6b9d] font-bold text-[15px] mb-2">Note:</p>
                      <ul className="text-[15px] font-semibold opacity-70 space-y-2">
                        {selectedProduct.notes.map((note: string, i: number) => (
                          <li key={i}>- {note}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                {selectedProduct.packages?.map((pkg: Package, i: number) => (
                  <div key={i} className="bg-white border-[4px] border-black p-4 shadow-[4px_4px_0px_#000]">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-bold text-[17px] mb-1">{pkg.name}</h4>
                        <div className="text-[#ff6b9d] font-mono font-bold text-[15px]">
                          {pkg.price === 0 ? "Via Admin" : `Rp ${pkg.priceFormatted}`}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => orderMode === 'wa' 
                          ? handleWAOrder(selectedProduct.name, pkg.name, pkg.priceFormatted) 
                          : handleWebOrder(selectedProduct.name, pkg.name, pkg.id, pkg.price, selectedProduct.image)
                        }
                        className="bg-[#ffd93d] border-[3px] border-black px-4 py-2.5 font-bold text-sm shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all flex items-center gap-2"
                      >
                        <i className={orderMode === 'wa' ? "fab fa-whatsapp" : "fas fa-shopping-cart"}></i> 
                        {orderMode === 'wa' ? "Order" : "Checkout"}
                      </button>
                    </div>

                    {orderMode === 'web' && pkg.price > 0 && (
                      <button
                        onClick={() => {
                          addItem({
                            packageId: pkg.id,
                            productName: selectedProduct.name,
                            packageName: pkg.name,
                            price: pkg.price,
                            image: selectedProduct.image,
                          });
                          toast.success(`${selectedProduct.name} - ${pkg.name} ditambahkan!`);
                        }}
                        className="w-full bg-white border-[2px] border-dashed border-black py-2 font-bold text-[11px] uppercase tracking-wide hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-plus"></i> Tambah ke Keranjang
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ALERT - Login Required */}
      {checkoutAlert && (
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_#000] p-6 max-w-sm w-full text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-[#ffd93d] border-[4px] border-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000] rounded-full">
              <i className="fas fa-shopping-cart text-2xl"></i>
            </div>
            <h3 className="font-bold text-xl mb-2">Login Dulu Yuk!</h3>
            <p className="text-sm font-semibold opacity-80 mb-6">
              Paket <b>&ldquo;{checkoutAlert.pkgName}&rdquo;</b> dari {checkoutAlert.productName} siap diproses. Lanjut login untuk checkout ya!
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setCheckoutAlert(null)} 
                className="flex-1 bg-white border-[3px] border-black py-2 font-bold hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  setCheckoutAlert(null);
                  window.dispatchEvent(new Event('openAuthModal'));
                }} 
                className="flex-1 bg-[#66d9ef] border-[3px] border-black py-2 font-bold shadow-[3px_3px_0px_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
              >
                Lanjut Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER SUMMARY MODAL */}
      <OrderSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        items={summaryItems}
        onCheckoutSuccess={() => {
          setShowSummary(false);
          setSummaryItems([]);
        }}
      />
    </section>
  );
}