import { useState, useEffect } from "react";
import { Order, OrderItem, OrderStatus, PaymentStatus } from "../types";
import {
  fetchOrdersByMerchant,
  updateOrderStatus,
  createOrder,
} from "../services/orderService";
import { decrementMenuStock } from "../services/menuService";
import { CURRENT_MERCHANT_ID } from "../lib/supabase";
import { DbOrderWithRelations } from "../lib/database.types";

export function useOrders() {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    setIsLoading(true);
    const dbOrders = await fetchOrdersByMerchant(CURRENT_MERCHANT_ID);

    // Transform to frontend format
    const transformedOrders: Order[] = dbOrders.map(mapDbOrderToFrontend);

    // Separate active and history
    const active = transformedOrders.filter(
      (o) => o.status_order !== "SELESAI" && o.status_order !== "BATAL",
    );
    const history = transformedOrders.filter(
      (o) => o.status_order === "SELESAI" || o.status_order === "BATAL",
    );

    setActiveOrders(active);
    setHistoryOrders(history);
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();

    // In a real app, we would also set up Supabase real-time subscription here
    // to listen for new orders from customers.
  }, []);

  const handleUpdateOrderStatus = async (
    orderId: string | number,
    newStatus: OrderStatus,
  ) => {
    // Optimistic UI update
    const stringOrderId = String(orderId);

    let orderToMove: Order | undefined;

    // Check if it's currently active
    const activeIndex = activeOrders.findIndex(
      (o) => String(o.order_id) === stringOrderId,
    );
    if (activeIndex >= 0) {
      orderToMove = { ...activeOrders[activeIndex], status_order: newStatus };
      const newActive = [...activeOrders];

      if (newStatus === "SELESAI" || newStatus === "BATAL") {
        newActive.splice(activeIndex, 1);
        setActiveOrders(newActive);
        setHistoryOrders((prev) => [orderToMove!, ...prev]);
      } else {
        newActive[activeIndex] = orderToMove;
        setActiveOrders(newActive);
      }
    } else {
      // Check if it's in history (less common to update from history, but possible)
      const historyIndex = historyOrders.findIndex(
        (o) => String(o.order_id) === stringOrderId,
      );
      if (historyIndex >= 0) {
        orderToMove = {
          ...historyOrders[historyIndex],
          status_order: newStatus,
        };
        const newHistory = [...historyOrders];

        if (newStatus !== "SELESAI" && newStatus !== "BATAL") {
          newHistory.splice(historyIndex, 1);
          setHistoryOrders(newHistory);
          setActiveOrders((prev) => [orderToMove!, ...prev]);
        } else {
          newHistory[historyIndex] = orderToMove;
          setHistoryOrders(newHistory);
        }
      }
    }

    // Send to Supabase
    await updateOrderStatus(stringOrderId, newStatus);
  };

  const cancelOrder = async (orderId: string | number, reason: string) => {
    await handleUpdateOrderStatus(orderId, "BATAL");
    // Note: In a real app we might want to save the cancel reason somewhere
    // e.g. update `orders` table with a `cancel_reason` column
  };

  const addOrder = async (newOrder: Order) => {
    // Note: This is for manual orders created by merchant.
    // In a real flow, you'd want to create user_profile first if it doesn't exist,
    // but for manual orders we might just leave user_id empty.

    const dbOrderPayload = {
      merchant_id: CURRENT_MERCHANT_ID,
      alamat_pengantaran: newOrder.alamat_pengantaran,
      status_order: newOrder.status_order,
      total_harga: newOrder.total_harga,
      waktu_checkout: newOrder.waktu_checkout,
      latitude_pengantaran: null,
      longitude_pengantaran: null,
      user_id: null,
      driver_id: null,
    };

    const dbItemsPayload = newOrder.items.map((item) => ({
      menu_id: String(item.menu_id),
      jumlah: item.jumlah,
      harga_saat_itu: item.harga_saat_itu,
      subtotal: item.subtotal,
    }));

    const dbTransactionPayload = {
      payment_type: "CASH", // default for manual
      biaya_antar: 0,
      subtotal: newOrder.total_harga,
      diskon: 0,
      pajak: 0,
      status_transaksi: newOrder.paymentStatus || "BELUM_BAYAR",
      total_harga: newOrder.total_harga,
    };

    const created = await createOrder(
      dbOrderPayload,
      dbItemsPayload,
      dbTransactionPayload,
    );

    if (created) {
      // Decrement stock for ordered items
      await Promise.all(
        newOrder.items.map(async (item) => {
          await decrementMenuStock(String(item.menu_id), item.jumlah);
        }),
      );

      // Reload everything to ensure consistency
      await loadOrders();
    }
  };

  return {
    activeOrders,
    setActiveOrders, // Exporting for backward compatibility, but shouldn't be used directly much
    historyOrders,
    setHistoryOrders, // Same
    addOrder,
    handleUpdateOrderStatus,
    cancelOrder,
    isLoading,
    loadOrders,
  };
}

// Helper to map Supabase structure to Frontend structure
function mapDbOrderToFrontend(dbOrder: DbOrderWithRelations): Order {
  // Extract transaction info if exists
  const transaction =
    dbOrder.transaction && dbOrder.transaction.length > 0
      ? dbOrder.transaction[0]
      : null;

  const mappedItems: OrderItem[] = (dbOrder.order_item || []).map((item) => ({
    order_item_id: item.order_item_id,
    menu_id: item.menu_id,
    jumlah: item.jumlah,
    harga_saat_itu: item.harga_saat_itu,
    subtotal: item.subtotal,
    nama_menu: item.menu?.nama_menu || "Unknown Menu",
    icon: item.menu?.image_url || undefined,
  }));

  return {
    order_id: dbOrder.order_id,
    alamat_pengantaran: dbOrder.alamat_pengantaran || "Di Resto",
    status_order: dbOrder.status_order as OrderStatus,
    total_harga: dbOrder.total_harga,
    waktu_checkout: dbOrder.waktu_checkout,

    // User info
    user_id: dbOrder.user_id || undefined,
    nama: dbOrder.user_profile?.nama || "Pelanggan Walk-in",
    no_hp: dbOrder.user_profile?.no_hp || "-",

    // Transaction info
    paymentStatus:
      (transaction?.status_transaksi as PaymentStatus) || "BELUM_BAYAR",
    deliveryType: dbOrder.alamat_pengantaran ? "Delivery" : "Takeaway", // Simple guess for now

    items: mappedItems,
  };
}
