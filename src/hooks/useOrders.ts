import { useState, useEffect } from "react";
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  OrderNotification,
} from "../types";
import {
  fetchOrdersByMerchant,
  updateOrderStatus,
  createOrder,
} from "../services/orderService";
import { decrementMenuStock } from "../services/menuService";
import { supabase, CURRENT_MERCHANT_ID } from "../lib/supabase";
import {
  DbOrder,
  DbOrderWithRelations,
  DbOrderInsert,
  DbOrderItemInsert,
  DbTransactionInsert,
} from "../lib/database.types";

export function mapStatusFromDb(dbStatus: string | null): OrderStatus {
  switch (dbStatus?.toLowerCase()) {
    case 'pending': return 'DISIAPKAN';
    case 'diproses': return 'SEDANG_DIMASAK';
    case 'menunggu_driver': return 'SIAP_DIANTAR';
    case 'diantar': return 'DIANTAR';
    case 'selesai': return 'SELESAI';
    case 'dibatalkan': return 'BATAL';
    default: return dbStatus as OrderStatus || 'DISIAPKAN';
  }
}

export function mapStatusToDb(feStatus: OrderStatus): string {
  switch (feStatus) {
    case 'DISIAPKAN': return 'pending';
    case 'SEDANG_DIMASAK': return 'diproses';
    case 'SIAP_DIANTAR': return 'menunggu_driver';
    case 'DIANTAR': return 'diantar';
    case 'SELESAI': return 'selesai';
    case 'BATAL': return 'dibatalkan';
    default: return feStatus;
  }
}


