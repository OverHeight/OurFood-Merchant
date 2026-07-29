export type OrderStatus =
  | 'DISIAPKAN'
  | 'SEDANG_DIMASAK'
  | 'SIAP_DIANTAR'
  | 'DIANTAR'
  | 'SELESAI'
  | 'BATAL';

export type PaymentStatus = 'SUDAH_BAYAR' | 'BELUM_BAYAR' | 'REFUNDED';

export type StoreStatus = 'BUKA' | 'TUTUP' | 'TIDAK_MENERIMA';

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
}

export interface Order {
  order_id: number | string;
  alamat_pengantaran: string;
  status_order: OrderStatus;
  total_harga: number;
  waktu_checkout: string;
  // ERD User fields (embedded here for convenience as discussed)
  user_id?: number;
  nama?: string;
  no_hp?: string;
  // UI additions
  paymentStatus: PaymentStatus;
  deliveryType?: 'Takeaway' | 'Delivery' | 'Dine-In';
  items: OrderItem[];
  cancelReason?: string;
}

export interface MenuItem {
  menu_id: number | string;
  merchant_id?: number | string;
  nama_menu: string;
  harga: number;
  status_tersedia: boolean;
  stok: number;
  // UI additions
  category: 'Makanan Utama' | 'Minuman' | 'Cemilan' | 'Paket Hemat';
  description: string;
  image: string;
  salesCount: number;
}

export interface MerchantProfile {
  merchant_id: number | string;
  order_id?: number | string; // FK from ERD
  menu_id?: number | string; // FK from ERD
  nama_merchant: string;
  alamat: string;
  no_hp: string;
  // UI additions
  storeStatus: StoreStatus;
  avatarUrl: string;
  rating: number;
  totalOrdersThisMonth: number;
}

export interface RevenueDataPoint {
  day: string;
  amount: number;
  orderCount: number;
}

export interface Review {
  review_id: string;
  order_id: string;
  nama_pelanggan: string;
  avatar_url?: string;
  rating: number; // 1-5
  komentar: string;
  nama_menu: string;
  waktu: string;
  dibalas?: boolean;
}

export interface DriverRequest {
  request_id: string;
  order_id: string;
  nama_driver: string;
  avatar_url: string;
  rating_driver: number;
  nomor_kendaraan: string;
  jarak_km: number;
  expires_at: number; // timestamp ms
}

export type NavTab = 'dashboard' | 'menu' | 'orders' | 'reports' | 'profile' | 'maps' | 'reviews';
