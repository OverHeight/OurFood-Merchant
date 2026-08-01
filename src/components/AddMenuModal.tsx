import React, { useState } from 'react';
import { MenuItem } from '../types';
import { UtensilsCrossed, X, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { uploadMenuImage } from '../services/menuService';

interface AddMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<MenuItem, 'menu_id' | 'salesCount'>) => void;
  categories: { id: string; nama: string }[];
}

export const AddMenuModal: React.FC<AddMenuModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories,
}) => {
  const [namaMenu, setNamaMenu] = useState('');
  const [kategori, setKategori] = useState('Makanan Utama');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('10');
  const [deskripsi, setDeskripsi] = useState('');
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaMenu || !harga) return;

    onAdd({
      nama_menu: namaMenu,
      category: kategori,
      harga: parseInt(harga, 10),
      description: deskripsi,
      stok: parseInt(stok, 10) || 0,
      image_url: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      status_tersedia: parseInt(stok, 10) > 0,
    });

    // Reset
    setNamaMenu('');
    setKategori(categories.length > 0 ? categories[0].nama : 'Makanan Utama');
    setHarga('');
    setStok('10');
    setDeskripsi('');
    setImage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-[#BD4444]" />
            <h2 className="text-lg font-bold text-slate-900">Tambah Menu Baru</h2>
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
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gambar Menu</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      const uploadedUrl = await uploadMenuImage(file);
                      if (uploadedUrl) {
                        setImage(uploadedUrl);
                      }
                      setIsUploading(false);
                    }}
                    className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#BD4444]/10 file:text-[#BD4444] hover:file:bg-[#BD4444]/20 cursor-pointer"
                  />
                  {isUploading && (
                    <span className="text-xs font-bold text-[#BD4444] animate-pulse">
                      Mengunggah...
                    </span>
                  )}
                </div>

                <div className="relative">
                  <ImageIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#BD4444] outline-none"
                    placeholder="Atau masukkan URL gambar (https://...)"
                  />
                </div>
                {image && (
                  <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
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
            <PlusCircle className="w-4 h-4" />
            Simpan Menu
          </button>
        </div>
      </div>
    </div>
  );
};
