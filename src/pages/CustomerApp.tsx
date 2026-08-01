import React, { useState, useEffect } from "react";
import { MenuItem, Order } from "../types";
import { useOrders } from "../hooks/useOrders";
import { fetchMenuByMerchant } from "../services/menuService";
import { getMerchantId } from "../lib/supabase";
import { ShoppingBag, Minus, Plus, UtensilsCrossed } from "lucide-react";

export default function CustomerApp() {
  const { addOrder } = useOrders();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [selectedCart, setSelectedCart] = useState<
    { item: MenuItem; quantity: number; notes: string }[]
  >([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const merchantId = getMerchantId();

  useEffect(() => {
    async function loadMenu() {
      setIsLoadingMenu(true);
      const dbMenu = await fetchMenuByMerchant(merchantId);
      const transformed: MenuItem[] = dbMenu.map((dbItem) => ({
        menu_id: dbItem.menu_id,
        merchant_id: dbItem.merchant_id,
        kategori_id: dbItem.kategori_id || undefined,
        nama_menu: dbItem.nama_menu,
        harga: dbItem.harga,
        status_tersedia: dbItem.status_tersedia === "tersedia",
        image_url: dbItem.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80",
        category: dbItem.kategori?.nama || "Menu Utama",
        stok: dbItem.stok ?? 0,
        description: dbItem.deskripsi || "",
      }));
      setMenuItems(transformed);
      setIsLoadingMenu(false);
    }
    loadMenu();
  }, [merchantId]);

  const handleToggleCartItem = (menu: MenuItem) => {
    const existing = selectedCart.find((c) => c.item.menu_id === menu.menu_id);
    if (existing) {
      setSelectedCart(
        selectedCart.filter((c) => c.item.menu_id !== menu.menu_id),
      );
    } else {
      setSelectedCart([
        ...selectedCart,
        { item: menu, quantity: 1, notes: "" },
      ]);
    }
  };

  const handleQuantityChange = (menuId: string | number, delta: number) => {
    setSelectedCart(
      selectedCart.map((c) => {
        if (c.item.menu_id === menuId) {
          const newQty = Math.max(1, c.quantity + delta);
          return { ...c, quantity: newQty };
        }
        return c;
      }),
    );
  };

  const handleNotesChange = (menuId: string | number, notes: string) => {
    setSelectedCart(
      selectedCart.map((c) =>
        c.item.menu_id === menuId ? { ...c, notes } : c,
      ),
    );
  };

  const totalPrice = selectedCart.reduce(
    (sum, c) => sum + c.item.harga * c.quantity,
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || selectedCart.length === 0) return;

    const now = new Date();

    const newOrder: Order = {
      order_id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      nama: customerName.trim(),
      no_hp: customerPhone.trim() || undefined,
      items: selectedCart.map((c) => ({
        order_item_id: `item-${Date.now()}-${Math.random()}`,
        menu_id: c.item.menu_id,
        nama_menu: c.item.nama_menu,
        jumlah: c.quantity,
        harga_saat_itu: c.item.harga,
        subtotal: c.item.harga * c.quantity,
        notes: c.notes || undefined,
      })),
      total_harga: totalPrice,
      status_order: "WAITING_MERCHANT",
      paymentStatus: "BELUM_BAYAR",
      waktu_checkout: now.toISOString(),
      deliveryType: "Takeaway",
    };

    await addOrder(newOrder);
    setIsSuccess(true);

    setTimeout(() => {
      setCustomerName("");
      setCustomerPhone("");
      setSelectedCart([]);
      setIsSuccess(false);
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-[#677E61] rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            Pesanan Berhasil!
          </h2>
          <p className="text-slate-600 text-xs">
            Pesanan Anda telah dikirim ke Merchant. Silakan tunggu konfirmasi dari restoran.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white p-4 shadow-xs sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200">
        <div className="w-10 h-10 bg-[#BD4444] rounded-xl flex items-center justify-center text-white">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Menu Pelanggan</h1>
          <p className="text-xs text-slate-500">Pilih makanan kesukaanmu</p>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6 mt-4">
        {/* Customer Data */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <h2 className="font-bold text-slate-800 text-sm">Data Pemesan</h2>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Cth: Budi"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#BD4444] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              No Meja / Telepon
            </label>
            <input
              type="text"
              placeholder="Cth: Meja 4 / 0812..."
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#BD4444] outline-none"
            />
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          <h2 className="font-bold text-slate-800 text-sm">Daftar Menu</h2>
          {isLoadingMenu ? (
            <p className="text-xs text-slate-400 text-center py-6">Memuat daftar menu...</p>
          ) : menuItems.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Belum ada menu yang tersedia.</p>
          ) : (
            menuItems.map((m) => {
              const isSelected = selectedCart.some(
                (c) => c.item.menu_id === m.menu_id,
              );
              return (
                <div
                  key={m.menu_id}
                  className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 flex gap-3"
                >
                  <img
                    src={m.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80"}
                    alt={m.nama_menu}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm">{m.nama_menu}</h3>
                      <p className="text-xs text-slate-500">{m.category}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Stok: {m.stok ?? 0}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-bold text-[#BD4444] text-sm">
                        Rp {new Intl.NumberFormat("id-ID").format(m.harga)}
                      </p>
                      <button
                        onClick={() => handleToggleCartItem(m)}
                        disabled={m.stok === 0 || !m.status_tersedia}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-rose-100 text-rose-600"
                            : "bg-emerald-100 text-[#BD4444]"
                        } ${(m.stok === 0 || !m.status_tersedia) ? "opacity-60 cursor-not-allowed bg-slate-100 text-slate-400" : ""}`}
                      >
                        {isSelected ? "Batal" : (m.stok === 0 || !m.status_tersedia) ? "Habis" : "Tambah"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart */}
        {selectedCart.length > 0 && (
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-800 text-sm">
              Keranjang Pesanan ({selectedCart.length})
            </h2>
            {selectedCart.map((c) => (
              <div
                key={c.item.menu_id}
                className="space-y-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">
                    {c.item.nama_menu}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(c.item.menu_id, -1)}
                      className="p-1 bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">
                      {c.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(c.item.menu_id, 1)}
                      className="p-1 bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Catatan (opsional)"
                  value={c.notes}
                  onChange={(e) =>
                    handleNotesChange(c.item.menu_id, e.target.value)
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Checkout */}
      {selectedCart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">Total Harga</p>
              <p className="font-bold text-lg text-[#BD4444]">
                Rp {new Intl.NumberFormat("id-ID").format(totalPrice)}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!customerName.trim()}
              className="flex-1 bg-[#BD4444] text-white font-bold py-3 px-4 rounded-xl shadow-lg disabled:opacity-50 cursor-pointer"
            >
              Pesan Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
