import React, { useState, useEffect } from "react";
import { NavTab, OrderStatus, MenuItem, StoreStatus, Review } from "../types";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { StatCardsRow } from "../components/StatCardsRow";
import { ActiveOrdersCard } from "../components/ActiveOrdersCard";
import { RevenueChart } from "../components/RevenueChart";
import { OrderHistorySidebar } from "../components/OrderHistorySidebar";
import { NewOrderModal } from "../components/NewOrderModal";
import { OrderDetailModal } from "../components/OrderDetailModal";
import { MenuManagement } from "../components/MenuManagement";
import { OrdersListView } from "../components/OrdersListView";
import { ProfileView } from "../components/ProfileView";
import { ReviewsView } from "../components/ReviewsView";
import { MapsView } from "../components/MapsView";
import { CancelOrderModal } from "../components/CancelOrderModal";
import { AddMenuModal } from "../components/AddMenuModal";
import { EditMenuModal } from "../components/EditMenuModal";
import { UpdateStockModal } from "../components/UpdateStockModal";
import { Plus } from "lucide-react";
import { useOrders } from "../hooks/useOrders";
import { useMerchant } from "../hooks/useMerchant";
import { useMenu } from "../hooks/useMenu";
import { fetchReviewsByMerchant } from "../services/reviewService";
import { getMerchantId } from "../lib/supabase";

// Cycle through 3 store statuses
const NEXT_STATUS: Record<StoreStatus, StoreStatus> = {
  BUKA: "TIDAK_MENERIMA",
  TIDAK_MENERIMA: "TUTUP",
  TUTUP: "BUKA",
};

