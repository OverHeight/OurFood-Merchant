import React, { useState } from 'react';
import { MenuItem, Order, OrderStatus, PaymentStatus } from '../types';
import { X, Plus, Minus, ShoppingBag, User, Phone, MapPin } from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onAddOrder: (newOrder: Order) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  onAddOrder,
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'Takeaway' | 'Delivery' | 'Dine-In'>('Takeaway');
  const [address, setAddress] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('SUDAH_BAYAR');
  const [selectedCart, setSelectedCart] = useState<{ item: MenuItem; quantity: number; notes: string }[]>([]);

  const handleToggleCartItem = (menu: MenuItem) => {
    const existing = selectedCart.find((c) => c.item.id === menu.id);
    if (existing) {
      setSelectedCart(selectedCart.filter((c) => c.item.id !== menu.id));
    } else {
      setSelectedCart([...selectedCart, { item: menu, quantity: 1, notes: '' }]);
    }
  };

  const handleQuantityChange = (menuId: string, delta: number) => {
    setSelectedCart(
      selectedCart.map((c) => {
        if (c.item.id === menuId) {
          const newQty = Math.max(1, c.quantity + delta);
          return { ...c, quantity: newQty };
        }
        return c;
      })
    );
  };

  const handleNotesChange = (menuId: string, notes: string) => {
    setSelectedCart(
      selectedCart.map((c) => (c.item.id === menuId ? { ...c, notes } : c))
    );
  };

  const totalPrice = selectedCart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || selectedCart.length === 0) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      id: `#ORD-${Math.floor(100000000 + Math.random() * 900000000)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      items: selectedCart.map((c) => ({
        id: c.item.id,
        name: c.item.name,
        quantity: c.quantity,
        price: c.item.price,
        notes: c.notes || undefined,
      })),
      totalPrice,
      status: 'DISIAPKAN',
      paymentStatus,
      time: timeStr,
      createdAt: now.toISOString(),
      deliveryType,
      address: address.trim() || undefined,
    };

    onAddOrder(newOrder);
    onClose();

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setSelectedCart([]);
    setAddress('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#006e2f]" />
            <h3 className="text-lg font-bold text-slate-900">Buat Pesanan Manual</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nama Pemesan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                No. Telepon / Whatsapp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  placeholder="0812xxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Delivery & Payment Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tipe Layanan
              </label>
              <select
                value={deliveryType}
                onChange={(e: any) => setDeliveryType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#006e2f] outline-none"
              >
                <option value="Takeaway">Bawa Pulang (Takeaway)</option>
                <option value="Delivery">Pesan Antar (Delivery)</option>
                <option value="Dine-In">Makan di Tempat (Dine-In)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Status Pembayaran
              </label>
              <select
                value={paymentStatus}
                onChange={(e: any) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#006e2f] outline-none"
              >
                <option value="SUDAH_BAYAR">Sudah Bayar (Lunas)</option>
                <option value="BELUM_BAYAR">Belum Bayar (Cash/Unpaid)</option>
              </select>
            </div>
          </div>

          {deliveryType === 'Delivery' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Alamat Pengiriman
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Jl. Merdeka No. 10..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#006e2f] outline-none"
                />
              </div>
            </div>
          )}

          {/* Menu Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Pilih Item Menu <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
              {menuItems.map((m) => {
                const isSelected = selectedCart.some((c) => c.item.id === m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => handleToggleCartItem(m)}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2.5
                      ${
                        isSelected
                          ? 'bg-emerald-50 border-[#006e2f] text-emerald-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }
                    `}
                  >
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{m.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Rp {new Intl.NumberFormat('id-ID').format(m.price)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cart Quantity Adjustments */}
          {selectedCart.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Item Dipilih ({selectedCart.length})
              </label>
              {selectedCart.map((c) => (
                <div key={c.item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{c.item.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(c.item.id, -1)}
                        className="p-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 w-6 text-center">
                        {c.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(c.item.id, 1)}
                        className="p-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Catatan kustom (misal: pedas, es sedikit)"
                    value={c.notes}
                    onChange={(e) => handleNotesChange(c.item.id, e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Total & Submit Button */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Pembayaran</p>
              <p className="text-lg font-bold text-[#006e2f]">
                Rp {new Intl.NumberFormat('id-ID').format(totalPrice)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!customerName.trim() || selectedCart.length === 0}
                className="px-5 py-2.5 bg-[#006e2f] hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Simpan Pesanan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
