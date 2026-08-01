import React, { useState } from "react";
import { MenuItem } from "../types";
import {
  UtensilsCrossed,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Tag,
  TrendingUp,
} from "lucide-react";

interface MenuManagementProps {
  menuItems: MenuItem[];
  kategoriList?: { id: string; nama: string }[];
  onToggleStock?: (menuId: string) => void;
  onToggleAvailability?: (menuId: string | number) => void;
  onOpenAddMenu?: () => void;
  onOpenUpdateStock?: (item: MenuItem) => void;
  onUpdateStock?: (item: MenuItem) => void;
  onOpenEditMenu?: (item: MenuItem) => void;
  onEditMenu?: (item: MenuItem) => void;
  onDeleteMenu: (menuId: string) => void;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({
  menuItems,
  kategoriList,
  onToggleStock,
  onToggleAvailability,
  onOpenAddMenu,
  onOpenUpdateStock,
  onUpdateStock,
  onOpenEditMenu,
  onEditMenu,
  onDeleteMenu,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  // Derive categories dynamically from menu items
  const dynamicCategories = Array.from(
    new Set(menuItems.map((item) => item.category || "Uncategorized")),
  );
  const categories = ["Semua", ...dynamicCategories];

  const filteredItems = menuItems
    .filter((item) => {
      const itemCategory = item.category || "Uncategorized";
      const matchesCategory =
        selectedCategory === "Semua" || itemCategory === selectedCategory;
      const matchesSearch = item.nama_menu
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const stockA = a.stok ?? 0;
      const stockB = b.stok ?? 0;
      if (stockA === stockB) {
        return a.nama_menu.localeCompare(b.nama_menu);
      }
      return stockB - stockA;
    });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-[#BD4444]" />
            <span>Manajemen Menu & Stok</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Kelola ketersediaan menu makanan & minuman restoran Anda secara
            realtime.
          </p>
        </div> */}

        {/* Category Pills, Search & Add Menu */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#BD4444] outline-none lg:w-84 sm:w-48 bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedCategory === cat
              ? "bg-[#BD4444] text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Container below Filter */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] mt-2">
        {filteredItems.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <UtensilsCrossed className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Belum Ada Menu di Sini
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              Belum ada menu yang sesuai dengan filter ini. Kamu bisa klik tambah untuk menambah menu pertama kamu!
            </p>
            {onOpenAddMenu && (
              <button
                onClick={onOpenAddMenu}
                className="px-4 py-2 bg-[#BD4444] hover:bg-[#a13838] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Menu</span>
              </button>
            )}
          </div>
        ) : (
          /* Menu Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredItems.map((item) => (
              <div
                key={item.menu_id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:border-emerald-300 transition-all group"
              >
                <div>
                  <div className="relative h-40 w-full rounded-xl overflow-hidden bg-slate-100 mb-3">
                    <img
                      src={item.image_url || "https://via.placeholder.com/150"}
                      alt={item.nama_menu}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#73976A]" /> {item.category}
                    </span>

                    <span
                      className={`absolute top-2 right-2 px-2.5 py-1 text-[10px] font-bold rounded-lg backdrop-blur-xs ${item.status_tersedia
                        ? "bg-[#F1DEC4]0/90 text-white"
                        : "bg-rose-500/90 text-white"
                        }`}
                    >
                      {item.status_tersedia ? "Tersedia" : "Stok Habis"}
                    </span>
                  </div>

                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-base font-bold text-slate-900 pr-2">
                      {item.nama_menu}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => (onEditMenu ? onEditMenu(item) : onOpenEditMenu && onOpenEditMenu(item))}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="text-[10px] font-bold text-rose-600 hover:text-white bg-rose-100 hover:bg-rose-600 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500">
                        Stok: {item.stok ?? 0}
                      </span>
                      <button
                        onClick={() => (onUpdateStock ? onUpdateStock(item) : onOpenUpdateStock && onOpenUpdateStock(item))}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                        title="Edit Stok"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    {(item.stok ?? 0) > 0 && (item.stok ?? 0) <= 5 && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Hampir Habis
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {item.description || "Tidak ada deskripsi"}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-[#677E61]" />
                    <span>Terjual {item.salesCount || 0}x</span>
                  </div>

                  {/* Stock Switcher Button */}
                  <button
                    onClick={() => (onToggleAvailability ? onToggleAvailability(item.menu_id) : onToggleStock && onToggleStock(String(item.menu_id)))}
                    disabled={item.stok === 0}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${item.stok === 0
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : item.status_tersedia
                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                        : "bg-[#F1DEC4] text-[#BD4444] hover:bg-[#e0ceb5] border border-[#e0ceb5]"
                      }`}
                  >
                    {item.status_tersedia ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Set Habis</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Set Tersedia</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Hapus Menu?</h3>
            <p className="text-center text-slate-500 text-sm mb-6">
              Apakah Anda yakin ingin menghapus <span className="font-bold text-slate-700">"{itemToDelete.nama_menu}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteMenu(String(itemToDelete.menu_id));
                  setItemToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/30 transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