export default function MerchantApp() {
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");
  const [reviews, setReviews] = useState<Review[]>([]);

  const {
    merchant: merchantProfile,
    handleUpdateStoreStatus,
    handleUpdateProfile,
  } = useMerchant();

  const {
    menuItems,
    kategoriList,
    handleToggleAvailability,
    handleAddMenu,
    handleEditMenu,
    handleUpdateStock,
    handleDeleteMenu,
  } = useMenu();

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setNotification({ type, message });
    window.setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteMenuWithNotification = async (menuId: string) => {
    const deleted = await handleDeleteMenu(menuId);
    if (deleted) {
      showNotification("Menu berhasil dihapus.", "success");
    } else {
      showNotification("Gagal menghapus menu. Silakan coba lagi.", "error");
    }
  };

  const {
    activeOrders,
    historyOrders,
    notifications,
    addOrder,
    handleUpdateOrderStatus,
    cancelOrder,
    loadOrders,
  } = useOrders();

  const merchantId = getMerchantId();

  useEffect(() => {
    async function loadReviews() {
      const realReviews = await fetchReviewsByMerchant(merchantId);
      setReviews(realReviews);
    }
    loadReviews();
  }, [merchantId]);

  // Layout & Modals
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [isCollapsedDesktopSidebar, setIsCollapsedDesktopSidebar] =
    useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Cancel Order Modal
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(
    null,
  );

  // Add Menu Modal
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);

  // Edit Menu Modal
  const [isEditMenuModalOpen, setIsEditMenuModalOpen] = useState(false);
  const [selectedMenuToEdit, setSelectedMenuToEdit] = useState<MenuItem | null>(
    null,
  );

  // Update Stock Modal
  const [selectedMenuItemForStock, setSelectedMenuItemForStock] =
    useState<MenuItem | null>(null);

  // Status Handlers
  const handleCancelOrderRequest = (orderId: string) => {
    setCancelModalOrderId(orderId);
    setSelectedOrder(null);
  };

  const handleCancelOrderConfirm = (orderId: string, reason: string) => {
    cancelOrder(orderId, reason);
    setCancelModalOrderId(null);
  };

  const handleToggleStoreStatusWrapper = () => {
    handleUpdateStoreStatus(NEXT_STATUS[merchantProfile.storeStatus || "BUKA"]);
  };

  // Metrics
  const todayCount =
    activeOrders.length +
    historyOrders.filter((h) => h.status_order === "DELIVERED").length;
  const completedCount = historyOrders.filter(
    (h) => h.status_order === "DELIVERED",
  ).length;
  const inProgressCount = activeOrders.length;
  const cancelledCount = historyOrders.filter(
    (h) => h.status_order === "CANCELLED_BY_MERCHANT" || h.status_order === "CANCELLED_BY_USER",
  ).length;
  const totalRevenue = historyOrders
    .filter((h) => h.status_order === "DELIVERED")
    .reduce((sum, o) => sum + o.total_harga, 0);

  return (
    <div className="min-h-screen bg-[#fcf8f2] text-[#0b1c30] flex flex-col antialiased">
      {/* Sidebar Component */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
        merchantProfile={merchantProfile}
        onToggleStoreStatus={handleToggleStoreStatusWrapper}
        onOpenNewOrderModal={() => setIsNewOrderModalOpen(true)}
        isCollapsedDesktop={isCollapsedDesktopSidebar}
        onToggleCollapseDesktop={() =>
          setIsCollapsedDesktopSidebar(!isCollapsedDesktopSidebar)
        }
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsedDesktopSidebar ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Header Component */}
        <Header
          merchantProfile={merchantProfile}
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          notifications={notifications}
          onOpenMobileSidebar={() => setIsOpenMobileSidebar(true)}
          onToggleStoreStatus={handleToggleStoreStatusWrapper}
        />

        {/* Dynamic Notification Toast */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold transition-all animate-in fade-in slide-in-from-top-2 ${
              notification.type === "success"
                ? "bg-[#F1DEC4] border-[#e0ceb5] text-[#BD4444]"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Body Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-grow space-y-6 max-w-[1600px] w-full mx-auto">
          {/* TAB: Dashboard */}
          {currentTab === "dashboard" && (
            <>
              {/* Stat Cards */}
              <StatCardsRow
                todayCount={todayCount}
                completedCount={completedCount}
                inProgressCount={inProgressCount}
                cancelledCount={cancelledCount}
                totalRevenue={totalRevenue}
              />

              {/* Main Content Area: Active Orders & Revenue Chart */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Area (70%): Active Orders & Revenue */}
                <div className="w-full lg:w-[70%] space-y-6">
                  <ActiveOrdersCard
                    merchantProfile={merchantProfile}
                    orders={activeOrders}
                    onSelectOrder={setSelectedOrder}
                    onUpdateStatus={handleUpdateOrderStatus}
                    onCancelOrder={handleCancelOrderRequest}
                    onViewAll={() => setCurrentTab("orders")}
                  />
                  <RevenueChart />
                </div>

                {/* Right Area (30%): Order History Sidebar */}
                <OrderHistorySidebar
                  historyOrders={historyOrders}
                  onSelectOrder={setSelectedOrder}
                  onViewAllHistory={() => setCurrentTab("orders")}
                />
              </div>
            </>
          )}

          {/* TAB: Orders List */}
          {currentTab === "orders" && (
            <OrdersListView
              orders={[...activeOrders, ...historyOrders]}
              onSelectOrder={setSelectedOrder}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}

          {/* TAB: Menu Management */}
          {currentTab === "menu" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Manajemen Menu & Stok
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Atur daftar menu, ketersediaan, dan update stok secara cepat.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddMenuModalOpen(true)}
                  className="px-4 py-2 bg-[#BD4444] hover:bg-[#a13838] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Menu</span>
                </button>
              </div>

              <MenuManagement
                menuItems={menuItems}
                kategoriList={kategoriList}
                onToggleAvailability={handleToggleAvailability}
                onEditMenu={(menu) => {
                  setSelectedMenuToEdit(menu);
                  setIsEditMenuModalOpen(true);
                }}
                onUpdateStock={(menu) => {
                  setSelectedMenuItemForStock(menu);
                }}
                onDeleteMenu={(menuId) =>
                  handleDeleteMenuWithNotification(String(menuId))
                }
              />
            </div>
          )}

          {/* TAB: Live Maps Tracking */}
          {currentTab === "maps" && (
            <MapsView
              merchantProfile={merchantProfile}
              activeOrders={activeOrders}
            />
          )}

          {/* TAB: Reviews */}
          {currentTab === "reviews" && <ReviewsView reviews={reviews} />}

          {/* TAB: Profile */}
          {currentTab === "profile" && (
            <ProfileView
              merchantProfile={merchantProfile}
              onUpdateProfile={handleUpdateProfile}
              onToggleStoreStatus={handleToggleStoreStatusWrapper}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        menuItems={menuItems}
        onAddOrder={async (newOrder) => {
          await addOrder(newOrder);
          await loadOrders();
        }}
      />

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
        onCancelOrder={handleCancelOrderRequest}
      />

      <CancelOrderModal
        orderId={cancelModalOrderId || ""}
        isOpen={!!cancelModalOrderId}
        onClose={() => setCancelModalOrderId(null)}
        onConfirm={handleCancelOrderConfirm}
      />

      <AddMenuModal
        isOpen={isAddMenuModalOpen}
        onClose={() => setIsAddMenuModalOpen(false)}
        onAdd={handleAddMenu}
        categories={kategoriList}
      />

      <EditMenuModal
        isOpen={isEditMenuModalOpen}
        onClose={() => {
          setIsEditMenuModalOpen(false);
          setSelectedMenuToEdit(null);
        }}
        onEdit={handleEditMenu}
        categories={kategoriList}
        menuItem={selectedMenuToEdit}
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
