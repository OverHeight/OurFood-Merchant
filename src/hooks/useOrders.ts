import { useState, useEffect } from "react";
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  OrderNotification,
  DriverInfo,
  UserAddress,
} from "../types";
import {
  fetchOrdersByMerchant,
  updateOrderStatus,
  createOrder,
  createTransaction,
  updateTransactionStatus,
} from "../services/orderService";
import { decrementMenuStock } from "../services/menuService";
import { supabase, getMerchantId } from "../lib/supabase";
import {
  DbOrder,
  DbOrderInsert,
  DbOrderItemInsert,
  DbTransactionInsert,
} from "../lib/database.types";

export function normalizePaymentStatus(value?: string | null): PaymentStatus {
  const normalized = value?.trim().toUpperCase();

  if (
    normalized === "SUDAH_BAYAR" ||
    normalized === "LUNAS" ||
    normalized === "PAID" ||
    normalized === "SETTLED" ||
    normalized === "SUCCESS"
  ) {
    return "SUDAH_BAYAR";
  }

  if (normalized === "REFUNDED" || normalized === "REFUND") {
    return "REFUNDED";
  }

  return "BELUM_BAYAR";
}

export function useOrders() {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const merchantId = getMerchantId();

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

  const loadOrders = async () => {
    setIsLoading(true);
    const dbOrders = await fetchOrdersByMerchant(merchantId);

    const transformedOrders: Order[] = dbOrders.map((dbOrder) =>
      mapDbOrderToFrontend(dbOrder),
    );

    const active = transformedOrders.filter(
      (o) =>
        o.status_order !== "DELIVERED" &&
        o.status_order !== "CANCELLED_BY_MERCHANT" &&
        o.status_order !== "CANCELLED_BY_USER" &&
        o.status_order !== "DELIVERY_FAILED",
    );

    const history = transformedOrders.filter(
      (o) =>
        o.status_order === "DELIVERED" ||
        o.status_order === "CANCELLED_BY_MERCHANT" ||
        o.status_order === "CANCELLED_BY_USER" ||
        o.status_order === "DELIVERY_FAILED",
    );

    setActiveOrders(active);
    setHistoryOrders(history);
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel(`merchant-orders-live-${merchantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const newOrder = payload.new as any;
          if (!newOrder || !newOrder.merchant_id || newOrder.merchant_id === merchantId) {
            if (payload.eventType === "INSERT") {
              pushNotification(
                newOrder?.order_id || "NEW",
                "Pesanan Baru Masuk!",
                `Pesanan baru sedang menunggu konfirmasi merchant.`,
                "new-order",
              );
            }
            // Trigger loadOrders immediately and after brief delay for relations
            loadOrders();
            setTimeout(() => {
              loadOrders();
            }, 400);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_item",
        },
        () => {
          setTimeout(() => {
            loadOrders();
          }, 300);
        },
      )
      .subscribe((status, err) => {
        console.log(`[Realtime Channel orders] Status:`, status);
        if (err) console.error(`[Realtime Channel error]:`, err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [merchantId]);

  const handleUpdateOrderStatus = async (
    orderId: string | number,
    newStatus: OrderStatus,
    alasanBatal?: string,
  ) => {
    const stringOrderId = String(orderId);

    // Optimistic UI Update
    setActiveOrders((prevActive) => {
      const target = prevActive.find((o) => String(o.order_id) === stringOrderId);
      if (!target) return prevActive;

      const isBecomingHistory =
        newStatus === "DELIVERED" ||
        newStatus === "CANCELLED_BY_MERCHANT" ||
        newStatus === "CANCELLED_BY_USER" ||
        newStatus === "DELIVERY_FAILED";

      if (isBecomingHistory) {
        setHistoryOrders((prevHist) => [
          { ...target, status_order: newStatus, cancelReason: alasanBatal || target.cancelReason },
          ...prevHist,
        ]);
        return prevActive.filter((o) => String(o.order_id) !== stringOrderId);
      }

      return prevActive.map((o) =>
        String(o.order_id) === stringOrderId ? { ...o, status_order: newStatus } : o,
      );
    });

    // DB Update
    const success = await updateOrderStatus(stringOrderId, newStatus);

    if (success) {
      // Task 5: When merchant accepts order (PREPARING), create a transaction record
      if (newStatus === "PREPARING") {
        const orderObj = [...activeOrders, ...historyOrders].find(
          (o) => String(o.order_id) === stringOrderId,
        );
        await createTransaction({
          order_id: stringOrderId,
          user_id: orderObj?.user_id || null,
          merchant_id: merchantId,
          driver_id: orderObj?.driver_id || null,
          total_harga: orderObj?.total_harga || 0,
        });

        // Decrement menu stock for each item in accepted order
        if (orderObj && orderObj.items) {
          await Promise.all(
            orderObj.items.map((item) =>
              decrementMenuStock(String(item.menu_id), item.jumlah)
            )
          );
        }
      }

      // When DELIVERED, set transaction status to SUCCESS
      if (newStatus === "DELIVERED") {
        await updateTransactionStatus(stringOrderId, "SUCCESS");
      }
    } else {
      await loadOrders(); // Revert on failure
    }
  };

  const cancelOrder = async (orderId: string | number, reason: string) => {
    const stringOrderId = String(orderId);
    await supabase
      .from("orders")
      .update({ status_order: "CANCELLED_BY_MERCHANT", alasan_batal: reason })
      .eq("order_id", stringOrderId);

    await loadOrders();
  };

  const addOrder = async (newOrder: Order) => {
    const dbOrderPayload: DbOrderInsert = {
      merchant_id: merchantId,
      status_order: newOrder.status_order || "WAITING_MERCHANT",
      total_harga: newOrder.total_harga,
      waktu_checkout: newOrder.waktu_checkout || new Date().toISOString(),
      user_id: newOrder.user_id || null,
      driver_id: null,
      alasan_batal: null,
      id_alamat: newOrder.id_alamat || null,
    };

    const dbItemsPayload: Omit<DbOrderItemInsert, "order_id">[] =
      newOrder.items.map((item) => ({
        menu_id: String(item.menu_id),
        jumlah: item.jumlah,
        harga_saat_itu: item.harga_saat_itu,
        subtotal: item.subtotal,
      }));

    const dbTransactionPayload: Omit<DbTransactionInsert, "order_id"> = {
      user_id: newOrder.user_id || null,
      merchant_id: merchantId,
      tipe_pembayaran: "CASH",
      biaya_antar: 0,
      subtotal: newOrder.total_harga,
      diskon: 0,
      pajak: 0,
      status_transaksi: "PENDING",
      total_harga: newOrder.total_harga,
    };

    const created = await createOrder(
      dbOrderPayload,
      dbItemsPayload,
      dbTransactionPayload,
    );

    if (created) {
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
  const transaction = Array.isArray(dbOrder.transaction)
    ? dbOrder.transaction[0]
    : dbOrder.transaction || null;

  const userProfile = Array.isArray(dbOrder.user_profile)
    ? dbOrder.user_profile[0]
    : dbOrder.user_profile || null;

  const userAddressObj: UserAddress | null = Array.isArray(dbOrder.user_address)
    ? dbOrder.user_address[0]
    : dbOrder.user_address || null;

  const driverObj: DriverInfo | null = Array.isArray(dbOrder.driver)
    ? dbOrder.driver[0]
    : dbOrder.driver || null;

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
      nama_menu: menuObj?.nama_menu || "Menu",
      image_url: menuObj?.image_url || undefined,
      icon: menuObj?.image_url || undefined,
    };
  });

  const deliveryAddressString =
    userAddressObj?.alamat ||
    (userAddressObj?.catatan ? `${userAddressObj.nama} (${userAddressObj.catatan})` : "Di Resto");

  return {
    order_id: dbOrder.order_id,
    merchant_id: dbOrder.merchant_id,
    user_id: dbOrder.user_id,
    driver_id: dbOrder.driver_id,
    id_alamat: dbOrder.id_alamat,
    alamat_pengantaran: deliveryAddressString,
    user_address: userAddressObj,
    status_order: dbOrder.status_order as OrderStatus,
    total_harga: dbOrder.total_harga || 0,
    waktu_checkout: dbOrder.waktu_checkout || new Date().toISOString(),
    nama: userAddressObj?.nama_penerima || userProfile?.nama || "Pelanggan",
    no_hp: userAddressObj?.no_telp || userProfile?.no_hp || "-",
    paymentStatus: normalizePaymentStatus(
      transaction?.status_transaksi as string | null,
    ),
    deliveryType: dbOrder.id_alamat ? "Delivery" : "Takeaway",
    customerType: dbOrder.user_id ? "member" : "walk-in",
    items: mappedItems,
    cancelReason: dbOrder.alasan_batal || undefined,
    driver: driverObj
      ? {
          driver_id: driverObj.driver_id,
          nama: driverObj.nama,
          no_hp: driverObj.no_hp,
          plat_nomor: driverObj.plat_nomor,
          jenis_kendaraan: driverObj.jenis_kendaraan,
          latitude: driverObj.latitude,
          longitude: driverObj.longitude,
          status_driver: driverObj.status_driver,
        }
      : null,
  };
}
