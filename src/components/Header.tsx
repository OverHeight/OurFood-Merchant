import React, { useState } from "react";
import {
  NavTab,
  MerchantProfile,
  OrderNotification,
  StoreStatus,
} from "../types";
import { Menu, Bell, LogOut } from "lucide-react";

const STORE_STATUS_CHIP: Record<
  StoreStatus,
  { label: string; cls: string; dot: string }
> = {
  BUKA: {
    label: "Buka",
    cls: "bg-[#F1DEC4] text-[#a13838] border-[#e0ceb5]",
    dot: "bg-[#F1DEC4]0",
  },
  TUTUP: {
    label: "Tutup",
    cls: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
  },
  TIDAK_MENERIMA: {
    label: "Tidak Menerima",
    cls: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
};

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMobileSidebar: () => void;
  merchantProfile: MerchantProfile;
  unreadCount: number;
  notifications: OrderNotification[];
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileSidebar,
  merchantProfile,
  unreadCount,
  notifications,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

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
          <span className="text-lg md:text-xl font-bold text-[#BD4444] tracking-tight">
            OurFood
          </span>
          <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F1DEC4] text-[#a13838] border border-[#e0ceb5]">
            Merchant
          </span>
        </div>
      </div>

      {/* Middle Top Nav Links (Matching provided HTML design) */}
      <nav className="hidden md:flex items-center gap-6">
        <button
          onClick={() => onSelectTab("dashboard")}
          className={`text-sm font-semibold transition-all py-1 ${
            currentTab === "dashboard"
              ? "text-[#BD4444] border-b-2 border-[#BD4444]"
              : "text-slate-600 hover:text-[#BD4444]"
          }`}
        >
          Order / Dashboard
        </button>
        <button
          onClick={() => onSelectTab("menu")}
          className={`text-sm font-semibold transition-all py-1 ${
            currentTab === "menu"
              ? "text-[#BD4444] border-b-2 border-[#BD4444]"
              : "text-slate-600 hover:text-[#BD4444]"
          }`}
        >
          Menu
        </button>
        <button
          onClick={() => onSelectTab("reviews")}
          className={`text-sm font-semibold transition-all py-1 ${
            currentTab === "reviews"
              ? "text-[#BD4444] border-b-2 border-[#BD4444]"
              : "text-slate-600 hover:text-[#BD4444]"
          }`}
        >
          Ulasan
        </button>
      </nav>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Store Status Chip — Dynamic 3-state */}
        {(() => {
          const chip = STORE_STATUS_CHIP[merchantProfile.storeStatus];
          return (
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${chip.cls}`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${chip.dot}`}
              />
              <span>{chip.label}</span>
            </div>
          );
        })()}

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
                <span className="font-bold text-sm text-slate-900">
                  Notifikasi Pesanan
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-[#a13838] rounded-full">
                  {unreadCount} Baru
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    Belum ada notifikasi pesanan.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="py-2.5 px-1 hover:bg-slate-50 transition-colors rounded-lg"
                    >
                      <p className="text-xs font-bold text-slate-900">
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {n.description}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {n.time}
                      </span>
                      <span className="text-[10px] text-[#BD4444] mt-1 block">
                        Order {n.orderId}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.removeItem("merchantId");
            window.location.href = "/";
          }}
          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 relative transition-colors ml-1"
          title="Keluar"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
