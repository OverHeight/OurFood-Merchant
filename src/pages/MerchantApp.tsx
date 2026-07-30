import React, { useState } from "react";
import { NavTab, OrderStatus, MenuItem, StoreStatus } from "../types";
import { INITIAL_REVIEWS } from "../data/mockData";
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
import { DriverRequestModal } from "../components/DriverRequestModal";
import { AddMenuModal } from "../components/AddMenuModal";
import { EditMenuModal } from "../components/EditMenuModal";
import { UpdateStockModal } from "../components/UpdateStockModal";
import { Plus } from "lucide-react";
import { useOrders } from "../hooks/useOrders";
import { useDriverRequests } from "../hooks/useDriverRequests";
import { useMerchant } from "../hooks/useMerchant";
import { useMenu } from "../hooks/useMenu";

// Cycle through 3 store statuses
const NEXT_STATUS: Record<StoreStatus, StoreStatus> = {
  BUKA: "TIDAK_MENERIMA",
  TIDAK_MENERIMA: "TUTUP",
  TUTUP: "BUKA",
};

export default function MerchantApp() {
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");

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
    addOrder,
    handleUpdateOrderStatus,
    cancelOrder,
    loadOrders,
  } = useOrders();

  // Driver requests
  const { currentRequest, acceptRequest, rejectRequest, dismissRequest } =
    useDriverRequests();

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
    // Close detail modal first, open cancel modal
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
    historyOrders.filter((h) => h.status_order === "SELESAI").length;
  const completedCount = historyOrders.filter(
    (h) => h.status_order === "SELESAI",
  ).length;
  const inProgressCount = activeOrders.length;
  const cancelledCount = historyOrders.filter(
    (h) => h.status_order === "BATAL",
  ).length;
  const totalRevenue = historyOrders
    .filter((h) => h.status_order === "SELESAI")
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

      {/* Main Wrapper - Offset by desktop sidebar width */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsedDesktopSidebar ? "lg:pl-20" : "lg:pl-64"
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
        {notification && (
          <div className="fixed top-6 right-6 z-50 w-[320px] rounded-3xl border px-4 py-3 shadow-2xl backdrop-blur-xl transition-opacity duration-200">
            <div
              className={`flex items-start gap-3 rounded-3xl p-3 text-sm font-medium ${
                notification.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border border-rose-200 text-rose-900"
              }`}
            >
              <div className="flex-1">
                <p className="font-semibold">
                  {notification.type === "success" ? "Berhasil" : "Gagal"}
                </p>
                <p className="mt-1 text-xs leading-relaxed">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace Body */}
        <main className="flex-1 pt-6 pb-16 px-4 md:px-8 max-w-[1440px] w-full mx-auto">
          {currentTab === "dashboard" && (
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
                  onViewAll={() => setCurrentTab("orders")}
                />
              </div>

              {/* Right Order History Sidebar (30%) */}
              <OrderHistorySidebar
                historyOrders={historyOrders}
                onSelectOrder={setSelectedOrder}
                onViewAllHistory={() => setCurrentTab("orders")}
              />
            </div>
          )}

          {currentTab === "orders" && (
            <OrdersListView
              orders={[...activeOrders, ...historyOrders]}
              onSelectOrder={setSelectedOrder}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}

          {currentTab === "menu" && (
            <MenuManagement
              menuItems={menuItems}
              onToggleStock={handleToggleAvailability}
              onOpenAddMenu={() => setIsAddMenuModalOpen(true)}
              onOpenUpdateStock={(item) => setSelectedMenuItemForStock(item)}
              onOpenEditMenu={(item) => {
                setSelectedMenuToEdit(item);
                setIsEditMenuModalOpen(true);
              }}
              onDeleteMenu={handleDeleteMenuWithNotification}
            />
          )}

          {currentTab === "reviews" && (
            <ReviewsView reviews={INITIAL_REVIEWS} />
          )}

          {currentTab === "reports" && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Pendapatan",
                    value: `Rp ${new Intl.NumberFormat("id-ID").format(totalRevenue)}`,
                    color: "text-[#BD4444]",
                  },
                  {
                    label: "Order Selesai",
                    value: completedCount,
                    color: "text-blue-700",
                  },
                  {
                    label: "Order Dibatalkan",
                    value: cancelledCount,
                    color: "text-rose-700",
                  },
                  {
                    label: "Rata-rata / Order",
                    value:
                      completedCount > 0
                        ? `Rp ${new Intl.NumberFormat("id-ID").format(Math.floor(totalRevenue / completedCount))}`
                        : "-",
                    color: "text-violet-700",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]"
                  >
                    <p className="text-xs text-slate-500 font-medium">
                      {item.label}
                    </p>
                    <p className={`text-lg font-extrabold mt-1 ${item.color}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Laporan Analitik Pendapatan
                </h2>
                <p className="text-xs text-slate-500 mb-6">
                  Tinjauan mendalam performa penjualan dan pesanan harian
                  merchant.
                </p>
                <RevenueChart />
              </div>
            </div>
          )}

          {currentTab === "maps" && (
            <MapsView
              merchantProfile={merchantProfile}
              activeOrders={activeOrders}
            />
          )}

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

      <DriverRequestModal
        request={currentRequest}
        onAccept={(id) => {
          acceptRequest(id);
        }}
        onReject={(id) => {
          rejectRequest(id);
        }}
        onClose={() =>
          currentRequest && dismissRequest(currentRequest.request_id)
        }
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
