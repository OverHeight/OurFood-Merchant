export type OrderStatus =
  | 'DISIAPKAN'
  | 'SEDANG_DIMASAK'
  | 'SIAP_DIANTAR'
  | 'DIANTAR'
  | 'SELESAI'
  | 'BATAL';

export type PaymentStatus = 'SUDAH_BAYAR' | 'BELUM_BAYAR' | 'REFUNDED';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  icon?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  time: string;
  createdAt: string;
  deliveryType?: 'Takeaway' | 'Delivery' | 'Dine-In';
  address?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Makanan Utama' | 'Minuman' | 'Cemilan' | 'Paket Hemat';
  price: number;
  description: string;
  image: string;
  available: boolean;
  salesCount: number;
}

export interface RevenueDataPoint {
  day: string;
  amount: number;
  orderCount: number;
}

export type NavTab = 'dashboard' | 'menu' | 'orders' | 'reports' | 'profile';

export interface MerchantProfile {
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  isOpen: boolean;
  avatarUrl: string;
  operatingHours: string;
  rating: number;
  totalOrdersThisMonth: number;
}
