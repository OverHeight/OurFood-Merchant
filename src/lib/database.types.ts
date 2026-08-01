// Types that match the Supabase database schema exactly

export type DbStatusToko = 'BUKA' | 'TUTUP' | 'TIDAK_MENERIMA';

export type DbOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_FAILED'
  | 'WAITING_MERCHANT'
  | 'CANCELLED_BY_MERCHANT'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'SEARCHING_DRIVER'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVED'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'CANCELLED_BY_USER'
  | 'DELIVERY_FAILED';

export type DbPaymentTypes = 'CASH' | 'QRIS' | 'TRANSFER';

export type DbTransactionStatus = 'PENDING' | 'SETTLED' | 'SUCCESS' | 'FAILED' | 'EXPIRED';

export type DbStatusDriver = 'AVAILABLE' | 'OFFLINE' | 'BUSY';

export type DbKendaraanTypes = 'MOTOR' | 'MOBIL' | 'SEPEDA' | 'LAINNYA';

export interface DbMerchant {
  merchant_id: string;
  nama_merchant: string;
  alamat: string | null;
  no_hp: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
  img_url: string | null;
  status_toko?: DbStatusToko | null;
}

export interface DbMerchantInsert {
  merchant_id?: string;
  nama_merchant: string;
  alamat?: string | null;
  no_hp?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string | null;
  img_url?: string | null;
  status_toko?: DbStatusToko | null;
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
  status_tersedia: string | null; // e.g. "tersedia" or "habis"
  image_url: string | null;
  kategori_id: string | null;
  deskripsi: string | null;
  stok: number | null;
}

export interface DbUserProfile {
  user_id: string;
  nama: string;
  email: string;
  no_hp: string | null;
  created_at: string | null;
}

export interface DbUserAddress {
  id: string;
  user_id: string;
  nama: string;
  nama_penerima: string;
  no_telp: string;
  latitude: number | null;
  longitude: number | null;
  alamat: string;
  catatan: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DbOrder {
  order_id: string;
  user_id: string | null;
  merchant_id: string | null;
  driver_id: string | null;
  status_order: DbOrderStatus;
  total_harga: number | null;
  waktu_checkout: string | null;
  alasan_batal: string | null;
  id_alamat: string | null;
}

export interface DbOrderItem {
  order_item_id: string;
  order_id: string;
  menu_id: string | null;
  jumlah: number;
  harga_saat_itu: number;
  subtotal: number;
}

export interface DbTransaction {
  transaksi_id: string;
  order_id: string;
  user_id?: string | null;
  merchant_id?: string | null;
  driver_id?: string | null;
  biaya_antar?: number | null;
  subtotal?: number | null;
  diskon?: number | null;
  pajak?: number | null;
  total_harga?: number | null;
  tipe_pembayaran?: DbPaymentTypes | null;
  status_transaksi?: DbTransactionStatus | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DbDriver {
  driver_id: string;
  nama: string;
  no_hp: string | null;
  status_driver?: DbStatusDriver | null;
  latitude: number | null;
  longitude: number | null;
  updated_at: string | null;
  plat_nomor?: string | null;
  email?: string | null;
  jenis_kendaraan?: DbKendaraanTypes | null;
}

export interface DbReviewMerchant {
  review_id: string;
  order_id: string;
  user_id: string;
  merchant_id: string;
  rating: number;
  komentar: string | null;
  img_url: string | null;
  created_at: string | null;
}

// Insert types (without auto-generated fields)
export type DbMenuInsert = Omit<DbMenu, 'menu_id'>;
export type DbOrderInsert = Omit<DbOrder, 'order_id'>;
export type DbOrderItemInsert = Omit<DbOrderItem, 'order_item_id'>;
export type DbTransactionInsert = Omit<DbTransaction, 'transaksi_id' | 'created_at' | 'updated_at'>;

// Order with nested relations (what we get from joined queries)
export interface DbOrderWithRelations extends DbOrder {
  merchant?: DbMerchant | null;
  user_profile?: DbUserProfile | null;
  user_address?: DbUserAddress | null;
  order_item?: (DbOrderItem & { menu?: DbMenu | null })[];
  transaction?: DbTransaction[];
  driver?: DbDriver | null;
}
