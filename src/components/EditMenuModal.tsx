import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { UtensilsCrossed, X, Save, Image as ImageIcon } from 'lucide-react';

interface EditMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (menuId: string, updates: Partial<MenuItem>) => void;
  categories: { id: string; nama: string }[];
  menuItem: MenuItem | null;
}

export const EditMenuModal: React.FC<EditMenuModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  categories,
  menuItem,
}) => {
  const [namaMenu, setNamaMenu] = useState('');
  const [kategori, setKategori] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (menuItem && isOpen) {
      setNamaMenu(menuItem.nama_menu);
      setKategori(menuItem.category || categories[0]?.nama || 'Makanan Utama');
      setHarga(menuItem.harga.toString());
      setStok(menuItem.stok?.toString() || '0');
      setDeskripsi(menuItem.description || '');
      setImage(menuItem.image_url || '');
    }
  }, [menuItem, isOpen, categories]);

  if (!isOpen || !menuItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaMenu || !harga || !menuItem) return;

    onEdit(menuItem.menu_id, {
      nama_menu: namaMenu,
      category: kategori,
      harga: parseInt(harga, 10),
      description: deskripsi,
      stok: parseInt(stok, 10) || 0,
      image_url: image || null,
      status_tersedia: parseInt(stok, 10) > 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-[#BD4444]" />
            <h2 className="text-lg font-bold text-slate-900">Edit Menu</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form id="add-menu-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Menu *</label>
              <input
                type="text"
                required
                value={namaMenu}
                onChange={(e) => setNamaMenu(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#BD4444] outline-none"
                placeholder="Misal: Nasi Goreng Spesial"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kategori *</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#BD4444] outline-none bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.nama}>
                      {cat.nama}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <option value="Makanan Utama">Makanan Utama</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Harga (Rp) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#BD4444] outline-none"
                  placeholder="25000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stok Awal *</label>
              <input
                type="number"
                required
                min="0"
                value={stok}
                onChange={(e) => setStok(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#BD4444] outline-none"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Deskripsi</label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#BD4444] outline-none resize-none"
                placeholder="Jelaskan menu ini..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL Gambar</label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#BD4444] outline-none"
                  placeholder="https://..."
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Kosongkan untuk menggunakan gambar bawaan.</p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            form="add-menu-form"
            disabled={!namaMenu || !harga}
            className="px-4 py-2 text-sm font-bold text-white bg-[#BD4444] rounded-xl hover:bg-[#a13838] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
