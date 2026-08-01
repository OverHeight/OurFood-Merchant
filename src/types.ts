export type OrderStatus =
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

export type PaymentStatus = 'SUDAH_BAYAR' | 'BELUM_BAYAR' | 'REFUNDED';
export type CustomerType = 'walk-in' | 'member' | 'guest';

export type StoreStatus = 'BUKA' | 'TUTUP' | 'TIDAK_MENERIMA';

export interface UserAddress {
  id: string;
  user_id: string;
  nama: string;
  nama_penerima: string;
  no_telp: string;
  latitude?: number | null;
  longitude?: number | null;
  alamat: string;
  catatan?: string | null;
}

export interface DriverInfo {
  driver_id: string;
  nama: string;
  no_hp?: string | null;
  plat_nomor?: string | null;
  jenis_kendaraan?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status_driver?: string | null;
}

export interface OrderItem {
  order_item_id: number | string;
  menu_id: number | string;
  jumlah: number;
  harga_saat_itu: number;
  subtotal: number;
  // UI additions
  nama_menu?: string;
  notes?: string;
  icon?: string;
  image_url?: string;
}

export interface Order {
  order_id: string;
  status_order: OrderStatus;
  total_harga: number;
  waktu_checkout: string;
  user_id?: string;
  merchant_id?: string;
  driver_id?: string;
  nama?: string;
  no_hp?: string;
  id_alamat?: string | null;
  alamat_pengantaran?: string; // Derived from user_address.alamat
  user_address?: UserAddress | null;
  paymentStatus?: PaymentStatus;
  deliveryType?: 'Takeaway' | 'Delivery' | 'Dine-In';
  customerType?: CustomerType;
  items: OrderItem[];
  cancelReason?: string;
  driver?: DriverInfo | null;
}

export interface Transaction {
  transaksi_id: string;
  order_id: string;
  user_id?: string | null;
  merchant_id?: string | null;
  driver_id?: string | null;
  tipe_pembayaran?: string | null;
  biaya_antar?: number | null;
  subtotal?: number | null;
  diskon?: number | null;
  pajak?: number | null;
  status_transaksi?: string | null;
  total_harga?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MenuItem {
  menu_id: string;
  merchant_id?: string;
  kategori_id?: string;
  nama_menu: string;
  harga: number;
  status_tersedia: boolean;
  stok?: number;
  category?: string; // Fetched from kategori table
  description?: string;
  image_url?: string;
  salesCount?: number;
}

export interface MerchantProfile {
  merchant_id: string;
  nama_merchant: string;
  alamat: string;
  no_hp: string;
  latitude?: number | null;
  longitude?: number | null;
  storeStatus?: StoreStatus;
  avatarUrl?: string; // Map from img_url
  rating?: number;
  totalOrdersThisMonth?: number;
}

export interface RevenueDataPoint {
  day: string;
  amount: number;
  orderCount: number;
}

export interface Review {
  review_id: string;
  order_id: string;
  user_id?: string;
  merchant_id?: string;
  nama_pelanggan: string;
  avatar_url?: string;
  rating: number; // 1-5
  komentar: string;
  nama_menu?: string;
  waktu: string;
  img_url?: string;
  dibalas?: boolean;
}

export interface OrderNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  orderId: string;
  type: 'new-order' | 'order-updated';
}

export type NavTab =
  | 'dashboard'
  | 'menu'
  | 'orders'
  | 'reports'
  | 'profile'
  | 'maps'
  | 'reviews';
