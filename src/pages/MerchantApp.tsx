import React, { useState } from 'react';
import {
  NavTab,
  OrderStatus,
  MenuItem,
  MerchantProfile,
  StoreStatus,
} from '../types';
import {
  INITIAL_MERCHANT_PROFILE,
  INITIAL_MENU_ITEMS,
  INITIAL_REVIEWS,
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
import { ReviewsView } from '../components/ReviewsView';
import { MapsView } from '../components/MapsView';
import { CancelOrderModal } from '../components/CancelOrderModal';
import { DriverRequestModal } from '../components/DriverRequestModal';
import { AddMenuModal } from '../components/AddMenuModal';
import { UpdateStockModal } from '../components/UpdateStockModal';
import { Plus } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { useDriverRequests } from '../hooks/useDriverRequests';

// Cycle through 3 store statuses
const NEXT_STATUS: Record<StoreStatus, StoreStatus> = {
  BUKA: 'TIDAK_MENERIMA',
  TIDAK_MENERIMA: 'TUTUP',
  TUTUP: 'BUKA',
};

export default function MerchantApp() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile>(
    INITIAL_MERCHANT_PROFILE
  );

  const { activeOrders, setActiveOrders, historyOrders, setHistoryOrders, addOrder } = useOrders();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);

  // Driver requests
  const { currentRequest, acceptRequest, rejectRequest, dismissRequest } = useDriverRequests();

  // Layout & Modals
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [isCollapsedDesktopSidebar, setIsCollapsedDesktopSidebar] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Cancel Order Modal
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);

  // Add Menu Modal
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);

  // Update Stock Modal
  const [selectedMenuItemForStock, setSelectedMenuItemForStock] = useState<MenuItem | null>(null);

  // Status Handlers
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const foundActive = activeOrders.find((o) => String(o.order_id) === orderId);
    if (foundActive) {
      if (newStatus === 'SELESAI' || newStatus === 'BATAL') {
        setActiveOrders(activeOrders.filter((o) => String(o.order_id) !== orderId));
        setHistoryOrders([{ ...foundActive, status_order: newStatus }, ...historyOrders]);
      } else {
        setActiveOrders(
          activeOrders.map((o) => (String(o.order_id) === orderId ? { ...o, status_order: newStatus } : o))
        );
      }
    } else {
      setHistoryOrders(
        historyOrders.map((o) => (String(o.order_id) === orderId ? { ...o, status_order: newStatus } : o))
      );
    }
    if (selectedOrder && String(selectedOrder.order_id) === orderId) {
      setSelectedOrder({ ...selectedOrder, status_order: newStatus });
    }
  };

  const handleCancelOrderRequest = (orderId: string) => {
    // Close detail modal first, open cancel modal
    setCancelModalOrderId(orderId);
    setSelectedOrder(null);
  };

  const handleCancelOrderConfirm = (orderId: string, reason: string) => {
    const foundActive = activeOrders.find((o) => String(o.order_id) === orderId);
    if (foundActive) {
      setActiveOrders(activeOrders.filter((o) => String(o.order_id) !== orderId));
      setHistoryOrders([{ ...foundActive, status_order: 'BATAL', cancelReason: reason, paymentStatus: 'REFUNDED' }, ...historyOrders]);
    } else {
      setHistoryOrders(
        historyOrders.map((o) =>
          String(o.order_id) === orderId
            ? { ...o, status_order: 'BATAL', cancelReason: reason, paymentStatus: 'REFUNDED' }
            : o
        )
      );
    }
    setCancelModalOrderId(null);
  };

  const handleToggleStock = (menuId: string | number) => {
    setMenuItems(
      menuItems.map((m) => (m.menu_id === menuId ? { ...m, status_tersedia: !m.status_tersedia } : m))
    );
  };

  const handleAddMenu = (newItem: Omit<MenuItem, 'menu_id' | 'salesCount'>) => {
    const newId = menuItems.length + 1;
    const added: MenuItem = {
      ...newItem,
      menu_id: newId,
      salesCount: 0,
    };
    setMenuItems([...menuItems, added]);
  };

  const handleUpdateStock = (menuId: string | number, newStock: number) => {
    setMenuItems(
      menuItems.map((m) =>
        m.menu_id === menuId
          ? { ...m, stok: newStock, status_tersedia: newStock > 0 }
          : m
      )
    );
  };

  // Cycle through 3 store statuses
  const handleToggleStoreStatus = () => {
    setMerchantProfile((prev) => ({ ...prev, storeStatus: NEXT_STATUS[prev.storeStatus] }));
  };

  // Metrics
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
                  onCancelOrder={handleCancelOrderRequest}
                  onViewAll={() => setCurrentTab('orders')}
                />

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
              onOpenAddMenu={() => setIsAddMenuModalOpen(true)}
              onOpenUpdateStock={(item) => setSelectedMenuItemForStock(item)}
            />
          )}

          {currentTab === 'reviews' && (
            <ReviewsView reviews={INITIAL_REVIEWS} />
          )}

          {currentTab === 'reports' && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Pendapatan', value: `Rp ${new Intl.NumberFormat('id-ID').format(totalRevenue)}`, color: 'text-emerald-700' },
                  { label: 'Order Selesai', value: completedCount, color: 'text-blue-700' },
                  { label: 'Order Dibatalkan', value: cancelledCount, color: 'text-rose-700' },
                  { label: 'Rata-rata / Order', value: completedCount > 0 ? `Rp ${new Intl.NumberFormat('id-ID').format(Math.floor(totalRevenue / completedCount))}` : '-', color: 'text-violet-700' },
                ].map((item) => (
                  <div key={item.label} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
                    <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                    <p className={`text-lg font-extrabold mt-1 ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
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

          {currentTab === 'maps' && (
            <MapsView merchantProfile={merchantProfile} activeOrders={activeOrders} />
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

      {/* Modals */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        menuItems={menuItems}
        onAddOrder={(newOrder) => {
          addOrder(newOrder);
          setMenuItems((prev) =>
            prev.map((m) => {
              const orderedItem = newOrder.items.find((i) => String(i.menu_id) === String(m.menu_id));
              if (orderedItem) {
                const newStok = Math.max(0, m.stok - orderedItem.jumlah);
                return { ...m, stok: newStok, status_tersedia: newStok > 0 };
              }
              return m;
            })
          );
        }}
      />

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
        onCancelOrder={handleCancelOrderRequest}
      />

      <CancelOrderModal
        orderId={cancelModalOrderId || ''}
        isOpen={!!cancelModalOrderId}
        onClose={() => setCancelModalOrderId(null)}
        onConfirm={handleCancelOrderConfirm}
      />

      <DriverRequestModal
        request={currentRequest}
        onAccept={(id) => { acceptRequest(id); }}
        onReject={(id) => { rejectRequest(id); }}
        onClose={() => currentRequest && dismissRequest(currentRequest.request_id)}
      />

      <AddMenuModal
        isOpen={isAddMenuModalOpen}
        onClose={() => setIsAddMenuModalOpen(false)}
        onAdd={handleAddMenu}
      />

      <UpdateStockModal
        isOpen={!!selectedMenuItemForStock}
        onClose={() => setSelectedMenuItemForStock(null)}
        menuItem={selectedMenuItemForStock}
        onUpdate={handleUpdateStock}
      />
    </div>
  );
}
