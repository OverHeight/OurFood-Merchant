import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChefHat, ArrowRight, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState<{merchant_id: string, nama_merchant: string}[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState('');

  useEffect(() => {
    const fetchMerchants = async () => {
      const { data } = await supabase.from('merchant').select('merchant_id, nama_merchant');
      if (data && data.length > 0) {
        setMerchants(data);
        setSelectedMerchant(data[0].merchant_id);
      }
    };
    fetchMerchants();
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedMerchant) {
      localStorage.setItem('merchantId', selectedMerchant);
      window.location.href = '/dashboard'; // force reload to update CURRENT_MERCHANT_ID
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-64 -left-64 w-[500px] h-[500px] rounded-full bg-orange-200/50 blur-3xl mix-blend-multiply"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-64 -right-64 w-[600px] h-[600px] rounded-full bg-red-200/50 blur-3xl mix-blend-multiply"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/40 p-8">
          
          <div className="flex flex-col items-center justify-center text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1 
              }}
              className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-6"
            >
              <ChefHat className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              OurFood Merchant
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              Kelola restoran Anda dengan mudah
            </p>
          </div>

          <form className="space-y-4 mb-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Merchant</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white"
                value={selectedMerchant}
                onChange={(e) => setSelectedMerchant(e.target.value)}
              >
                {merchants.map((m) => (
                  <option key={m.merchant_id} value={m.merchant_id}>
                    {m.nama_merchant}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username (opsional)</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-gray-50/50" 
                placeholder="Masukkan username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password (opsional)</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-gray-50/50" 
                placeholder="Masukkan password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Login
            </button>
          </form>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">atau</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLogin()}
              type="button"
              className="w-full relative group overflow-hidden bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 font-semibold py-4 px-6 rounded-2xl shadow-sm transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-lg">Login as Guest</span>
                  <span className="text-xs text-gray-500 font-normal">Akses langsung ke dashboard</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </motion.button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} OurFood. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
