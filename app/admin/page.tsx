"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAdminAndFetch() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/');
        return;
      }

      // Cek role dari JWT
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

        if (profile?.role !== 'admin') {
        router.push('/');
        return;
        }
      // Fetch stats
      const [ordersRes, customersRes] = await Promise.all([
        supabase.from('orders').select('status, subtotal'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      if (ordersRes.data) {
        const orders = ordersRes.data;
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          processingOrders: orders.filter(o => o.status === 'processing').length,
          deliveredOrders: orders.filter(o => o.status === 'delivered').length,
          totalRevenue: orders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + Number(o.subtotal), 0),
          totalCustomers: customersRes.count ?? 0,
        });
      }

      setIsLoading(false);
    }

    checkAdminAndFetch();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-[4px] border-black border-t-[#ff6b9d] rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Order', value: stats.totalOrders, icon: 'fas fa-shopping-bag', color: '#66d9ef' },
    { label: 'Pending', value: stats.pendingOrders, icon: 'fas fa-clock', color: '#ffd93d' },
    { label: 'Processing', value: stats.processingOrders, icon: 'fas fa-cog', color: '#ff6b9d' },
    { label: 'Delivered', value: stats.deliveredOrders, icon: 'fas fa-check-circle', color: '#a8e6cf' },
    { label: 'Total Revenue', value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`, icon: 'fas fa-money-bill', color: '#ffd93d' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: 'fas fa-users', color: '#66d9ef' },
  ];

  return (
    <div className="min-h-screen bg-white pt-20 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-bold text-3xl font-mono">ADMIN PANEL</h1>
            <p className="font-semibold opacity-60 mt-1">NG Market Dashboard</p>
          </div>
          <Link
            href="/"
            className="bg-white border-[3px] border-black px-4 py-2 font-bold shadow-[4px_4px_0px_#000] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000] transition-all flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i> Ke Beranda
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_#000]"
              style={{ borderLeftColor: card.color, borderLeftWidth: '8px' }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-sm opacity-60 uppercase tracking-wide">{card.label}</p>
                <div
                  className="w-10 h-10 border-[3px] border-black flex items-center justify-center"
                  style={{ background: card.color }}
                >
                  <i className={`${card.icon} text-sm`}></i>
                </div>
              </div>
              <p className="font-bold text-2xl font-mono">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Kelola Order', desc: 'Lihat, proses, dan deliver order masuk', icon: 'fas fa-list', href: '/admin/orders', color: '#66d9ef' },
            { label: 'Kelola Voucher', desc: 'Buat dan nonaktifkan kode voucher', icon: 'fas fa-tag', href: '/admin/vouchers', color: '#ff6b9d' },
            { label: 'Kelola Stok', desc: 'Isi pool stok akun per paket', icon: 'fas fa-box', href: '/admin/stock', color: '#ffd93d' },
          ].map((nav, i) => (
            <Link
              key={i}
              href={nav.href}
              className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_#000] hover:-translate-y-2 hover:shadow-[12px_12px_0px_#000] transition-all flex flex-col gap-3"
            >
              <div
                className="w-12 h-12 border-[3px] border-black flex items-center justify-center"
                style={{ background: nav.color }}
              >
                <i className={`${nav.icon} text-lg`}></i>
              </div>
              <h3 className="font-bold text-lg">{nav.label}</h3>
              <p className="text-sm font-semibold opacity-60">{nav.desc}</p>
              <span className="font-bold text-sm flex items-center gap-1 mt-auto">
                Buka <i className="fas fa-arrow-right text-xs"></i>
              </span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}