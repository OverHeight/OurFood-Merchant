import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { Package, X, Check } from 'lucide-react';

interface UpdateStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  onUpdate: (menuId: string | number, newStock: number) => void;
}

export const UpdateStockModal: React.FC<UpdateStockModalProps> = ({
  isOpen,
  onClose,
  menuItem,
  onUpdate,
}) => {
  const [stok, setStok] = useState<string>('');

  useEffect(() => {
    if (menuItem) {
      setStok(menuItem.stok.toString());
    }
  }, [menuItem]);

  if (!isOpen || !menuItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedStok = parseInt(stok, 10);
    if (!isNaN(parsedStok) && parsedStok >= 0) {
      onUpdate(menuItem.menu_id, parsedStok);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#006e2f]" />
            <h2 className="text-base font-bold text-slate-900">Update Stok</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-slate-600 mb-4">
            Ubah jumlah stok untuk menu <span className="font-bold text-slate-900">{menuItem.nama_menu}</span>.
          </p>

          <form id="update-stock-form" onSubmit={handleSubmit}>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Jumlah Stok Saat Ini</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                required
                min="0"
                value={stok}
                onChange={(e) => setStok(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#006e2f] outline-none"
              />
            </div>
          </form>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            form="update-stock-form"
            disabled={stok === ''}
            className="px-4 py-2 text-xs font-bold text-white bg-[#006e2f] rounded-xl hover:bg-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
