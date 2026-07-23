import React, { useState } from 'react';
import { MerchantProfile } from '../types';
import { User, Store, Phone, Mail, MapPin, Clock, Star, Save, Power, CheckCircle } from 'lucide-react';

interface ProfileViewProps {
  merchantProfile: MerchantProfile;
  onUpdateProfile: (updatedProfile: MerchantProfile) => void;
  onToggleStoreStatus: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  merchantProfile,
  onUpdateProfile,
  onToggleStoreStatus,
}) => {
  const [formData, setFormData] = useState<MerchantProfile>(merchantProfile);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Top Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={formData.avatarUrl}
            alt={formData.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-500/20"
          />
          <div>
            <h2 className="text-xl font-bold text-slate-900">{formData.name}</h2>
            <p className="text-xs text-slate-500 font-medium">{formData.address}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {formData.rating}
              </span>
              <span className="text-xs text-slate-500">
                • {formData.totalOrdersThisMonth} pesanan bulan ini
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onToggleStoreStatus}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            formData.isOpen
              ? 'bg-emerald-50 text-[#006e2f] border border-emerald-300 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>Status: {formData.isOpen ? 'Toko Buka' : 'Toko Tutup'}</span>
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
        <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Store className="w-5 h-5 text-[#006e2f]" />
          <span>Informasi & Pengaturan Restoran</span>
        </h3>

        {isSaved && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Perubahan profil merchant berhasil disimpan!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nama Merchant / Toko
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#006e2f] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nama Pemilik / Penanggung Jawab
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#006e2f] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                No. HP / WhatsApp Merchant
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#006e2f] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Jam Operasional
              </label>
              <input
                type="text"
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#006e2f] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Alamat Lengkap Outlet
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#006e2f] outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#006e2f] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
