import { supabase } from '../lib/supabase';
import { DbOrder, DbOrderWithRelations, DbOrderInsert, DbOrderItemInsert, DbTransactionInsert } from '../lib/database.types';

export async function fetchOrdersByMerchant(merchantId: string): Promise<DbOrderWithRelations[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      user_profile(*),
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

export async function updateOrderStatus(orderId: string, newStatus: string): Promise<boolean> {
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

export async function updateTransactionStatus(orderId: string, newStatus: string): Promise<boolean> {
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
  transaction: Omit<DbTransactionInsert, 'order_id'>
): Promise<DbOrder | null> {
  // First insert the order
  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();

  if (orderError || !newOrder) {
    console.error('Error creating order:', orderError);
    return null;
  }

  // Then insert the items
  const itemsWithOrderId = items.map(item => ({
    ...item,
    order_id: newOrder.order_id
  }));
  
  const { error: itemsError } = await supabase
    .from('order_item')
    .insert(itemsWithOrderId);
    
  if (itemsError) {
    console.error('Error adding order items:', itemsError);
    // Ideally we would rollback the order here or use a stored procedure
  }

  // Finally insert the transaction
  const transactionWithOrderId = {
    ...transaction,
    order_id: newOrder.order_id
  };
  
  const { error: transactionError } = await supabase
    .from('transaction')
    .insert(transactionWithOrderId);
    
  if (transactionError) {
    console.error('Error adding transaction:', transactionError);
  }

  return newOrder;
}
