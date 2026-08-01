import { supabase, getMerchantId } from '../lib/supabase';
import {
  DbOrder,
  DbOrderWithRelations,
  DbOrderInsert,
  DbOrderItemInsert,
  DbTransactionInsert,
} from '../lib/database.types';
import { RevenueDataPoint } from '../types';

export async function fetchOrdersByMerchant(
  merchantId: string,
): Promise<DbOrderWithRelations[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      user_profile(*),
      user_address:id_alamat(*),
      order_item(*, menu(nama_menu, image_url)),
      transaction(*),
      driver(*)
    `)
    .eq('merchant_id', merchantId)
    .order('waktu_checkout', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data ?? [];
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .update({ status_order: newStatus })
    .eq('order_id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    return false;
  }
  return true;
}

export async function createTransaction(order: {
  order_id: string;
  user_id?: string | null;
  merchant_id?: string | null;
  driver_id?: string | null;
  total_harga?: number | null;
}): Promise<boolean> {
  try {
    // 1. Check if transaction already exists for this order
    const { data: existing } = await supabase
      .from('transaction')
      .select('transaksi_id')
      .eq('order_id', order.order_id);

    if (existing && existing.length > 0) {
      console.log('[Transaction Service] Transaction already exists for order:', order.order_id);
      return true;
    }

    // 2. Fetch order record from DB if fields are missing
    const { data: orderRows } = await supabase
      .from('orders')
      .select('merchant_id, user_id, driver_id, total_harga')
      .eq('order_id', order.order_id);

    const fullOrder = orderRows?.[0];

    // 3. Resolve user_id (FK to user_profile)
    let targetUserId = order.user_id || fullOrder?.user_id;
    if (!targetUserId) {
      const { data: userProfiles } = await supabase
        .from('user_profile')
        .select('user_id')
        .limit(1);
      targetUserId = userProfiles?.[0]?.user_id || '00000000-0000-0000-0000-000000000001';
    }

    // 4. Resolve driver_id (FK to driver, handling NOT NULL constraint)
    let targetDriverId = order.driver_id || fullOrder?.driver_id || null;
    if (!targetDriverId) {
      const { data: drivers } = await supabase
        .from('driver')
        .select('driver_id')
        .limit(1);
      if (drivers && drivers.length > 0) {
        targetDriverId = drivers[0].driver_id;
      }
    }

    const transactionPayload: any = {
      order_id: order.order_id,
      user_id: targetUserId,
      merchant_id: order.merchant_id || fullOrder?.merchant_id || getMerchantId(),
      driver_id: targetDriverId,
      tipe_pembayaran: 'CASH',
      status_transaksi: 'PENDING',
      subtotal: order.total_harga || fullOrder?.total_harga || 0,
      biaya_antar: 0,
      diskon: 0,
      pajak: 0,
      total_harga: order.total_harga || fullOrder?.total_harga || 0,
    };

    const { data: insertedData, error } = await supabase
      .from('transaction')
      .insert(transactionPayload)
      .select();

    if (error) {
      console.error('[Transaction Service] Error creating transaction:', error);
      return false;
    }

    console.log('[Transaction Service] Transaction inserted successfully:', insertedData);
    return true;
  } catch (e) {
    console.error('[Transaction Service] Exception inserting transaction:', e);
    return false;
  }
}

export async function updateTransactionStatus(
  orderId: string,
  newStatus: string,
): Promise<boolean> {
  const { error } = await supabase
    .from('transaction')
    .update({ status_transaksi: newStatus, updated_at: new Date().toISOString() })
    .eq('order_id', orderId);

  if (error) {
    console.error('Error updating transaction status:', error);
    return false;
  }
  return true;
}

export async function createOrder(
  order: DbOrderInsert,
  items: Omit<DbOrderItemInsert, 'order_id'>[],
  transaction?: Omit<DbTransactionInsert, 'order_id'>,
): Promise<DbOrder | null> {
  try {
    // First insert the order
    const { data: newOrderData, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select();

    const newOrder = newOrderData?.[0];

    if (orderError || !newOrder) {
      console.error('Error creating order:', orderError);
      return null;
    }

    // Then insert the items
    const itemsWithOrderId = items.map((item) => ({
      ...item,
      order_id: newOrder.order_id,
    }));

    const { error: itemsError } = await supabase
      .from('order_item')
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error('Error adding order items, rolling back order:', itemsError);
      await supabase.from('orders').delete().eq('order_id', newOrder.order_id);
      return null;
    }

    // Optionally insert transaction if provided
    if (transaction) {
      const transactionWithOrderId = {
        ...transaction,
        order_id: newOrder.order_id,
      };

      const { error: transactionError } = await supabase
        .from('transaction')
        .insert(transactionWithOrderId);

      if (transactionError) {
        console.error('Error adding transaction:', transactionError);
      }
    }

    return newOrder;
  } catch (err) {
    console.error('Exception during order creation:', err);
    return null;
  }
}

export async function fetchRevenueData(
  merchantId: string,
  period: 'harian' | 'mingguan_ini' | 'mingguan_lalu' | 'bulanan',
): Promise<RevenueDataPoint[]> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('order_id, total_harga, waktu_checkout')
    .eq('merchant_id', merchantId)
    .eq('status_order', 'DELIVERED');

  if (error || !orders) {
    console.error('Error fetching revenue data:', error);
    return [];
  }

  const now = new Date();

  if (period === 'harian') {
    // Group by 4-hour blocks today
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const blocks: Record<string, { amount: number; orderCount: number }> = {
      '08:00': { amount: 0, orderCount: 0 },
      '12:00': { amount: 0, orderCount: 0 },
      '16:00': { amount: 0, orderCount: 0 },
      '20:00': { amount: 0, orderCount: 0 },
    };

    orders.forEach((o) => {
      if (!o.waktu_checkout) return;
      const d = new Date(o.waktu_checkout);
      if (d >= startOfDay) {
        const hour = d.getHours();
        let key = '08:00';
        if (hour >= 20) key = '20:00';
        else if (hour >= 16) key = '16:00';
        else if (hour >= 12) key = '12:00';

        blocks[key].amount += o.total_harga || 0;
        blocks[key].orderCount += 1;
      }
    });

    return Object.entries(blocks).map(([day, val]) => ({
      day,
      amount: val.amount,
      orderCount: val.orderCount,
    }));
  }

  // Days of week mapping (Sen, Sel, Rab, Kam, Jum, Sab, Min)
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  if (period === 'mingguan_ini' || period === 'mingguan_lalu') {
    const currentDay = now.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday);

    const startOfTargetWeek = new Date(startOfThisWeek);
    if (period === 'mingguan_lalu') {
      startOfTargetWeek.setDate(startOfTargetWeek.getDate() - 7);
    }
    const endOfTargetWeek = new Date(startOfTargetWeek);
    endOfTargetWeek.setDate(endOfTargetWeek.getDate() + 7);

    const daysMap: Record<string, { amount: number; orderCount: number }> = {
      Sen: { amount: 0, orderCount: 0 },
      Sel: { amount: 0, orderCount: 0 },
      Rab: { amount: 0, orderCount: 0 },
      Kam: { amount: 0, orderCount: 0 },
      Jum: { amount: 0, orderCount: 0 },
      Sab: { amount: 0, orderCount: 0 },
      Min: { amount: 0, orderCount: 0 },
    };

    orders.forEach((o) => {
      if (!o.waktu_checkout) return;
      const d = new Date(o.waktu_checkout);
      if (d >= startOfTargetWeek && d < endOfTargetWeek) {
        const dayName = daysOfWeek[d.getDay()];
        if (daysMap[dayName]) {
          daysMap[dayName].amount += o.total_harga || 0;
          daysMap[dayName].orderCount += 1;
        }
      }
    });

    return Object.entries(daysMap).map(([day, val]) => ({
      day,
      amount: val.amount,
      orderCount: val.orderCount,
    }));
  }

  // Monthly breakdown by week (Mg 1, Mg 2, Mg 3, Mg 4)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const weeksMap: Record<string, { amount: number; orderCount: number }> = {
    'Mg 1': { amount: 0, orderCount: 0 },
    'Mg 2': { amount: 0, orderCount: 0 },
    'Mg 3': { amount: 0, orderCount: 0 },
    'Mg 4': { amount: 0, orderCount: 0 },
  };

  orders.forEach((o) => {
    if (!o.waktu_checkout) return;
    const d = new Date(o.waktu_checkout);
    if (d >= startOfMonth) {
      const dateNum = d.getDate();
      let key = 'Mg 1';
      if (dateNum > 21) key = 'Mg 4';
      else if (dateNum > 14) key = 'Mg 3';
      else if (dateNum > 7) key = 'Mg 2';

      weeksMap[key].amount += o.total_harga || 0;
      weeksMap[key].orderCount += 1;
    }
  });

  return Object.entries(weeksMap).map(([day, val]) => ({
    day,
    amount: val.amount,
    orderCount: val.orderCount,
  }));
}
