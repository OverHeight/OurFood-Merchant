import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChefHat, ArrowRight, Store, MapPin, CheckCircle, Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DbMerchant } from '../lib/database.types';

export default function LoginPage() {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState<DbMerchant[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMerchants() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('merchant')
        .select('*')
        .order('nama_merchant');

      if (error) {
        console.error('Error fetching merchants:', error);
        setErrorMsg('Gagal memuat daftar restoran dari database.');
      } else if (data && data.length > 0) {
        setMerchants(data);
        // Check if there is already a saved merchantId in localStorage
        const savedId = localStorage.getItem('merchantId');
        if (savedId && data.some((m) => m.merchant_id === savedId)) {
          setSelectedMerchantId(savedId);
        } else {
          setSelectedMerchantId(data[0].merchant_id);
        }
      }
      setIsLoading(false);
    }
    fetchMerchants();
  }, []);

  const handleLogin = (e?: React.FormEvent, merchantIdToLogin?: string) => {
    if (e) e.preventDefault();
    const idToUse = merchantIdToLogin || selectedMerchantId;

    if (!idToUse) {
      setErrorMsg('Pilih restoran terlebih dahulu.');
      return;
    }

    // Save merchant ID and authentication flag
    localStorage.setItem('merchantId', idToUse);
    localStorage.setItem('isAuthenticated', 'true');

    // Redirect to Dashboard
    navigate('/dashboard');
  };

  const selectedMerchant = merchants.find((m) => m.merchant_id === selectedMerchantId);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fcf8f2] via-[#F1DEC4]/30 to-[#fcf8f2] p-4 relative overflow-hidden antialiased">
      {/* Background decoration elements */}
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
        className="relative z-10 w-full max-w-xl"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 p-6 sm:p-8">
          {/* Header Branding */}
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <motion.img
              src="/assets/logo.png"
              alt="OurFood Logo"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
              className="w-20 h-20 object-contain mb-3 drop-shadow-md"
            />

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              OurFood <span className="text-[#BD4444]">Merchant</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Portal Manajemen Restoran & Pesanan Makanan
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          {/* Form / Merchant Selector */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pilih Restoran Anda
              </label>

              {isLoading ? (
                <div className="p-8 text-center text-xs font-medium text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  Memuat daftar restoran dari Supabase...
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Select Dropdown */}
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#BD4444] focus:ring-2 focus:ring-[#BD4444]/20 outline-none text-sm font-semibold bg-slate-50 text-slate-900 transition-colors"
                    value={selectedMerchantId}
                    onChange={(e) => setSelectedMerchantId(e.target.value)}
                  >
                    {merchants.map((m) => (
                      <option key={m.merchant_id} value={m.merchant_id}>
                        {m.nama_merchant} ({m.status_toko || 'BUKA'})
                      </option>
                    ))}
                  </select>

                  {/* Visual Merchant Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {merchants.map((m) => {
                      const isSelected = m.merchant_id === selectedMerchantId;
                      return (
                        <div
                          key={m.merchant_id}
                          onClick={() => setSelectedMerchantId(m.merchant_id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? 'bg-[#F1DEC4]/40 border-[#BD4444] shadow-xs ring-1 ring-[#BD4444]'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <img
                            src={
                              m.img_url ||
                              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={m.nama_merchant}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {m.nama_merchant}
                              </p>
                              {isSelected && (
                                <CheckCircle className="w-3.5 h-3.5 text-[#BD4444] shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{m.alamat || 'Bandung'}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Merchant Confirmation Box */}
            {selectedMerchant && (
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#BD4444]" />
                  <span className="text-slate-600 font-medium">Restoran Terpilih:</span>
                  <span className="font-bold text-slate-900">{selectedMerchant.nama_merchant}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedMerchant.status_toko === 'TUTUP'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {selectedMerchant.status_toko || 'BUKA'}
                </span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={!selectedMerchantId || isLoading}
              className="w-full bg-[#BD4444] hover:bg-[#a13838] text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-[#BD4444]/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Register Link Banner */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600 font-medium">
              Belum memiliki akun restoran?{' '}
              <Link to="/register" className="font-bold text-[#BD4444] hover:underline">
                Daftar Merchant Baru
              </Link>
            </p>
          </div>

          {/* Footer Information */}
          <div className="mt-4 text-center text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} OurFood Platform • Database Integrated</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
