import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChefHat, Store, MapPin, Phone, Image as ImageIcon, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { registerMerchant } from '../services/merchantService';
import { OsmLocationPicker } from '../components/OsmLocationPicker';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [namaMerchant, setNamaMerchant] = useState('');
  const [noHp, setNoHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [latitude, setLatitude] = useState('-6.8868'); // Default Unikom Bandung
  const [longitude, setLongitude] = useState('107.6153');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaMerchant.trim() || !alamat.trim()) {
      setErrorMessage('Nama Restoran dan Alamat Wajib Diisi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await registerMerchant({
      nama_merchant: namaMerchant.trim(),
      no_hp: noHp.trim() || null,
      alamat: alamat.trim(),
      img_url: imgUrl.trim() || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      latitude: parseFloat(latitude) || -6.8868,
      longitude: parseFloat(longitude) || 107.6153,
      status_toko: 'BUKA',
    });

    setIsLoading(false);

    if (result && result.merchant_id) {
      // Save new merchant session
      localStorage.setItem('merchantId', result.merchant_id);
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      setErrorMessage('Gagal mendaftarkan restoran. Silakan periksa koneksi atau coba lagi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fcf8f2] via-[#F1DEC4]/30 to-[#fcf8f2] p-4 relative overflow-hidden antialiased">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-64 -left-64 w-[500px] h-[500px] rounded-full bg-[#F1DEC4]/60 blur-3xl mix-blend-multiply"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-64 -right-64 w-[600px] h-[600px] rounded-full bg-[#BD4444]/10 blur-3xl mix-blend-multiply"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-xl my-6"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 p-6 sm:p-8">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#BD4444] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Login
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <img
              src="/assets/logo.png"
              alt="OurFood Logo"
              className="w-12 h-12 object-contain shrink-0"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Pendaftaran <span className="text-[#BD4444]">Merchant Baru</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Daftarkan restoran Anda dan mulailah menerima pesanan makanan.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold text-center">
              {errorMessage}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nama Restoran / Merchant <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Store className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={namaMerchant}
                  onChange={(e) => setNamaMerchant(e.target.value)}
                  placeholder="Cth: Ayam Geprek Sambal Korek"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#BD4444] focus:ring-2 focus:ring-[#BD4444]/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="Cth: 081234567890"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#BD4444] focus:ring-2 focus:ring-[#BD4444]/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Alamat Lengkap Outlet <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <textarea
                  required
                  rows={2}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Cth: Jl. Dipati Ukur No. 112, Bandung"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#BD4444] focus:ring-2 focus:ring-[#BD4444]/20 outline-none resize-none"
                />
              </div>
            </div>

            {/* Interactive OpenStreetMap Pinpoint Picker */}
            <OsmLocationPicker
              latitude={parseFloat(latitude) || -6.8868}
              longitude={parseFloat(longitude) || 107.6153}
              onChange={(newLat, newLon) => {
                setLatitude(newLat.toString());
                setLongitude(newLon.toString());
              }}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                URL Foto Banner / Outlet
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="url"
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#BD4444] focus:ring-2 focus:ring-[#BD4444]/20 outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Kosongkan untuk menggunakan gambar banner default.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !namaMerchant.trim() || !alamat.trim()}
              className="w-full mt-4 bg-[#BD4444] hover:bg-[#a13838] text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-[#BD4444]/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Mendaftarkan Restoran...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Daftar Restoran Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation Link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Sudah memiliki akun restoran?{' '}
              <Link to="/" className="font-bold text-[#BD4444] hover:underline">
                Login ke Dashboard
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
