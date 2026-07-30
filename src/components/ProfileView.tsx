import React, { useState } from 'react';
import { MerchantProfile, StoreStatus } from '../types';
import { Store, Save, Power, CheckCircle } from 'lucide-react';

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
            alt={formData.nama_merchant}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-500/20"
          />
          <div>
            <h2 className="text-xl font-bold text-slate-900">{formData.nama_merchant}</h2>
            <p className="text-xs text-slate-500 font-medium">{formData.alamat}</p>
          </div>
        </div>

      </div>

      {/* Form Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
        <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Store className="w-5 h-5 text-[#BD4444]" />
          <span>Informasi & Pengaturan Restoran</span>
        </h3>

        {isSaved && (
          <div className="mb-4 p-3 bg-[#F1DEC4] border border-[#e0ceb5] text-[#a13838] rounded-xl text-xs font-bold flex items-center gap-2">
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
                value={formData.nama_merchant}
                onChange={(e) => setFormData({ ...formData, nama_merchant: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#BD4444] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                No. HP / WhatsApp Merchant
              </label>
              <input
                type="text"
                value={formData.no_hp}
                onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#BD4444] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Alamat Lengkap Outlet
            </label>
            <input
              type="text"
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#BD4444] outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#BD4444] hover:bg-[#a13838] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
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
