// Types that match the Supabase database schema exactly

export interface DbMerchant {
  merchant_id: string;
  nama_merchant: string;
  alamat: string;
  no_hp: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  img_url: string | null;
}

export interface DbKategori {
  id: string;
  nama: string;
}

export interface DbMenu {
  menu_id: string;
  merchant_id: string;
  nama_menu: string;
  harga: number;
  status_tersedia: string; // Database has text e.g. "tersedia" or "habis"
  image_url: string | null;
  kategori_id: string;
  deskripsi: string;
  stok: number;
}

export interface DbUserProfile {
  user_id: string;
  nama: string;
  email: string;
  no_hp: string;
  created_at: string;
}

export interface DbOrder {
  order_id: string;
  user_id: string | null;
  merchant_id: string;
  driver_id: string | null;
  alamat_pengantaran: string | null;
  status_order: string;
  total_harga: number;
  waktu_checkout: string;
  latitude_pengantaran: number | null;
  longitude_pengantaran: number | null;
}

export interface DbOrderItem {
  order_item_id: string;
  order_id: string;
  menu_id: string;
  jumlah: number;
  harga_saat_itu: number;
  subtotal: number;
}

export interface DbTransaction {
  transaksi_id: string;
  order_id: string;
  payment_type: string | null;
  biaya_antar: number | null;
  subtotal: number | null;
  diskon: number | null;
  pajak: number | null;
  status_transaksi: string | null;
  total_harga: number;
  created_at: string;
  updated_at: string;
}

export interface DbDriver {
  driver_id: string;
  nama: string;
  no_hp: string;
  status_ketersediaan: string;
  latitude: number | null;
  longitude: number | null;
  updated_at: string;
}

// Insert types (without auto-generated fields)
export type DbMenuInsert = Omit<DbMenu, 'menu_id'>;
export type DbOrderInsert = Omit<DbOrder, 'order_id'>;
export type DbOrderItemInsert = Omit<DbOrderItem, 'order_item_id'>;
export type DbTransactionInsert = Omit<DbTransaction, 'transaksi_id' | 'created_at' | 'updated_at'>;

// Order with nested relations (what we get from joined queries)
export interface DbOrderWithRelations extends DbOrder {
  user_profile?: DbUserProfile | null;
  order_item?: (DbOrderItem & { menu?: DbMenu | null })[];
  transaction?: DbTransaction[];
  driver?: DbDriver | null;
}
