import React, { useState } from 'react';
import { MenuItem } from '../types';
import { UtensilsCrossed, Plus, Search, CheckCircle, XCircle, Tag, TrendingUp } from 'lucide-react';

interface MenuManagementProps {
  menuItems: MenuItem[];
  onToggleStock: (menuId: string) => void;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({
  menuItems,
  onToggleStock,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Semua', 'Makanan Utama', 'Minuman', 'Cemilan'];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-[#006e2f]" />
            <span>Manajemen Menu & Stok</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Kelola ketersediaan menu makanan & minuman restoran Anda secara realtime.
          </p>
        </div>

        {/* Category Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#006e2f] outline-none w-full sm:w-48 bg-slate-50"
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#006e2f] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:border-emerald-300 transition-all group"
          >
            <div>
              <div className="relative h-40 w-full rounded-xl overflow-hidden bg-slate-100 mb-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-400" /> {item.category}
                </span>

                <span
                  className={`absolute top-2 right-2 px-2.5 py-1 text-[10px] font-bold rounded-lg backdrop-blur-xs ${
                    item.available
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-rose-500/90 text-white'
                  }`}
                >
                  {item.available ? 'Tersedia' : 'Stok Habis'}
                </span>
              </div>

              <div className="flex justify-between items-start mb-1">
                <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                <span className="text-sm font-extrabold text-[#006e2f]">
                  Rp {new Intl.NumberFormat('id-ID').format(item.price)}
                </span>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terjual {item.salesCount}x</span>
              </div>

              {/* Stock Switcher Button */}
              <button
                onClick={() => onToggleStock(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  item.available
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    : 'bg-emerald-50 text-[#006e2f] hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {item.available ? (
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
    </div>
  );
};
