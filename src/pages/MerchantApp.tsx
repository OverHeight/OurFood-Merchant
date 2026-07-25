import React, { useState } from 'react';
import {
  NavTab,
  OrderStatus,
  MenuItem,
  MerchantProfile,
} from '../types';
import {
  INITIAL_MERCHANT_PROFILE,
  INITIAL_MENU_ITEMS,
} from '../data/mockData';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { StatCardsRow } from '../components/StatCardsRow';
import { ActiveOrdersCard } from '../components/ActiveOrdersCard';
import { RevenueChart } from '../components/RevenueChart';
import { OrderHistorySidebar } from '../components/OrderHistorySidebar';
import { NewOrderModal } from '../components/NewOrderModal';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { MenuManagement } from '../components/MenuManagement';
import { OrdersListView } from '../components/OrdersListView';
import { ProfileView } from '../components/ProfileView';
import { Plus } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';

export default function MerchantApp() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile>(
    INITIAL_MERCHANT_PROFILE
  );
  
  const { activeOrders, setActiveOrders, historyOrders, setHistoryOrders, addOrder } = useOrders();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);

  // Layout & Modals
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [isCollapsedDesktopSidebar, setIsCollapsedDesktopSidebar] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Status Handlers
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    // Check in active orders
    const foundActive = activeOrders.find((o) => String(o.order_id) === orderId);
    if (foundActive) {
      if (newStatus === 'SELESAI' || newStatus === 'BATAL') {
        // Move from active to history
        setActiveOrders(activeOrders.filter((o) => String(o.order_id) !== orderId));
        setHistoryOrders([{ ...foundActive, status_order: newStatus }, ...historyOrders]);
      } else {
        setActiveOrders(
          activeOrders.map((o) => (String(o.order_id) === orderId ? { ...o, status_order: newStatus } : o))
        );
      }
    } else {
      // Check in history
      setHistoryOrders(
        historyOrders.map((o) => (String(o.order_id) === orderId ? { ...o, status_order: newStatus } : o))
      );
    }

    if (selectedOrder && String(selectedOrder.order_id) === orderId) {
      setSelectedOrder({ ...selectedOrder, status_order: newStatus });
    }
  };

  const handleToggleStock = (menuId: string | number) => {
    setMenuItems(
      menuItems.map((m) => (m.menu_id === menuId ? { ...m, status_tersedia: !m.status_tersedia } : m))
    );
  };

  const handleToggleStoreStatus = () => {
    setMerchantProfile((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  };

  // Compute exact metrics matching screenshot or dynamic
  const todayCount = activeOrders.length + historyOrders.filter(h => h.status_order === 'SELESAI').length;
  const completedCount = historyOrders.filter(h => h.status_order === 'SELESAI').length;
  const inProgressCount = activeOrders.length;
  const cancelledCount = historyOrders.filter(h => h.status_order === 'BATAL').length;
  const totalRevenue = historyOrders.filter(h => h.status_order === 'SELESAI').reduce((sum, o) => sum + o.total_harga, 0);

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col antialiased">
      {/* Sidebar Component */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
        merchantProfile={merchantProfile}
        onToggleStoreStatus={handleToggleStoreStatus}
        onOpenNewOrderModal={() => setIsNewOrderModalOpen(true)}
        isCollapsedDesktop={isCollapsedDesktopSidebar}
        onToggleCollapseDesktop={() =>
          setIsCollapsedDesktopSidebar(!isCollapsedDesktopSidebar)
        }
      />

      {/* Main Wrapper - Offset by desktop sidebar width */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsedDesktopSidebar ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header Navbar */}
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenMobileSidebar={() => setIsOpenMobileSidebar(true)}
          merchantProfile={merchantProfile}
          unreadCount={activeOrders.length}
        />

        {/* Main Workspace Body */}
        <main className="flex-1 pt-6 pb-16 px-4 md:px-8 max-w-[1440px] w-full mx-auto">
          {currentTab === 'dashboard' && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column (70%) */}
              <div className="flex-1 lg:w-[70%] space-y-6">
                {/* 5 Stat Cards */}
                <StatCardsRow
                  todayCount={todayCount}
                  completedCount={completedCount}
                  inProgressCount={inProgressCount}
                  cancelledCount={cancelledCount}
                  totalRevenue={totalRevenue}
                />

                {/* Active Orders Card */}
                <ActiveOrdersCard
                  orders={activeOrders}
                  onSelectOrder={setSelectedOrder}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onViewAll={() => setCurrentTab('orders')}
                />

                {/* Revenue Chart Card */}
                <RevenueChart />
              </div>

              {/* Right Order History Sidebar (30%) */}
              <OrderHistorySidebar
                historyOrders={historyOrders}
                onSelectOrder={setSelectedOrder}
                onViewAllHistory={() => setCurrentTab('orders')}
              />
            </div>
          )}

          {currentTab === 'orders' && (
            <OrdersListView
              orders={[...activeOrders, ...historyOrders]}
              onSelectOrder={setSelectedOrder}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}

          {currentTab === 'menu' && (
            <MenuManagement
              menuItems={menuItems}
              onToggleStock={handleToggleStock}
            />
          )}

          {currentTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Laporan Analitik Pendapatan
                </h2>
                <p className="text-xs text-slate-500 mb-6">
                  Tinjauan mendalam performa penjualan dan pesanan harian merchant.
                </p>
                <RevenueChart />
              </div>
            </div>
          )}

          {currentTab === 'profile' && (
            <ProfileView
              merchantProfile={merchantProfile}
              onUpdateProfile={setMerchantProfile}
              onToggleStoreStatus={handleToggleStoreStatus}
            />
          )}
        </main>
      </div>

      {/* Floating Action Button (FAB) matching HTML design */}
      <button
        onClick={() => setIsNewOrderModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#006e2f] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 group"
        title="Buat Pesanan Baru"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Modals */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        menuItems={menuItems}
        onAddOrder={addOrder}
      />

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
      />
    </div>
  );
}
