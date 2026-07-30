import React, { useState } from 'react';
import { NavTab, MerchantProfile, StoreStatus } from '../types';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  BarChart3,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
  PlusCircle,
  Power,
  MapPin,
  Star,
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  merchantProfile: MerchantProfile;
  onToggleStoreStatus: () => void;
  onOpenNewOrderModal: () => void;
  isCollapsedDesktop: boolean;
  onToggleCollapseDesktop: () => void;
}

const STORE_STATUS_CONFIG: Record<StoreStatus, { label: string; color: string; dotColor: string }> = {
  BUKA: {
    label: 'Toko Buka',
    color: 'bg-[#F1DEC4] border-[#e0ceb5] text-[#a13838] hover:bg-[#e0ceb5]',
    dotColor: 'bg-[#F1DEC4]0',
  },
  TUTUP: {
    label: 'Toko Tutup',
    color: 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100',
    dotColor: 'bg-rose-500',
  },
  TIDAK_MENERIMA: {
    label: 'Tidak Menerima Order',
    color: 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100',
    dotColor: 'bg-amber-500',
  },
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  merchantProfile,
  onToggleStoreStatus,
  onOpenNewOrderModal,
  isCollapsedDesktop,
  onToggleCollapseDesktop,
}) => {
  const statusConfig = STORE_STATUS_CONFIG[merchantProfile.storeStatus];

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'orders', label: 'Semua Pesanan', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'menu', label: 'Menu & Produk', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: 'reviews', label: 'Ulasan', icon: <Star className="w-5 h-5" /> },
    { id: 'reports', label: 'Laporan', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'maps', label: 'Tracking Maps', icon: <MapPin className="w-5 h-5" /> },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200 shadow-xl lg:shadow-none flex flex-col justify-between transition-all duration-300 ease-in-out
          ${isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsedDesktop ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Top Header / Branding */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#BD4444] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#BD4444]/20">
                <Store className="w-5 h-5" />
              </div>
              {(!isCollapsedDesktop || isOpenMobile) && (
                <div className="flex flex-col truncate">
                  <span className="font-bold text-slate-900 leading-tight text-base truncate">
                    OurFood
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Merchant Hub</span>
                </div>
              )}
            </div>

            {/* Close mobile button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Toggle Desktop Collapse button */}
            <button
              onClick={onToggleCollapseDesktop}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title={isCollapsedDesktop ? 'Buka Sidebar' : 'Tutup Sidebar'}
            >
              {isCollapsedDesktop ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* 3-State Store Status */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <button
              onClick={onToggleStoreStatus}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs font-semibold ${statusConfig.color}`}
              title="Klik untuk ganti status toko"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${statusConfig.dotColor}`} />
                {(!isCollapsedDesktop || isOpenMobile) && (
                  <span className="truncate">{statusConfig.label}</span>
                )}
              </div>
              {(!isCollapsedDesktop || isOpenMobile) && (
                <Power className="w-3.5 h-3.5 opacity-70 shrink-0" />
              )}
            </button>
          </div>

          {/* New Order Quick Action */}
          {(!isCollapsedDesktop || isOpenMobile) && (
            <div className="p-3">
              <button
                onClick={() => {
                  onOpenNewOrderModal();
                  onCloseMobile();
                }}
                className="w-full py-2.5 px-3 bg-[#BD4444] hover:bg-[#a13838] text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Buat Pesanan Manual</span>
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative
                    ${isActive
                      ? 'bg-[#F1DEC4] text-[#a13838] font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                  title={item.label}
                >
                  <div className={`${isActive ? 'text-[#BD4444]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                  </div>

                  {(!isCollapsedDesktop || isOpenMobile) && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {/* Active Indicator Bar on collapsed desktop */}
                  {isActive && isCollapsedDesktop && !isOpenMobile && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#BD4444] rounded-r-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer — Avatar clickable → goes to Profile */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => handleNavClick('profile')}
            className="w-full flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors group"
            title="Lihat Profil"
          >
            <img
              src={merchantProfile.avatarUrl}
              alt={merchantProfile.nama_merchant}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#677E61]/30 shrink-0 group-hover:ring-[#73976A] transition-all"
            />
            {(!isCollapsedDesktop || isOpenMobile) && (
              <div className="flex flex-col truncate text-left">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {merchantProfile.nama_merchant}
                </span>
                <span className="text-[11px] text-slate-500 truncate">
                  {merchantProfile.no_hp}
                </span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
