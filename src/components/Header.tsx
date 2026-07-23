import React, { useState } from 'react';
import { NavTab, MerchantProfile } from '../types';
import { Menu, Bell, Store, CheckCircle, RefreshCw, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMobileSidebar: () => void;
  merchantProfile: MerchantProfile;
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileSidebar,
  merchantProfile,
  unreadCount,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: '1', title: 'Pesanan Baru Masuk!', desc: 'Order #ORD-129385201 dari Budi Santoso', time: '2 mnt lalu' },
    { id: '2', title: 'Pembayaran Diterima', desc: 'Order #ORD-129385202 sebesar Rp 36.000', time: '10 mnt lalu' },
    { id: '3', title: 'Ulasan 5 Bintang', desc: 'Siti Aminah: "Kopi gula aren enak banget!"', time: '1 jam lalu' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-4 md:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Open Navigation Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-lg md:text-xl font-bold text-[#006e2f] tracking-tight">
            Food Delivery
          </span>
          <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            Merchant
          </span>
        </div>
      </div>

      {/* Middle Top Nav Links (Matching provided HTML design) */}
      <nav className="hidden md:flex items-center gap-6">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`text-sm font-semibold transition-all py-1 ${
            currentTab === 'dashboard'
              ? 'text-[#006e2f] border-b-2 border-[#006e2f]'
              : 'text-slate-600 hover:text-[#006e2f]'
          }`}
        >
          Order / Dashboard
        </button>
        <button
          onClick={() => onSelectTab('menu')}
          className={`text-sm font-semibold transition-all py-1 ${
            currentTab === 'menu'
              ? 'text-[#006e2f] border-b-2 border-[#006e2f]'
              : 'text-slate-600 hover:text-[#006e2f]'
          }`}
        >
          Menu
        </button>
        <button
          onClick={() => onSelectTab('profile')}
          className={`text-sm font-semibold transition-all py-1 ${
            currentTab === 'profile'
              ? 'text-[#006e2f] border-b-2 border-[#006e2f]'
              : 'text-slate-600 hover:text-[#006e2f]'
          }`}
        >
          Profile
        </button>
      </nav>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Store Status Chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Buka</span>
        </div>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition-colors"
            title="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">Notifikasi Pesanan</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  {unreadCount} Baru
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 transition-colors rounded-lg">
                    <p className="text-xs font-bold text-slate-900">{n.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{n.desc}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar Profile Trigger */}
        <button
          onClick={() => onSelectTab('profile')}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-all border border-slate-200/80"
          title="Ke Profil Restoran"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 ring-2 ring-emerald-600/30">
            <img
              src={merchantProfile.avatarUrl}
              alt={merchantProfile.name}
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      </div>
    </header>
  );
};