export function useOrders() {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [orderMetaById, setOrderMetaById] = useState<
    Record<
      string,
      {
        deliveryType?: Order["deliveryType"];
        paymentStatus?: PaymentStatus;
        customerType?: Order["customerType"];
      }
    >
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const normalizePaymentStatus = (value?: string | null): PaymentStatus => {
    const normalized = value?.trim().toUpperCase();

    if (
      normalized === "SUDAH_BAYAR" ||
      normalized === "LUNAS" ||
      normalized === "PAID"
    ) {
      return "SUDAH_BAYAR";
    }

    if (normalized === "REFUNDED" || normalized === "REFUND") {
      return "REFUNDED";
    }

    return "BELUM_BAYAR";
  };

  const pushNotification = (
    orderId: string | number,
    title: string,
    description: string,
    type: OrderNotification["type"] = "new-order",
  ) => {
    const notification: OrderNotification = {
      id: `${orderId}-${Date.now()}`,
      title,
      description,
      time:
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB",
      orderId: String(orderId),
      type,
    };

    setNotifications((prev) => [notification, ...prev].slice(0, 8));
  };

  const applyOrderMeta = (order: Order): Order => {
    const meta = orderMetaById[String(order.order_id)];
    if (!meta) return order;

    return {
      ...order,
      deliveryType: meta.deliveryType ?? order.deliveryType,
      paymentStatus: meta.paymentStatus ?? order.paymentStatus,
      customerType: meta.customerType ?? order.customerType,
    };
  };

  const loadOrders = async () => {
    setIsLoading(true);
    const dbOrders = await fetchOrdersByMerchant(CURRENT_MERCHANT_ID);

    const transformedOrders: Order[] = dbOrders.map((dbOrder) =>
      applyOrderMeta(mapDbOrderToFrontend(dbOrder)),
    );

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

    const channel = supabase
      .channel(`merchant-orders-${CURRENT_MERCHANT_ID}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `merchant_id=eq.${CURRENT_MERCHANT_ID}`,
        },
        (payload) => {
          const insertedOrder = payload.new as DbOrder;
          pushNotification(
            insertedOrder.order_id,
            "Pesanan Baru Masuk!",
            `Order ${insertedOrder.order_id} sedang menunggu diproses.`,
            "new-order",
          );
          loadOrders();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `merchant_id=eq.${CURRENT_MERCHANT_ID}`,
        },
        () => {
          loadOrders();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateOrderStatus = async (
    orderId: string | number,
    newStatus: OrderStatus,
  ) => {
    const stringOrderId = String(orderId);

    let orderToMove: Order | undefined;

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

    await updateOrderStatus(stringOrderId, mapStatusToDb(newStatus));
  };

  const cancelOrder = async (orderId: string | number, reason: string) => {
    await handleUpdateOrderStatus(orderId, "BATAL");
  };

  const addOrder = async (newOrder: Order) => {
    const dbOrderPayload: DbOrderInsert = {
      merchant_id: CURRENT_MERCHANT_ID,
      alamat_pengantaran: newOrder.alamat_pengantaran,
      status_order: mapStatusToDb(newOrder.status_order),
      total_harga: newOrder.total_harga,
      waktu_checkout: newOrder.waktu_checkout,
      latitude_pengantaran: null,
      longitude_pengantaran: null,
      user_id: null,
      driver_id: null,
    };

    const dbItemsPayload: Omit<DbOrderItemInsert, "order_id">[] =
      newOrder.items.map((item) => ({
        menu_id: String(item.menu_id),
        jumlah: item.jumlah,
        harga_saat_itu: item.harga_saat_itu,
        subtotal: item.subtotal,
      }));

    const dbTransactionPayload: Omit<DbTransactionInsert, "order_id"> = {
      payment_type: "CASH",
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
      const customerType = newOrder.customerType ?? "walk-in";
      const paymentStatus = normalizePaymentStatus(newOrder.paymentStatus);
      setOrderMetaById((prev) => ({
        ...prev,
        [created.order_id]: {
          deliveryType: newOrder.deliveryType,
          paymentStatus,
          customerType,
        },
      }));

      pushNotification(
        created.order_id,
        "Pesanan Baru Masuk!",
        `${newOrder.nama || "Pelanggan"} menambahkan pesanan baru.`,
        "new-order",
      );

      await Promise.all(
        newOrder.items.map(async (item) => {
          await decrementMenuStock(String(item.menu_id), item.jumlah);
        }),
      );

      await loadOrders();
    }
  };

  return {
    activeOrders,
    setActiveOrders,
    historyOrders,
    setHistoryOrders,
    notifications,
    addOrder,
    handleUpdateOrderStatus,
    cancelOrder,
    isLoading,
    loadOrders,
  };
}

function mapDbOrderToFrontend(dbOrder: any): Order {
  // Handle transaction which could be array or object
  const transaction = Array.isArray(dbOrder.transaction)
    ? dbOrder.transaction[0]
    : dbOrder.transaction || null;

  // Handle user_profile which could be array or object
  const userProfile = Array.isArray(dbOrder.user_profile)
    ? dbOrder.user_profile[0]
    : dbOrder.user_profile || null;

  // Handle order_item which could be array or object
  const itemsArray = Array.isArray(dbOrder.order_item)
    ? dbOrder.order_item
    : dbOrder.order_item
    ? [dbOrder.order_item]
    : [];

  const mappedItems: OrderItem[] = itemsArray.map((item: any) => {
    const menuObj = Array.isArray(item.menu) ? item.menu[0] : item.menu;
    return {
      order_item_id: item.order_item_id,
      menu_id: item.menu_id,
      jumlah: item.jumlah,
      harga_saat_itu: item.harga_saat_itu,
      subtotal: item.subtotal,
      nama_menu: menuObj?.nama_menu || "Unknown Menu",
      icon: menuObj?.image_url || undefined,
    };
  });

  return {
    order_id: dbOrder.order_id,
    alamat_pengantaran: dbOrder.alamat_pengantaran || "Di Resto",
    status_order: mapStatusFromDb(dbOrder.status_order),
    total_harga: dbOrder.total_harga,
    waktu_checkout: dbOrder.waktu_checkout,
    user_id: dbOrder.user_id || undefined,
    nama: userProfile?.nama || "Pelanggan Walk-in",
    no_hp: userProfile?.no_hp || "-",
    paymentStatus: normalizePaymentStatus(
      transaction?.status_transaksi as string | null,
    ),
    deliveryType: dbOrder.alamat_pengantaran ? "Delivery" : "Takeaway",
    customerType: dbOrder.user_id ? "member" : "walk-in",
    items: mappedItems,
  };
}
